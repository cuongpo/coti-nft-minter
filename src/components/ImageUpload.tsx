'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage: File | null;
  isUploading?: boolean;
}

export function ImageUpload({ 
  onImageSelect, 
  onImageRemove, 
  selectedImage, 
  isUploading = false 
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Create preview URL when image is selected
  React.useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [selectedImage]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onImageSelect(file);
    } else {
      alert('Please select an image file');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleRemove = () => {
    onImageRemove();
    setPreview(null);
  };

  if (selectedImage && preview) {
    return (
      <div className="relative">
        <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Selected NFT"
            className="w-full h-64 object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Uploading to IPFS...</p>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleRemove}
          disabled={isUploading}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-medium">{selectedImage.name}</p>
          <p>{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="space-y-4">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          {dragActive ? (
            <Upload className="w-6 h-6 text-blue-500" />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium text-gray-900">
            {dragActive ? 'Drop your image here' : 'Upload NFT Image'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop an image, or click to select
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supports: JPG, PNG, GIF, WebP (Max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
}
