// src/App.tsx

import React from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import CounterApp from "./CounterApp";

function App() {
  // 👇 include your desired wallets here
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="bg-black flex flex-col min-h-screen text-white items-center justify-center">
            <nav className="flex p-4 rounded-md gap-4 bg-[#dadada] mb-6">
              <WalletMultiButton />
              <WalletDisconnectButton />
            </nav>

            <CounterApp />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
