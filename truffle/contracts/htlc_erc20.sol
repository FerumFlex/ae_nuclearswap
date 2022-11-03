// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Hash Time Lock Contract (HTLC) IERC20
 *
 * @author Meheret Tesfaye Batu <meherett@zoho.com>
 *
 * HTLC -> A Hash Time Lock Contract is essentially a type of payment in which two people
 * agree to a financial arrangement where one party will pay the other party a certain amount
 * of cryptocurrencies, such as Bitcoin or Ethereum assets.
 * However, because these contracts are Time-Locked, the receiving party only has a certain
 * amount of time to accept the payment, otherwise the money can be returned to the sender.
 *
 * Hash-Locked -> A Hash locked functions like “two-factor authentication” (2FA). It requires
 * the intended recipient to provide the correct secret passphrase to withdraw the funds.
 *
 * Time-Locked -> A Time locked adds a “timeout” expiration date to a payment. It requires
 * the intended recipient to claim the funds prior to the expiry. Otherwise, the transaction
 * defaults to enabling the original sender of funds to withdraw a refund.
 */
contract HTLC_ERC20 is Ownable {
    struct LockContract {
        address token;
        bytes32 secret_hash;
        address payable recipient;
        address payable sender;
        uint256 endtime;
        uint256 amount;
        bool withdrawn;
        bool refunded;
        string preimage;
    }

    mapping(bytes32 => LockContract) locked_contracts;
    mapping(address => bytes32[]) fund_pendings;
    mapping(address => bytes32[]) withdraw_pendings;

    mapping(address => uint256) token_balances;
    mapping(address => uint256) pending_token_balances;

    event log_fund(
        bytes32 indexed locked_contract_id,
        address token,
        bytes32 secret_hash,
        address indexed recipient,
        address indexed sender,
        uint256 endtime,
        uint256 amount
    );
    event log_fund_confirm(bytes32 indexed locked_contract_id);
    event log_fund_cancel(bytes32 indexed locked_contract_id);

    event log_withdraw(
        bytes32 indexed locked_contract_id,
        address token,
        bytes32 secret_hash,
        address indexed recipient,
        address indexed sender,
        uint256 endtime,
        uint256 amount
    );
    event log_withdraw_confirm(bytes32 indexed locked_contract_id);
    event log_withdraw_cancel(bytes32 indexed locked_contract_id);

    modifier is_token_transferable(
        address token,
        address sender,
        uint256 amount
    ) {
        require(amount > 0, "token amount must be > 0");
        require(
            IERC20(token).allowance(sender, address(this)) >= amount,
            "token allowance must be >= amount"
        );
        _;
    }
    modifier future_endtime(uint256 endtime) {
        require(
            endtime > block.timestamp,
            "endtime time must be in the future"
        );
        _;
    }
    modifier is_locked_contract_exist(bytes32 locked_contract_id) {
        require(
            have_locked_contract(locked_contract_id),
            "locked_contract_id does not exist"
        );
        _;
    }
    modifier check_secret_hash_matches(
        bytes32 locked_contract_id,
        string memory preimage
    ) {
        require(
            locked_contracts[locked_contract_id].secret_hash ==
                sha256(abi.encodePacked(preimage)),
            "secret hash hash does not match"
        );
        _;
    }
    modifier withdrawable(bytes32 locked_contract_id) {
        require(
            locked_contracts[locked_contract_id].recipient == msg.sender,
            "withdrawable: not recipient"
        );
        require(
            locked_contracts[locked_contract_id].withdrawn == false,
            "withdrawable: already withdrawn"
        );
        require(
            locked_contracts[locked_contract_id].refunded == false,
            "withdrawable: already refunded"
        );
        _;
    }
    modifier refundable(bytes32 locked_contract_id) {
        require(
            locked_contracts[locked_contract_id].sender == msg.sender,
            "refundable: not sender"
        );
        require(
            locked_contracts[locked_contract_id].refunded == false,
            "refundable: already refunded"
        );
        require(
            locked_contracts[locked_contract_id].withdrawn == false,
            "refundable: already withdrawn"
        );
        require(
            locked_contracts[locked_contract_id].endtime <= block.timestamp,
            "refundable: endtime not yet passed"
        );
        _;
    }

    /**
     * @dev Sender sets up a new Hash Time Lock Contract (HTLC) and depositing the IERC20 token.
     *
     * @param token IERC20 Token contract address.
     * @param secret_hash A sha256 secret hash.
     * @param recipient Recipient account of the IERC20 token.
     * @param sender Sender account of the IERC20 token.
     * @param endtime The timestamp that the lock expires at.
     * @param amount Amount of the token to lock up.
     *
     * @return locked_contract_id of the new HTLC.
     */
    function fund(
        address token,
        bytes32 secret_hash,
        address payable recipient,
        address payable sender,
        uint256 endtime,
        uint256 amount
    )
        external
        is_token_transferable(token, msg.sender, amount)
        future_endtime(endtime)
        returns (bytes32 locked_contract_id)
    {
        require(
            msg.sender == sender,
            "msg.sender must be same with sender address"
        );

        locked_contract_id = sha256(
            abi.encodePacked(
                token,
                secret_hash,
                recipient,
                sender,
                endtime,
                amount
            )
        );

        if (have_locked_contract(locked_contract_id))
            revert("this locked contract already exists");

        if (!IERC20(token).transferFrom(sender, address(this), amount))
            revert("transferFrom sender to this failed");

        locked_contracts[locked_contract_id] = LockContract(
            token,
            secret_hash,
            recipient,
            sender,
            endtime,
            amount,
            false,
            false,
            ""
        );
        fund_pendings[sender].push(locked_contract_id);

        emit log_fund(
            locked_contract_id,
            token,
            secret_hash,
            recipient,
            sender,
            endtime,
            amount
        );
        return locked_contract_id;
    }

    function withdraw(
        address token,
        bytes32 secret_hash,
        address payable recipient,
        address payable sender,
        uint256 endtime,
        uint256 amount
    )
        external
        is_token_transferable(token, msg.sender, amount)
        future_endtime(endtime)
        returns (bytes32 locked_contract_id)
    {
        require(
            msg.sender == sender,
            "msg.sender must be same with sender address"
        );

        locked_contract_id = sha256(
            abi.encodePacked(
                token,
                secret_hash,
                recipient,
                sender,
                endtime,
                amount
            )
        );

        if (have_locked_contract(locked_contract_id))
            revert("this locked contract already exists");

        if (token_balances[token] < amount)
            revert("token balance: not enough on contract");

        locked_contracts[locked_contract_id] = LockContract(
            token,
            secret_hash,
            recipient,
            sender,
            endtime,
            amount,
            false,
            false,
            ""
        );
        token_balances[token] -= amount;
        pending_token_balances[token] += amount;
        withdraw_pendings[sender].push(locked_contract_id);

        emit log_withdraw(
            locked_contract_id,
            token,
            secret_hash,
            recipient,
            sender,
            endtime,
            amount
        );
        return locked_contract_id;
    }

    /**
     * @dev Called by the recipient once they know the preimage (secret key) of the secret hash.
     *
     * @param locked_contract_id of HTLC to withdraw.
     * @param preimage sha256(preimage) hash should equal the contract secret hash.
     *
     * @return bool true on success or false on failure.
     */
    function fund_confirm(bytes32 locked_contract_id, string memory preimage)
        external
        is_locked_contract_exist(locked_contract_id)
        check_secret_hash_matches(locked_contract_id, preimage)
        withdrawable(locked_contract_id)
        returns (bool)
    {
        LockContract storage locked_contract = locked_contracts[
            locked_contract_id
        ];

        locked_contract.preimage = preimage;
        locked_contract.withdrawn = true;

        token_balances[locked_contract.token] += locked_contract.amount;
        remove_from_pendings(fund_pendings[locked_contract.sender], locked_contract_id);

        emit log_fund_confirm(locked_contract_id);
        return true;
    }

    function withdraw_confirm(bytes32 locked_contract_id, string memory preimage)
        external
        is_locked_contract_exist(locked_contract_id)
        check_secret_hash_matches(locked_contract_id, preimage)
        withdrawable(locked_contract_id)
        returns (bool)
    {
        LockContract storage locked_contract = locked_contracts[
            locked_contract_id
        ];

        locked_contract.preimage = preimage;
        locked_contract.withdrawn = true;

        IERC20(locked_contract.token).transfer(
            locked_contract.recipient,
            locked_contract.amount
        );

        pending_token_balances[locked_contract.token] -= locked_contract.amount;
        remove_from_pendings(withdraw_pendings[locked_contract.sender], locked_contract_id);

        emit log_fund_confirm(locked_contract_id);
        return true;
    }

    /**
     * @dev Called by the sender if there was no withdraw and the time lock has expired.
     *
     * @param locked_contract_id of HTLC to refund.
     *
     * @return bool true on success or false on failure.
     */
    function fund_cancel(bytes32 locked_contract_id)
        external
        is_locked_contract_exist(locked_contract_id)
        refundable(locked_contract_id)
        returns (bool)
    {
        LockContract storage locked_contract = locked_contracts[
            locked_contract_id
        ];

        locked_contract.refunded = true;
        IERC20(locked_contract.token).transfer(
            locked_contract.sender,
            locked_contract.amount
        );
        remove_from_pendings(fund_pendings[locked_contract.sender], locked_contract_id);

        emit log_fund_cancel(locked_contract_id);
        return true;
    }

    function withdraw_cancel(bytes32 locked_contract_id)
        external
        is_locked_contract_exist(locked_contract_id)
        refundable(locked_contract_id)
        returns (bool)
    {
        LockContract storage locked_contract = locked_contracts[
            locked_contract_id
        ];

        locked_contract.refunded = true;
        remove_from_pendings(withdraw_pendings[locked_contract.sender], locked_contract_id);

        emit log_fund_cancel(locked_contract_id);
        return true;
    }

    /**
     * @dev Get HTLC IERC20 contract details.
     *
     * @param locked_contract_id of HTLC IERC20 to get details.
     *
     * @return id token secret_hash recipient sender endtime amount withdrawn refunded preimage locked HTLC IERC20 contract data's.
     */
    function get_locked_contract(bytes32 locked_contract_id)
        public
        view
        returns (
            bytes32 id,
            address token,
            bytes32 secret_hash,
            address recipient,
            address sender,
            uint256 endtime,
            uint256 amount,
            bool withdrawn,
            bool refunded,
            string memory preimage
        )
    {
        if (have_locked_contract(locked_contract_id) == false)
            return (
                0,
                address(0),
                0,
                address(0),
                address(0),
                0,
                0,
                false,
                false,
                ""
            );

        LockContract storage locked_contract = locked_contracts[
            locked_contract_id
        ];

        return (
            locked_contract_id,
            locked_contract.token,
            locked_contract.secret_hash,
            locked_contract.recipient,
            locked_contract.sender,
            locked_contract.endtime,
            locked_contract.amount,
            locked_contract.withdrawn,
            locked_contract.refunded,
            locked_contract.preimage
        );
    }

    /**
     * @dev Is there a locked contract with HTLC contract id.
     *
     * @param locked_contract_id of HTLC to find it exists.
     *
     * @return exists boolean true or false.
     */
    function have_locked_contract(bytes32 locked_contract_id)
        internal
        view
        returns (bool exists)
    {
        exists = (locked_contracts[locked_contract_id].sender != address(0));
    }

    function remove_from_pendings(bytes32[] storage pendings, bytes32 locked_contract_id)
        internal
        returns (bool status)
    {
        if (pendings.length == 0) {
            revert("Can not delete from pendings");
        }

        uint256 index = 0;
        bool found = false;
        for (uint256 i = 0; i < pendings.length; i++) {
            if (pendings[i] == locked_contract_id) {
                index = i;
                found = true;
                break;
            }
        }
        if (found == false) {
            revert("Can not find in pendings");
        }

        for (
            uint256 i = index;
            i < pendings.length - 1;
            i++
        ) {
            pendings[i] = pendings[i + 1];
        }
        pendings.pop();
        return true;
    }

    /**
     * @dev return pending tranfers for user
     *
     * @param sender of user to return list of locked_contracts
     *
     * @return pendings list of locked_contracts
     */
    function get_fund_contracts(address sender)
        external
        view
        returns (bytes32[] memory pendings)
    {
        bytes32[] memory result = new bytes32[](
            fund_pendings[sender].length
        );

        for (uint256 i = 0; i < fund_pendings[sender].length; i++) {
            result[i] = fund_pendings[sender][i];
        }
        return result;
    }

    function get_withdraw_contracts(address sender)
        external
        view
        returns (bytes32[] memory pendings)
    {
        bytes32[] memory result = new bytes32[](
            fund_pendings[sender].length
        );

        for (uint256 i = 0; i < fund_pendings[sender].length; i++) {
            result[i] = fund_pendings[sender][i];
        }
        return result;
    }

    /**
     * @dev return current token balances located on smartcontract
     *
     * @param token address of token
     *
     * @return balance return amount of tokens located on smartcontract
     */
    function get_token_balance(address token) external view returns(uint256 balance) {
        return token_balances[token];
    }
}
