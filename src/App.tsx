import React from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import Counter from "./Counter";

const networkEndpoint = "https://devnet.helius-rpc.com/?api-key=47afb476-40d6-408e-aa60-11b3ea141bb8"; // Or your preferred RPC

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

const App: React.FC = () => {
  return (
    <ConnectionProvider endpoint={networkEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <nav className="flex p-4 bg-gray-200 gap-4">
            {/* Wallet connect buttons */}
            <WalletMultiButton />
            <WalletDisconnectButton />
          </nav>
          <Counter />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
