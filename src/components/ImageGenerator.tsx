'use client';

import React, { useState } from 'react';
import { Sparkles, Wand2, X, Download } from 'lucide-react';
import { GeneratedImage } from '@/types/image';
import toast from 'react-hot-toast';

interface ImageGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
  onImageRemove: () => void;
  generatedImage: GeneratedImage | null;
  disabled?: boolean;
}

export function ImageGenerator({ 
  onImageGenerated, 
  onImageRemove, 
  generatedImage,
  disabled = false 
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for image generation');
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading('Generating image with Gemini AI...');

    try {
      const response = await fetch('/api/generate-image-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (!data.success || !data.imageUrl) {
        throw new Error('Invalid response from image generation API');
      }

      const generatedImage: GeneratedImage = {
        url: data.imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
      };

      onImageGenerated(generatedImage);
      toast.success('Image generated successfully!');
      
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setIsGenerating(false);
    }
  };

  const handleRemove = () => {
    onImageRemove();
    setPrompt('');
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    try {
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = generatedImage.url;
      link.download = `generated-nft-${generatedImage.timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  if (generatedImage) {
    return (
      <div className="space-y-4">
        <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
          <img
            src={generatedImage.url}
            alt="Generated NFT"
            className="w-full h-64 object-cover"
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Generating with Gemini AI...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">Generated Prompt:</p>
              <p className="text-sm text-gray-600">{generatedImage.prompt}</p>
              <p className="text-xs text-gray-400 mt-2">
                Generated on {new Date(generatedImage.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleDownload}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                title="Download image"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleRemove}
                disabled={disabled}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Generate NFT with AI
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Describe your NFT and let Gemini AI create a unique image for you
        </p>
        
        <div className="max-w-md mx-auto space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={disabled || isGenerating}
            placeholder="Describe your NFT... (e.g., 'A mystical dragon with blockchain elements, digital art style')"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none text-sm"
          />
          
          <button
            onClick={handleGenerate}
            disabled={disabled || isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Image
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-400 mt-4">
          Powered by Google Gemini AI
        </p>
      </div>
    </div>
  );
}
