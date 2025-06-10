'use client';

import React from 'react';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

export interface MintingStep {
  id: string;
  title: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  description?: string;
  error?: string;
}

interface MintingStatusProps {
  steps: MintingStep[];
  transactionHash?: string;
  tokenId?: string;
  onReset?: () => void;
}

export function MintingStatus({ steps, transactionHash, tokenId, onReset }: MintingStatusProps) {
  const getStepIcon = (status: MintingStep['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepTextColor = (status: MintingStep['status']) => {
    switch (status) {
      case 'loading':
        return 'text-blue-700';
      case 'completed':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-500';
    }
  };

  const isCompleted = steps.every(step => step.status === 'completed');
  const hasError = steps.some(step => step.status === 'error');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Minting Progress</h3>
      
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getStepIcon(step.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${getStepTextColor(step.status)}`}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              )}
              {step.error && (
                <p className="text-sm text-red-600 mt-1">{step.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Success State */}
      {isCompleted && transactionHash && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800">NFT Minted Successfully!</h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-green-700">Transaction Hash:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-green-100 px-2 py-1 rounded text-green-800 font-mono text-xs break-all">
                  {transactionHash}
                </code>
                <a
                  href={`https://testnet.cotiscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            {tokenId && (
              <div>
                <span className="font-medium text-green-700">Token ID:</span>
                <code className="ml-2 bg-green-100 px-2 py-1 rounded text-green-800 font-mono text-xs">
                  {tokenId}
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-800">Minting Failed</h4>
          </div>
          <div className="text-sm text-red-700">
            {steps.find(step => step.error?.includes('session has expired')) ? (
              <div>
                <p className="mb-2">The COTI MCP session has expired. This is normal after some time of inactivity.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            ) : (
              <p>There was an error during the minting process. Please try again.</p>
            )}
          </div>
        </div>
      )}

      {/* Reset Button */}
      {(isCompleted || hasError) && onReset && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Mint Another NFT
          </button>
        </div>
      )}
    </div>
  );
}
