// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Gate is Ownable {
    error SignatureInvalidV();

    struct Bridge {
        address fromToken;
        string toToken;
    }

    struct Swap {
        address fromToken;
        string toToken;
        address sender;
        string recipient;
        uint256 amount;
        uint256 nonce;
        uint256 endtime;
        bool withdrawn;
        bool refunded;
        bytes signature;
    }

    event FundEvent(
        bytes32 indexed swapId,
        address fromToken,
        string toToken,
        address indexed sender,
        string indexed recipient,
        uint256 amount,
        uint256 nonce
    );

    event FundCancelEvent(
        bytes32 indexed swapId
    );

    event NewOracleEvent(address indexed oracle);
    event SwapSigned(
        bytes32 indexed swapId,
        bytes signature
    );

    event NewBridge(
        address fromToken,
        string toToken
    );

    event RemoveBridge(
        address fromToken,
        string toToken
    );

    address oracle;

    mapping(bytes32 => Swap) swaps;
    mapping(bytes32 => Bridge) bridges;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    modifier futureEndtime(uint256 endtime) {
        require(
            endtime > block.timestamp,
            "endtime time must be in the future"
        );
        _;
    }

    modifier withdrawable(bytes32 swapId) {
        require(
            swaps[swapId].withdrawn == false,
            "withdrawable: already withdrawn"
        );
        require(
            swaps[swapId].refunded == false,
            "withdrawable: already refunded"
        );
        _;
    }

    modifier refundable(bytes32 swapId) {
        require(
            swaps[swapId].sender == _msgSender(),
            "refundable: not sender"
        );
        require(
            swaps[swapId].refunded == false,
            "refundable: already refunded"
        );
        require(
            swaps[swapId].withdrawn == false,
            "refundable: already withdrawn"
        );
        require(
            swaps[swapId].endtime <= block.timestamp,
            "refundable: endtime not yet passed"
        );
        _;
    }

    modifier isSwapExists(bytes32 swapId) {
        require(
            haveSwap(swapId),
            "swap does not exist"
        );
        _;
    }

    function fund(
        address fromToken,
        string memory toToken,
        string memory recipient,
        uint256 amount,
        uint256 nonce,
        uint256 endtime
    )
        external
        futureEndtime(endtime)
        returns (bytes32 res)
    {
        bytes32 bridgeId = getBridgeId(fromToken, toToken);
        if (haveBridge(bridgeId) == false) revert("this bridge does not exists");

        bytes32 swapId = sha256(
            abi.encodePacked(
                fromToken,
                sha256(abi.encodePacked(toToken)),
                _msgSender(),
                sha256(abi.encodePacked(recipient)),
                sha256(abi.encodePacked(Strings.toString(amount))),
                sha256(abi.encodePacked(Strings.toString(nonce)))
            )
        );

        if (haveSwap(swapId)) revert("this swap already exists");

        if (!IERC20(fromToken).transferFrom(_msgSender(), address(this), amount))
            revert("transferFrom sender to this failed");

        swaps[swapId] = Swap(fromToken, toToken, _msgSender(), recipient, amount, nonce, endtime, false, false, "");

        emit FundEvent(swapId, fromToken, toToken, _msgSender(), recipient, amount, nonce);

        return swapId;
    }

    function fundCancel(bytes32 swapId)
        external
        isSwapExists(swapId)
        refundable(swapId)
        returns (bool)
    {
        Swap storage swap = swaps[swapId];

        swap.refunded = true;
        IERC20(swap.fromToken).transfer(
            swap.sender,
            swap.amount
        );
        emit FundCancelEvent(swapId);

        return true;
    }

    function sign(bytes32 swapId, bytes memory signature)
        external
        isSwapExists(swapId)
        withdrawable(swapId)
    {
        (bytes32 r, bytes32 s, uint8 v) = parseSignature(signature);

        address signer = ecrecover(getUnsignedMsg(swapId), v, r, s);
        if (signer != oracle) {
            revert SignatureInvalidV();
        }
        swaps[swapId].signature = signature;
        swaps[swapId].withdrawn = true;
        emit SwapSigned(swapId, signature);
    }

    function haveSwap(bytes32 swapId) internal view returns (bool exists) {
        exists = (swaps[swapId].sender != address(0));
    }

    function getSwap(bytes32 swapId)
        public
        view
        returns (
            bytes32 id,
            address fromToken,
            string memory toToken,
            address sender,
            string memory recipient,
            uint256 amount,
            uint256 nonce,
            uint256 endtime,
            bool withdrawn,
            bool refunded,
            bytes memory signature
        )
    {
        if (haveSwap(swapId) == false)
            return (0, address(0), "", address(0), "", 0, 0, 0, false, false, "");

        Swap storage swap = swaps[swapId];

        return (
            swapId,
            swap.fromToken,
            swap.toToken,
            swap.sender,
            swap.recipient,
            swap.amount,
            swap.nonce,
            swap.endtime,
            swap.withdrawn,
            swap.refunded,
            swap.signature
        );
    }

    function parseSignature(bytes memory _signature)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := and(mload(add(_signature, 65)), 0xff)
        }

        if (v < 27) v += 27;
        if (v != 27 && v != 28) revert SignatureInvalidV();
    }

    function getUnsignedMsg(bytes32 data) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", data));
    }

    // oracle features
    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
        emit NewOracleEvent(oracle);
    }

    function getOracle() public view returns(address oracleAddress) {
        return oracle;
    }

    // bridge
    function getBridgeId(address fromToken, string memory toToken) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            fromToken,
            toToken
        ));
    }

    function haveBridge(bytes32 bridgeId) public view returns (bool exists) {
        exists = (bridges[bridgeId].fromToken != address(0));
    }

    function addBridge(address fromToken, string memory toToken)
        external
        onlyOwner
    {
        bytes32 bridgeId = getBridgeId(fromToken, toToken);
        if (haveBridge(bridgeId)) revert("this bridge already exists");
        bridges[bridgeId] = Bridge(fromToken, toToken);
        emit NewBridge(fromToken, toToken);
    }

    function removeBridge(address fromToken, string memory toToken)
        external
        onlyOwner
    {
        bytes32 bridgeId = getBridgeId(fromToken, toToken);
        if (haveBridge(bridgeId) == false) revert("this bridge does not exist");
        delete bridges[bridgeId];
        emit RemoveBridge(fromToken, toToken);
    }
}
