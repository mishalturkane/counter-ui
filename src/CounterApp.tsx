import React, { useEffect, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import idl from "../src/idl.json";

const PROGRAM_ID = new PublicKey(
  "3YdxPVS9rGiu4btzh72zXphj1s6SUBSBfYnHYVhfdVuv"
);
const SEED = "counter";

export default function CounterApp() {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction, signAllTransactions } =
    useWallet();

  const [program, setProgram] = useState<anchor.Program | null>(null);
  const [counterPda, setCounterPda] = useState<PublicKey | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [txSig, setTxSig] = useState<string>("");

  // 1️⃣ Initialize Anchor `Program` and derive your PDA
  useEffect(() => {
    if (!connection || !publicKey) return;

    const provider = new anchor.AnchorProvider(
      connection,
      { publicKey, signTransaction, signAllTransactions } as anchor.Wallet,
      { commitment: "processed" }
    );

    const prog = new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);
    setProgram(prog);

    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED), publicKey.toBuffer()],
      PROGRAM_ID
    );
    setCounterPda(pda);
  }, [connection, publicKey]);

  // 2️⃣ Fetch on‐chain counter
  const fetchCounter = async () => {
    if (!program || !counterPda) return;
    try {
      const acct: any = await program.account.counter.fetch(counterPda);
      setCount(acct.count.toNumber());
    } catch {
      setCount(null); // not initialized yet
    }
  };

  // auto‐refresh when program/PDA change
  useEffect(() => {
    fetchCounter();
  }, [program, counterPda]);

  // 3️⃣ Tx helper
  const handleTx = async (
    method: "initialize" | "increment" | "decrement"
  ) => {
    if (!program || !publicKey || !counterPda) return;
    try {
      const tx = await program.methods[method]().accounts({
        counter: counterPda,
        user: publicKey,
        ...(method === "initialize"
          ? { systemProgram: anchor.web3.SystemProgram.programId }
          : {}),
      }).rpc();

      setTxSig(tx);
      await fetchCounter();
    } catch (e) {
      console.error(method, "failed", e);
    }
  };

  return (
    <div className="max-w-md w-full p-6 bg-gray-800 rounded-2xl shadow-lg text-white">
      <h2 className="text-3xl font-bold mb-4">🧮 Solana Counter</h2>

      <p className="mb-1">
        <strong>Wallet:</strong>{" "}
        {publicKey ? publicKey.toBase58() : "Not connected"}
      </p>
      <p className="mb-1">
        <strong>PDA:</strong> {counterPda?.toBase58() || "--"}
      </p>
      <p className="mb-4">
        <strong>Count:</strong> {count !== null ? count : "--"}
      </p>

      <div className="flex space-x-3 mb-4">
        <button
          className="px-4 py-2 bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50"
          onClick={() => handleTx("initialize")}
          disabled={!connected}
        >
          🆕 Initialize
        </button>
        <button
          className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          onClick={() => handleTx("increment")}
          disabled={!connected}
        >
          ➕ Increment
        </button>
        <button
          className="px-4 py-2 bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
          onClick={() => handleTx("decrement")}
          disabled={!connected}
        >
          ➖ Decrement
        </button>
      </div>

      {/* 👇 manual refresh if you want */}
      <button
        className="px-3 py-1 bg-gray-600 rounded-md hover:bg-gray-700 mb-4 disabled:opacity-50"
        onClick={fetchCounter}
        disabled={!connected}
      >
        🔄 Get Count
      </button>

      {txSig && (
        <p>
          <strong>Last Tx:</strong>{" "}
          <a
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-300"
          >
            View on Explorer
          </a>
        </p>
      )}
    </div>
  );
}
