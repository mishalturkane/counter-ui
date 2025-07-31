import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

export function Balance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        const lamports = await connection.getBalance(publicKey);
        const sol = lamports / LAMPORTS_PER_SOL;
        console.log("land balance dikh gya", sol);    // ← here 
        setBalance(sol);
      }
    };

    fetchBalance();
  }, [publicKey, connection]);

  return (
    <div className="flex justify-center items-center mt-6">
      <div className="w-fit flex p-4 rounded-md flex-col border border-gray-400 justify-center items-center">
        <p className="font-semibold">SOL Balance:</p>
        <div>{balance !== null ? balance.toFixed(4) : "Loading..."}</div>
      </div>
    </div>
  );
}
