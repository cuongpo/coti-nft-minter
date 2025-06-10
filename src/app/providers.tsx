'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { Toaster } from 'react-hot-toast';
import { defineChain } from 'viem';

// Define COTI testnet
const cotiTestnet = defineChain({
  id: 7082400,
  name: 'COTI Testnet',
  nativeCurrency: {
    name: 'COTI',
    symbol: 'COTI',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.coti.io/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Cotiscan',
      url: 'https://testnet.cotiscan.io',
    },
  },
  testnet: true,
});

// Get projectId from WalletConnect Cloud
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// Create wagmi config
const metadata = {
  name: 'NFT Minting Platform',
  description: 'A no-code NFT minting platform for COTI testnet',
  url: 'https://localhost:3001',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const config = defaultWagmiConfig({
  chains: [cotiTestnet],
  projectId,
  metadata,
});

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
});

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
