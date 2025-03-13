import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { 
  useWallet as useSolanaWallet, 
  WalletContextState as SolanaWalletContextState 
} from '@solana/wallet-adapter-react';

interface WalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  balance: number;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  publicKey: null,
  connect: async () => {},
  disconnect: async () => {},
  balance: 0,
  isLoading: false,
});

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const solanaWallet = useSolanaWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Connect to wallet
  const connect = async (): Promise<void> => {
    try {
      if (solanaWallet.wallet) {
        setIsLoading(true);
        await solanaWallet.connect();
      } else {
        console.error('No wallet found');
        // You might want to show a UI to select a wallet here
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from wallet
  const disconnect = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await solanaWallet.disconnect();
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (solanaWallet.connected && solanaWallet.publicKey) {
        try {
          setIsLoading(true);
          // Use devnet for development
          const connection = new Connection(
            process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
            'confirmed'
          );
          
          const balance = await connection.getBalance(solanaWallet.publicKey);
          setBalance(balance / 1e9); // Convert lamports to SOL
        } catch (error) {
          console.error('Error fetching balance:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setBalance(0);
      }
    };

    fetchBalance();
  }, [solanaWallet.connected, solanaWallet.publicKey]);

  const value = {
    connected: solanaWallet.connected,
    publicKey: solanaWallet.publicKey,
    connect,
    disconnect,
    balance,
    isLoading,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);

export default WalletContext; 