'use client';

import React from 'react';
import { FileText, Plus, X } from 'lucide-react';

export interface NFTMetadata {
  name: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTFormProps {
  metadata: NFTMetadata;
  onMetadataChange: (metadata: NFTMetadata) => void;
  disabled?: boolean;
}

export function NFTForm({ metadata, onMetadataChange, disabled = false }: NFTFormProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMetadataChange({
      ...metadata,
      name: e.target.value,
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onMetadataChange({
      ...metadata,
      description: e.target.value,
    });
  };

  const addAttribute = () => {
    onMetadataChange({
      ...metadata,
      attributes: [...metadata.attributes, { trait_type: '', value: '' }],
    });
  };

  const removeAttribute = (index: number) => {
    onMetadataChange({
      ...metadata,
      attributes: metadata.attributes.filter((_, i) => i !== index),
    });
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...metadata.attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    onMetadataChange({
      ...metadata,
      attributes: newAttributes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">NFT Details</h3>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="nft-name" className="block text-sm font-medium text-gray-700 mb-2">
          Name *
        </label>
        <input
          id="nft-name"
          type="text"
          value={metadata.name}
          onChange={handleNameChange}
          disabled={disabled}
          placeholder="Enter NFT name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="nft-description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="nft-description"
          value={metadata.description}
          onChange={handleDescriptionChange}
          disabled={disabled}
          placeholder="Describe your NFT"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
        />
      </div>

      {/* Attributes Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Attributes (Optional)
          </label>
          <button
            type="button"
            onClick={addAttribute}
            disabled={disabled}
            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Attribute
          </button>
        </div>

        {metadata.attributes.length > 0 && (
          <div className="space-y-3">
            {metadata.attributes.map((attribute, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={attribute.trait_type}
                    onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                    disabled={disabled}
                    placeholder="Trait type (e.g., Color)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={attribute.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    disabled={disabled}
                    placeholder="Value (e.g., Blue)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  disabled={disabled}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {metadata.attributes.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No attributes added. Click "Add Attribute" to include traits for your NFT.
          </p>
        )}
      </div>
    </div>
  );
}
