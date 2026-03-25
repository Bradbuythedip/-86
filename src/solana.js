import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";

let connection = null;
let wallet = null;

export function getConnection() {
  if (!connection) {
    connection = new Connection(
      process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
    );
  }
  return connection;
}

export function getWallet() {
  if (!wallet) {
    const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY);
    wallet = Keypair.fromSecretKey(secretKey);
  }
  return wallet;
}

export async function getBalance() {
  const conn = getConnection();
  const kp = getWallet();
  const balance = await conn.getBalance(kp.publicKey);
  return balance / LAMPORTS_PER_SOL;
}

export async function sendSol(recipientAddress, amountSol) {
  const conn = getConnection();
  const sender = getWallet();
  const recipient = new PublicKey(recipientAddress);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: recipient,
      lamports: Math.floor(amountSol * LAMPORTS_PER_SOL),
    })
  );

  const signature = await conn.sendTransaction(transaction, [sender]);
  await conn.confirmTransaction(signature);
  console.log(`[SOL SENT] ${amountSol} SOL -> ${recipientAddress} (${signature})`);
  return signature;
}
