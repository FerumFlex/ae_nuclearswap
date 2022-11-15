import { showNotification } from '@mantine/notifications';

import { bot_addr } from '../utils/Config';
import { makeid, delay, hexdump } from '../utils/utils';
import aeToken from '../contracts/ae_token.json';
import aeGate from '../contracts/ae_gate.json';
import ethGate from '../contracts/Gate.json';

const Buffer = require('buffer').Buffer;
const Web3 = require('web3');

var sha256 = require('js-sha256');

export async function aeToEth(aeWallet: any, ethWallet: any, contracts: any, amount: bigint, setIsLoading: any, setCurrentAction: any) {
  setIsLoading(true);
  try {
    const gate_address = "ak" + aeGate.address.substr(2);
    const password = makeid(12);
    const secret_hash = sha256(password);

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
    const unix = Date.now() + 1 * 60 * 10 * 1000; // 1 hour
    result = await aeWallet.gateContract.methods.fund(aeToken.address, secret_hash, bot_addr, ethWallet.address, unix, amount);
    const swap_id = result.decodedResult;

    console.log("swap id ", hexdump(swap_id));
    console.log("password ", password);
    console.log("secret_hash ", secret_hash);

    setCurrentAction(2);
    // @ts-ignore
    const web3 = new Web3(window.ethereum);
    const id: string = await web3.eth.net.getId();
    // @ts-ignore
    const deployedNetwork: any = ethHtlc.networks[id];
    const contract = new web3.eth.Contract(
      ethGate.abi,
      deployedNetwork.address,
    );

    const fromBlock = await web3.eth.getBlockNumber();
    let events;
    let time_to_wait = 120;
    while (true) {
      events = await contract.getPastEvents('log_fund', {fromBlock: fromBlock});
      for (let event of events) {
        if (event.event !== "log_fund") {
          continue;
        }
        if (event.returnValues.secret_hash.substr(2) !== secret_hash) {
          continue;
        }
        if (event) {
          setCurrentAction(3);
          const new_contract_id = event.returnValues.locked_contract_id.substr(2);
          await contract.methods.withdraw(Buffer.from(new_contract_id, "hex"), password).send({ from: ethWallet.address });

          showNotification({
            color: 'green',
            title: 'Success',
            message: 'You got your tokens',
          });
          return;
        }
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

    contracts.addContract(swap_id, secret_hash, password);
  } finally {
    setIsLoading(false);
    setCurrentAction(null);
  }
}

export async function ethToAe(aeWallet: any, ethWallet: any, contracts: any, amount: bigint, setIsLoading: any, setCurrentAction: any) {
  setIsLoading(true);
  try {
    setCurrentAction(0);

    await delay(5000);

  } finally {
    setIsLoading(false);
    setCurrentAction(null);
  }
}