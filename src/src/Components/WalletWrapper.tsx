import { observer } from "mobx-react-lite"
import { AeWallet } from './AeWallet';
import { EthWallet } from './EthWallet';


export const WalletWrapper = observer(() => {
  return (
    <div>
      <EthWallet />
      <AeWallet />
    </div>
  )
});
