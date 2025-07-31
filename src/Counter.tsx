import React from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "./counter_contract.json"; 

const PROGRAM_ID = new PublicKey("FfDz2DA8hhAZmYPeNZz9Bh4gTpUnv5tnsd3NQw9TtX5E");  
const COUNTER_SEED = "counter";

type CounterAccount = {
  count: BN;
};

const Counter: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [counter, setCounter] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);

  // Get PDA for user's counter account
  const getCounterPda = React.useCallback((): PublicKey | null => {
    if (!publicKey) return null;
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(COUNTER_SEED), publicKey.toBuffer()],
      PROGRAM_ID
    );
    return pda;
  }, [publicKey]);

  // Anchor Provider wrapping connection and wallet
  const getProvider = React.useCallback(() => {
    if (!publicKey) return null;
    return new AnchorProvider(
      connection,
      {
        publicKey,
        sendTransaction,
        signTransaction: undefined,
        signAllTransactions: undefined,
      } as any,
      { commitment: "confirmed" }
    );
  }, [connection, publicKey, sendTransaction]);

  // Anchor program client
  const getProgram = React.useCallback(() => {
    const provider = getProvider();
    if (!provider) return null;
    return new Program(idl as Idl, PROGRAM_ID, provider);
  }, [getProvider]);

  // Load counter account and update UI state
  const loadCounter = React.useCallback(async () => {
    setLoading(true);
    try {
      const program = getProgram();
      const pda = getCounterPda();
      if (!program || !pda) {
        setInitialized(false);
        setCounter(null);
        setLoading(false);
        return;
      }
      const account = (await program.account.Counter.fetch(pda)) as CounterAccount;
      setCounter(account.count.toNumber());
      setInitialized(true);
    } catch (error) {
      // Account not found or fetch failed means no initialized counter
      setInitialized(false);
      setCounter(null);
    }
    setLoading(false);
  }, [getProgram, getCounterPda]);

  React.useEffect(() => {
    if (connected) loadCounter();
    else {
      setInitialized(false);
      setCounter(null);
    }
  }, [connected, loadCounter]);

  // Call on-chain methods
  const sendTx = async (method: "initialize" | "increment" | "decrement") => {
    if (!publicKey) return alert("Connect your wallet first");
    setLoading(true);
    try {
      const program = getProgram();
      const pda = getCounterPda();
      if (!program || !pda) throw new Error("Program or PDA unavailable");

      if (method === "initialize") {
        await program.methods
          .initialize()
          .accounts({
            counter: pda,
            user: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      } else {
        await program.methods[method]().accounts({
          counter: pda,
          user: publicKey,
        }).rpc();
      }
      await loadCounter();
    } catch (err: any) {
      alert("Transaction failed: land code" + err.message);
    }
    setLoading(false);
  };

  if (!connected) return <div>Please connect your wallet to start.</div>;

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Solana Anchor Counter</h2>
      <p>
        <strong>Counter Value: </strong>
        {loading ? "Loading..." : counter === null ? "Not initialized" : counter}
      </p>
      {!initialized && !loading && (
        <p style={{ color: "red" }}>Counter not initialized. Please initialize.</p>
      )}
      <div style={{ marginTop: 20 }}>
        {!initialized && (
          <button
            onClick={() => sendTx("initialize")}
            disabled={loading}
            style={{
              padding: "12px 16px",
              marginRight: 10,
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
            }}
          >
            Initialize
          </button>
        )}
        <button
          onClick={() => sendTx("increment")}
          disabled={loading || !initialized}
          style={{
            padding: "12px 16px",
            marginRight: 10,
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          Increment
        </button>
        <button
          onClick={() => sendTx("decrement")}
          disabled={loading || !initialized}
          style={{
            padding: "12px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          Decrement
        </button>
      </div>
    </div>
  );
};

export default Counter;
