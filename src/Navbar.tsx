import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

function Navbar() {
  return (
    <nav className="flex flex-col sm:flex-row p-4 items-center rounded-md gap-4 bg-[#dadada]">
      <WalletMultiButton />
      <WalletDisconnectButton />
    </nav>
  );
}

export default Navbar;
