import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Get Solana node connection
const getConnection = () => {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  return new Connection(endpoint);
};

// On-chain voting function
export const voteOnChain = async (
  wallet: WalletContextState,
  proposalId: string,
  optionId: string
): Promise<string | null> => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected or does not support signing');
  }

  try {
    const connection = getConnection();
    
    // In an actual application, we should call a custom Solana program for voting
    // Below is a simplified example, sending a small amount of SOL as proof of voting
    // Note: This is just a simulation, real applications should use a dedicated voting program
    
    // Create a transaction to record data
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey('VoteProgramAddressOrTreasuryWallet'), // Should be replaced with the actual program address
        lamports: 1000, // 0.000001 SOL
      })
    );

    // Add voting data to transaction memo
    const voteData = JSON.stringify({
      type: 'vote',
      proposalId,
      optionId,
      timestamp: new Date().toISOString(),
    });
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Send to yourself
        lamports: 0, // 0 SOL (only for adding a memo)
      })
    );
    
    // Add memo instruction
    const encodedVoteData = Buffer.from(voteData);
    transaction.add({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: encodedVoteData,
    });
    
    // Set recent blockhash
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Wait for transaction confirmation
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error) {
    console.error('On-chain voting failed:', error);
    throw new Error(`Voting transaction failed: ${(error as Error).message}`);
  }
};

// Get wallet SOL balance
export const getSolBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const connection = getConnection();
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL; // Convert to SOL units
  } catch (error) {
    console.error('Failed to get balance:', error);
    throw new Error(`Failed to get SOL balance: ${(error as Error).message}`);
  }
};

// Verify transaction
export const verifyTransaction = async (signature: string): Promise<boolean> => {
  try {
    const connection = getConnection();
    const transaction = await connection.getTransaction(signature);
    return !!transaction;
  } catch (error) {
    console.error('Failed to verify transaction:', error);
    return false;
  }
};

export default {
  voteOnChain,
  getSolBalance,
  verifyTransaction,
}; 