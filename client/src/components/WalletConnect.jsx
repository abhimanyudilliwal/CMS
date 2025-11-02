import { ConnectButton } from '@mysten/dapp-kit';

export default function WalletConnect() {
  // Use the built-in ConnectButton from dapp-kit
  return (
    <div className="sui-wallet-connect">
      <ConnectButton connectText="Connect Wallet" />
    </div>
  );
}
