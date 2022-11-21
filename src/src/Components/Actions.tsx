import { showNotification } from '@mantine/notifications';

import { delay } from '../utils/utils';
import aeToken from '../contracts/ae_token.json';
import aeGate from '../contracts/ae_gate.json';
import ethGate from '../contracts/Gate.json';
import ethUsdt from '../contracts/USDT.json';
import { getContract } from '../utils/utils';
import { IconCheck, IconX } from '@tabler/icons';

const Buffer = require('buffer').Buffer;

export async function aeToEth(provider: any, chainId: number | undefined, aeWallet: any, ethWallet: any, contracts: any, amount: bigint, setIsLoading: any, setCurrentAction: any) {
  setIsLoading(true);
  try {
    let usdtAddressWithSigner = getContract(provider, chainId, ethUsdt);
    if (! usdtAddressWithSigner) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: 'Usdt contract is not uploaded for this network',
        icon: <IconX size={16} />,
      });
      return;
    }

    const gate_address = "ak" + aeGate.address.substr(2);

    // allowance tokens
    setCurrentAction(0);
    let result : any = null;
    result = await aeWallet.usdtContract.methods.allowance({from_account: aeWallet.address, for_account: gate_address})
    let allowed = result.decodedResult;
    if (allowed === undefined) {
      await aeWallet.usdtContract.methods.create_allowance(gate_address, amount);
    } else if (allowed < amount) {
      await aeWallet.usdtContract.methods.change_allowance(gate_address, amount);
    }

    setCurrentAction(1);
    const endtime = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    const nonce = +new Date();
    result = await aeWallet.gateContract.methods.fund(
        aeToken.address,
        usdtAddressWithSigner.address,
        ethWallet.address,
        amount,
        nonce,
        endtime
    );
    const swap_id = result.decodedResult;
    console.log("swap id ", swap_id);
    console.log("swap id ", Buffer.from(swap_id).toString("hex"));

    setCurrentAction(2);

    let time_to_wait = 120;
    while (true) {
      let swap = await aeWallet.gateContract.methods.get_swap(swap_id);
      if (swap.signature) {
        setCurrentAction(3);
        alert(123);
        return;
      }
      await delay(5000);

      time_to_wait -= 5;
      if (time_to_wait <= 0) {
        showNotification({
          color: 'red',
          title: 'Error',
          message: 'Can not finish exchange',
        });
        break;
      }

    }

  } finally {
    setIsLoading(false);
    setCurrentAction(null);
  }
}


function waitForSigned(gateContractWithSigner: any, swapId: string) : Promise<string> {
  return new Promise<string>((resolve, reject) => {
    gateContractWithSigner.on('SwapSigned', (signedSwapId: string, signature: string) => {
      if (swapId === signedSwapId) {
        resolve(signature);
      }
    });
  });
}

function ethSignatureToAe(signature: string) : string {
  let sigBytes = Buffer.from(signature.substr(2), "hex");
  let v = sigBytes.slice(-1)
  let convertedSignature = Buffer.concat([
    v,
    sigBytes.slice(0, -1)
  ]);
  return convertedSignature;
}

export async function ethToAe(provider: any, chainId: number | undefined, aeWallet: any, ethWallet: any, contracts: any, amount: bigint, setIsLoading: any, setCurrentAction: any) {
  setIsLoading(true);
  try {
    setCurrentAction(0);

    let gateContractWithSigner = getContract(provider, chainId, ethGate);
    if (! gateContractWithSigner) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: 'Gate contract is not uploaded for this network',
        icon: <IconX size={16} />,
      });
      return;
    }

    let usdtAddressWithSigner = getContract(provider, chainId, ethUsdt);
    if (! usdtAddressWithSigner) {
      showNotification({
        color: 'red',
        title: 'Error',
        message: 'Usdt contract is not uploaded for this network',
        icon: <IconX size={16} />,
      });
      return;
    }

    const allowance = await usdtAddressWithSigner.allowance(ethWallet.address, gateContractWithSigner.address);
    if (allowance.toBigInt() < amount) {
      await usdtAddressWithSigner.approve(gateContractWithSigner.address, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
    }

    setCurrentAction(1);

    let toToken = "ak" + aeToken.address.substr(2);
    const endtime = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    const nonce = +new Date();

    try {
      let tx = await gateContractWithSigner.fund(usdtAddressWithSigner.address, toToken, aeWallet.address, amount, nonce, endtime);
      let result = await tx.wait();

      if (!(result.events.length === 2 && result.events[1].event === "FundEvent")) {
        showNotification({
          color: 'red',
          title: 'Error',
          message: 'Can not find fund event',
          icon: <IconX size={16} />,
        });
      }

      let fund_event = result.events[1];
      let swapId = fund_event.args[0];

      console.log(`Swap id ${swapId}`);
      let swap = await gateContractWithSigner.getSwap(swapId);
      console.log(swap);

      setCurrentAction(2);
      let signature = await waitForSigned(gateContractWithSigner, swapId);
      console.log(signature);

      setCurrentAction(3);
      result = await aeWallet.gateContract.methods.claim(
        swapId,
        Buffer.from(usdtAddressWithSigner.address.substr(2), "hex"),
        toToken,
        Buffer.from(ethWallet.address.substr(2), "hex"),
        aeWallet.address,
        amount,
        nonce,
        ethSignatureToAe(signature),
      );
      console.log(result);

      showNotification({
        color: 'teal',
        title: 'Success',
        message: 'You have claimed tokens',
        icon: <IconCheck size={16} />,
      });
    } catch (e: any) {
      console.log(e);
      showNotification({
        color: 'red',
        title: 'Error',
        message: e.reason,
        icon: <IconX size={16} />,
      });
    }

  } finally {
    setIsLoading(false);
    setCurrentAction(null);
  }
}
