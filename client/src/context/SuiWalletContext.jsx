import { createContext, useContext } from 'react';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create query client
const queryClient = new QueryClient();

// Network configuration
const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  devnet: { url: getFullnodeUrl('devnet') },
};

const SuiWalletContext = createContext(null);

export function SuiWalletContextProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <SuiWalletContext.Provider value={{}}>
            {children}
          </SuiWalletContext.Provider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export function useSuiWallet() {
  const context = useContext(SuiWalletContext);
  if (!context) {
    throw new Error('useSuiWallet must be used within SuiWalletContextProvider');
  }
  return context;
}

export default SuiWalletContext;
