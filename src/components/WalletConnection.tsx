'use client';

import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Wallet, LogOut } from 'lucide-react';

interface WalletConnectionProps {
  onAddressChange?: (address: string | undefined) => void;
}

export function WalletConnection({ onAddressChange }: WalletConnectionProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const [isMounted, setIsMounted] = React.useState(false);

  // Ensure component is mounted on client side to prevent hydration mismatch
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Notify parent component when address changes
  React.useEffect(() => {
    if (isMounted) {
      onAddressChange?.(address);
    }
  }, [address, onAddressChange, isMounted]);

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Wallet className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-600">Loading Wallet...</h3>
        </div>
        <div className="animate-pulse bg-gray-200 h-4 rounded mb-2"></div>
        <div className="animate-pulse bg-gray-200 h-8 rounded w-32"></div>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <Wallet className="w-5 h-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Wallet Connected</p>
          <p className="text-xs text-green-600 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <Wallet className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-blue-800">Connect Your Wallet</h3>
      </div>
      <p className="text-sm text-blue-600 mb-4">
        Connect your wallet to start minting NFTs on COTI testnet
      </p>
      <button
        onClick={() => open()}
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-md px-6 py-2 font-medium transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
}
