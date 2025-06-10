'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { WalletConnection } from '@/components/WalletConnection';
import { ImageUpload } from '@/components/ImageUpload';
import { ImageGenerator } from '@/components/ImageGenerator';
import { ImageSourceSelector } from '@/components/ImageSourceSelector';
import { NFTForm, NFTMetadata } from '@/components/NFTForm';
import { MintingStatus, MintingStep } from '@/components/MintingStatus';
import { uploadImageToPinata, uploadMetadataToPinata } from '@/lib/pinata';
import { mintNFTOnCOTI } from '@/lib/coti-mcp-client';
import { convertToFile } from '@/lib/image-utils';
import { ImageData, ImageSource, GeneratedImage } from '@/types/image';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const { address } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const [imageData, setImageData] = useState<ImageData>({
    source: 'upload',
    file: null,
    generatedImage: null,
    preview: null,
  });
  const [imageSource, setImageSource] = useState<ImageSource>('upload');
  const [metadata, setMetadata] = useState<NFTMetadata>({
    name: '',
    description: '',
    attributes: [],
  });
  const [isMinting, setIsMinting] = useState(false);
  const [mintingSteps, setMintingSteps] = useState<MintingStep[]>([]);
  const [transactionHash, setTransactionHash] = useState<string>();
  const [tokenId, setTokenId] = useState<string>();

  // Ensure component is mounted on client side to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const resetForm = () => {
    setImageData({
      source: 'upload',
      file: null,
      generatedImage: null,
      preview: null,
    });
    setImageSource('upload');
    setMetadata({ name: '', description: '', attributes: [] });
    setMintingSteps([]);
    setTransactionHash(undefined);
    setTokenId(undefined);
    setIsMinting(false);
  };

  const handleImageSourceChange = (source: ImageSource) => {
    setImageSource(source);
    // Clear current image data when switching sources
    setImageData({
      source,
      file: null,
      generatedImage: null,
      preview: null,
    });
  };

  const handleImageUpload = (file: File) => {
    setImageData({
      source: 'upload',
      file,
      generatedImage: null,
      preview: URL.createObjectURL(file),
    });
  };

  const handleImageGenerated = (generatedImage: GeneratedImage) => {
    // Convert the generated image to a File object for uploading
    const file = convertToFile(generatedImage.url, `generated-nft-${generatedImage.timestamp}.png`);

    setImageData({
      source: 'generate',
      file,
      generatedImage,
      preview: generatedImage.url,
    });
  };

  const handleImageRemove = () => {
    if (imageData.preview && imageData.source === 'upload') {
      URL.revokeObjectURL(imageData.preview);
    }
    setImageData({
      source: imageSource,
      file: null,
      generatedImage: null,
      preview: null,
    });
  };

  const updateStepStatus = (stepId: string, status: MintingStep['status'], error?: string) => {
    setMintingSteps(prev =>
      prev.map(step =>
        step.id === stepId
          ? { ...step, status, error }
          : step
      )
    );
  };

  const handleMint = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!imageData.file) {
      toast.error('Please select or generate an image');
      return;
    }

    if (!metadata.name.trim()) {
      toast.error('Please enter a name for your NFT');
      return;
    }

    setIsMinting(true);
    setMintingSteps([
      { id: 'upload-image', title: 'Uploading image to IPFS', status: 'loading' },
      { id: 'upload-metadata', title: 'Uploading metadata to IPFS', status: 'pending' },
      { id: 'mint-nft', title: 'Minting NFT on COTI', status: 'pending' },
    ]);

    try {
      // Step 1: Upload image to IPFS
      const imageResult = await uploadImageToPinata(imageData.file);
      updateStepStatus('upload-image', 'completed');

      // Step 2: Upload metadata to IPFS
      updateStepStatus('upload-metadata', 'loading');
      const nftMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: imageResult.ipfsUrl,
        attributes: metadata.attributes.filter(attr => attr.trait_type && attr.value),
      };

      const metadataResult = await uploadMetadataToPinata(nftMetadata);
      updateStepStatus('upload-metadata', 'completed');

      // Step 3: Mint NFT on COTI
      updateStepStatus('mint-nft', 'loading');
      const mintResult = await mintNFTOnCOTI({
        toAddress: address,
        tokenUri: metadataResult.ipfsUrl,
      });

      if (mintResult.success) {
        updateStepStatus('mint-nft', 'completed');
        setTransactionHash(mintResult.transactionHash);
        setTokenId(mintResult.tokenId);
        toast.success('NFT minted successfully!');
      } else {
        updateStepStatus('mint-nft', 'error', mintResult.error);

        // Provide user-friendly error messages
        let errorMessage = mintResult.error || 'Failed to mint NFT';
        if (errorMessage.includes('Transport is closed') || errorMessage.includes('session has expired')) {
          errorMessage = 'COTI MCP session has expired. Please refresh the page and try again.';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'Minting is taking longer than expected. Please check your transaction on COTI Explorer.';
        } else if (errorMessage.includes('Empty response')) {
          errorMessage = 'Transaction submitted but response is pending. Please check COTI Explorer for your transaction status.';
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Minting error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Update the current step with error
      setMintingSteps(prev => {
        const currentStep = prev.find(step => step.status === 'loading');
        if (currentStep) {
          return prev.map(step =>
            step.id === currentStep.id
              ? { ...step, status: 'error', error: errorMessage }
              : step
          );
        }
        return prev;
      });

      toast.error(errorMessage);
    } finally {
      setIsMinting(false);
    }
  };

  const canMint = address && imageData.file && metadata.name.trim() && !isMinting;

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">NFT Minting Platform</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Loading...
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
              <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
              <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
            </div>
            <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">NFT Minting Platform</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create and mint your NFTs on COTI testnet with ease. Upload your own image or generate unique artwork with Gemini AI, add metadata, and mint directly to the blockchain.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Wallet Connection */}
            <WalletConnection />

            {/* Image Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">NFT Image</h2>
              </div>

              {/* Image Source Selector */}
              <div className="mb-6">
                <ImageSourceSelector
                  selectedSource={imageSource}
                  onSourceChange={handleImageSourceChange}
                  disabled={isMinting}
                />
              </div>

              {/* Image Upload or Generation */}
              {imageSource === 'upload' ? (
                <ImageUpload
                  onImageSelect={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  selectedImage={imageData.source === 'upload' ? imageData.file : null}
                  isUploading={isMinting && mintingSteps[0]?.status === 'loading'}
                />
              ) : (
                <ImageGenerator
                  onImageGenerated={handleImageGenerated}
                  onImageRemove={handleImageRemove}
                  generatedImage={imageData.source === 'generate' ? imageData.generatedImage : null}
                  disabled={isMinting}
                />
              )}
            </div>

            {/* NFT Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <NFTForm
                metadata={metadata}
                onMetadataChange={setMetadata}
                disabled={isMinting}
              />
            </div>

            {/* Mint Button */}
            <button
              onClick={handleMint}
              disabled={!canMint}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isMinting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Minting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Mint NFT
                </>
              )}
            </button>
          </div>

          {/* Right Column - Status */}
          <div>
            {mintingSteps.length > 0 && (
              <MintingStatus
                steps={mintingSteps}
                transactionHash={transactionHash}
                tokenId={tokenId}
                onReset={resetForm}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
