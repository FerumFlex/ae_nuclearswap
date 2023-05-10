import { showNotification } from '@mantine/notifications';

import { delay } from '../utils/utils';
import ethGate from '../contracts/Gate.json';
import ethUsdt from '../contracts/USDT.json';
import { getContract } from '../utils/utils';
import { IconCheck, IconX } from '@tabler/icons';

const Buffer = require('buffer').Buffer;

export async function aeToEth(provider: any, chainId: number | undefined, aeWallet: any, ethWallet: any, contracts: any, amount: bigint, setIsLoading: any, setCurrentAction: any) {
  setIsLoading(true);
  try {
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

    const gate_address = "ak" + aeWallet.aeGate.address.substr(2);

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
    result = await aeWallet.gateContract.methods.get_fee();
    let fee = result.decodedResult;

    try {
      const endtime = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
      const nonce = +new Date();
      result = await aeWallet.gateContract.methods.fund(
          aeWallet.aeToken.address,
          Buffer.from(usdtAddressWithSigner.address.substr(2), "hex"),
          Buffer.from(ethWallet.address.substr(2), "hex"),
          amount,
          nonce,
          endtime,
          {
            amount: fee
          }
      );
      const swapId = "0x" + Buffer.from(result.decodedResult).toString("hex");
      console.log("swap id ", swapId);

      setCurrentAction(2);
      let signature = await aeWaitForsigned(aeWallet, swapId);
      console.log(signature);
      if (!signature) {
        showNotification({
          color: 'red',
          title: 'Error',
          message: 'Can not finish exchange',
        });
        return;
      }

      setCurrentAction(3);
      let tx = await gateContractWithSigner.claim(
        swapId,
        "ak" + aeWallet.aeToken.address.substr(2),
        usdtAddressWithSigner.address,
        aeWallet.address,
        ethWallet.address,
        amount,
        nonce,
        convertAeSignatureToEth("0x" + Buffer.from(signature).toString("hex"))
      );
      await tx.wait();

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
      let tx = await usdtAddressWithSigner.approve(gateContractWithSigner.address, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
      await tx.wait();
    }

    setCurrentAction(1);

    let toToken = "ak" + aeWallet.aeToken.address.substr(2);
    const endtime = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    const nonce = +new Date();
    const fee = await gateContractWithSigner.getFee();

    try {
      let tx = await gateContractWithSigner.fund(usdtAddressWithSigner.address, toToken, aeWallet.address, amount, nonce, endtime, {value: fee.toString()});
      let result = await tx.wait();
      console.log("result", result);

      if (!(result.events.length === 3 && result.events[2].event === "FundEvent")) {
        showNotification({
          color: 'red',
          title: 'Error',
          message: 'Can not find fund event',
          icon: <IconX size={16} />,
        });
        return;
      }

      let fund_event = result.events[2];
      let swapId = fund_event.args[0];
      console.log(`Swap id ${swapId}`);

      setCurrentAction(2);
      let signature = await ethwaitForSigned(gateContractWithSigner, swapId);
      if (!signature) {
        showNotification({
          color: 'red',
          title: 'Error',
          message: 'Can not finish exchange',
        });
        return;
      }
      console.log(`signature ${signature}`);

      setCurrentAction(3);
      await aeWallet.gateContract.methods.claim(
        Buffer.from(swapId.substr(2), "hex"),
        Buffer.from(usdtAddressWithSigner.address.substr(2), "hex"),
        toToken,
        Buffer.from(ethWallet.address.substr(2), "hex"),
        aeWallet.address,
        amount,
        nonce,
        ethSignatureToAe(signature),
      );

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

function convertAeSignatureToEth(signature: string) : string {
  let sigBytes = Buffer.from(signature.substr(2), "hex");
  let v = sigBytes.slice(0, 1)
  let convertedSignature = Buffer.concat([
    sigBytes.slice(1),
    v
  ]);
  return convertedSignature;
}

async function ethwaitForSigned(gateContractWithSigner: any, swapId: string) : Promise<string> {
  let time_to_wait = 20 * 60;
  while (true) {
    let swap = await gateContractWithSigner.getSwap(swapId);
    if (swap.signature && swap.signature !== "0x") {
      return swap.signature;
    }

    await delay(5000);

    if (time_to_wait <= 0) {
      break;
    }

    time_to_wait -= 5;
  }
  return "";
}

async function aeWaitForsigned(aeWallet: any, swapId: string) : Promise<string> {
  let time_to_wait = 20 * 60;
  while (true) {
    let result = await aeWallet.gateContract.methods.get_swap(swapId);
    let swap = result.decodedResult;
    if (swap.signature) {
      return swap.signature;
    }
    await delay(5000);

    time_to_wait -= 5;
    if (time_to_wait <= 0) {
      break;
    }
  }
  return "";
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
