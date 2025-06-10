# NFT Minting Platform

A no-code NFT minting platform built for COTI testnet. This application allows users to easily mint NFTs by uploading images, adding metadata, and minting directly to the COTI blockchain.

## Features

- 🔗 **Wallet Connection**: Connect your wallet using Thirdweb
- 📸 **Image Upload**: Drag-and-drop or click to upload NFT images
- 🎨 **AI Image Generation**: Generate unique images using OpenAI's DALL-E 3 or Google Gemini
- 🏷️ **Metadata Management**: Add name, description, and custom attributes
- 📦 **IPFS Storage**: Automatic upload to IPFS via Pinata
- ⛓️ **COTI Integration**: Direct minting to COTI testnet
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Real-time Status**: Live minting progress tracking

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Blockchain**: Wagmi, Web3Modal, COTI testnet
- **Storage**: Pinata IPFS
- **AI**: OpenAI DALL-E 3 and Google Gemini for image generation
- **UI Components**: Lucide React icons, React Hot Toast

## Prerequisites

Before running this application, you need:

1. **WalletConnect Project ID**: Get one from [WalletConnect Cloud](https://cloud.walletconnect.com)
2. **Pinata API Keys**: Sign up at [Pinata](https://pinata.cloud) and get API keys
3. **OpenAI API Key**: Get one from [OpenAI Platform](https://platform.openai.com/api-keys) (optional)
4. **Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/app/apikey) (optional)
5. **COTI Testnet Wallet**: Set up a wallet with COTI testnet tokens

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd nft-minting-platform
npm install
```

### 2. Environment Configuration

Copy the `.env.local` file and update with your credentials:

```bash
# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Pinata Configuration
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_key_here

# COTI Configuration
NEXT_PUBLIC_COTI_CONTRACT_ADDRESS=0x09DBda61Af85D3f85a34D0CABf459EE44c456d6F
NEXT_PUBLIC_COTI_MCP_ENDPOINT=https://server.smithery.ai/@davibauer/coti-mcp/mcp

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=7082400

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Get Required API Keys

#### WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project or use existing one
3. Copy the Project ID from your project settings

#### Pinata API Keys
1. Sign up at [Pinata](https://pinata.cloud)
2. Go to API Keys section
3. Create a new API key with pinning permissions
4. Copy both the API Key and Secret API Key

#### OpenAI API Key (Optional)
1. Sign up at [OpenAI Platform](https://platform.openai.com)
2. Go to [API Keys](https://platform.openai.com/api-keys)
3. Create a new API key
4. Copy the API key (starts with `sk-`)
5. **Note**: You'll need credits in your OpenAI account to use DALL-E 3

#### Gemini API Key (Optional)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. **Note**: Gemini has generous free tier limits for image generation

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage Guide

### 1. Connect Wallet
- Click "Connect Wallet" and choose your preferred wallet
- Make sure you're connected to COTI testnet
- Your wallet address will be displayed once connected

### 2. Choose Image Source
You can either upload your own image or generate one with AI:

#### Option A: Upload Image
- Drag and drop an image file or click to select
- Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
- Preview will be shown once uploaded

#### Option B: Generate Image with AI
- Click "Generate Image" tab
- Choose your AI provider:
  - **Google Gemini**: Fast generation with creative interpretations
  - **OpenAI DALL-E 3**: High-quality, detailed images
- Enter a detailed description of your desired image
- Choose image settings:
  - **Size**: Square (1024×1024), Landscape (1792×1024), or Portrait (1024×1792)
  - **Quality**: Standard or HD (higher cost for OpenAI)
  - **Style**: Vivid (more creative) or Natural (more realistic)
- Click "Generate with [Provider]" and wait for AI to create your unique artwork
- The generated image will be automatically prepared for minting

### 3. Add Metadata
- Enter a name for your NFT (required)
- Add a description (optional)
- Add custom attributes like traits (optional)

### 4. Mint NFT
- Click "Mint NFT" to start the process
- Monitor the progress through three steps:
  1. Uploading image to IPFS
  2. Uploading metadata to IPFS
  3. Minting NFT on COTI blockchain

### 5. View Results
- Once successful, you'll see the transaction hash
- Click the external link to view on Cotiscan Explorer
- Use "Mint Another NFT" to create more

## Network Information

- **Network**: COTI Testnet
- **Chain ID**: 7082400
- **RPC URL**: https://testnet.coti.io/rpc
- **Explorer**: https://testnet.cotiscan.io
- **Contract Address**: 0x09DBda61Af85D3f85a34D0CABf459EE44c456d6F

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure you have a compatible wallet installed
   - Check if you're on the correct network (COTI testnet)

2. **Image Upload Failed**
   - Verify Pinata API keys are correct
   - Check file size (must be under 10MB)
   - Ensure file is a valid image format

3. **AI Image Generation Failed**
   - Verify OpenAI API key is correct and has credits
   - Check if prompt violates OpenAI content policy
   - Ensure prompt is descriptive (3-4000 characters)
   - Try different prompt if generation fails

4. **Minting Failed**
   - Check wallet has sufficient COTI tokens for gas
   - Verify all environment variables are set correctly
   - Check COTI MCP API endpoint is accessible

4. **"Transport is closed" Error**
   - This indicates the COTI MCP session has expired
   - This is normal after some time of inactivity
   - Refresh the page to get a fresh session
   - Contact support if the issue persists

5. **Timeout Errors**
   - COTI network may be experiencing high load
   - Check your transaction on Cotiscan Explorer
   - The transaction may still succeed even if the UI times out

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure you have testnet tokens in your wallet
4. Check network connectivity

## Development

### Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   └── generate-image/
│   │       └── route.ts # OpenAI image generation endpoint
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Main minting interface
│   ├── providers.tsx   # Thirdweb and toast providers
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── WalletConnection.tsx
│   ├── ImageUpload.tsx
│   ├── ImageGenerator.tsx      # AI image generation component
│   ├── ImageSourceSelector.tsx # Toggle between upload/generate
│   ├── NFTForm.tsx
│   └── MintingStatus.tsx
├── lib/               # Utility functions
│   ├── pinata.ts      # IPFS upload functions
│   ├── openai.ts      # OpenAI integration
│   └── coti-mcp-client.ts # COTI blockchain integration
└── types/             # TypeScript type definitions
    └── image.ts       # Image-related types
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
