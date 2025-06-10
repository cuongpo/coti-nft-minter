'use client';

import React from 'react';
import { Upload, Sparkles } from 'lucide-react';
import { ImageSource } from '@/types/image';

interface ImageSourceSelectorProps {
  selectedSource: ImageSource;
  onSourceChange: (source: ImageSource) => void;
  disabled?: boolean;
}

export function ImageSourceSelector({ 
  selectedSource, 
  onSourceChange, 
  disabled = false 
}: ImageSourceSelectorProps) {
  return (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        onClick={() => onSourceChange('upload')}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          selectedSource === 'upload'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Upload className="w-4 h-4" />
        Upload Image
      </button>
      
      <button
        type="button"
        onClick={() => onSourceChange('generate')}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          selectedSource === 'generate'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Sparkles className="w-4 h-4" />
        AI Generate
      </button>
    </div>
  );
}
