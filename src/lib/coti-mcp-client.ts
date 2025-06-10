import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

// Smithery URL creation utility (replaces import from @smithery/sdk)
interface SmitheryUrlOptions {
  apiKey?: string;
  profile?: string;
  config?: object;
}

function createSmitheryUrl(baseUrl: string, options?: SmitheryUrlOptions): URL {
  const url = new URL(`${baseUrl}/mcp`);
  if (options?.config) {
    const param = typeof window !== "undefined"
      ? btoa(JSON.stringify(options.config))
      : Buffer.from(JSON.stringify(options.config)).toString("base64");
    url.searchParams.set("config", param);
  }
  if (options?.apiKey) {
    url.searchParams.set("api_key", options.apiKey);
  }
  if (options?.profile) {
    url.searchParams.set("profile", options.profile);
  }
  return url;
}

export interface MintNFTParams {
  toAddress: string;
  tokenUri: string;
}

export interface MintNFTResponse {
  success: boolean;
  transactionHash?: string;
  tokenId?: string;
  error?: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
}

// Create MCP client for COTI using official Smithery SDK
class COTIMCPClient {
  private client: Client | null = null;
  private config: Record<string, unknown>;
  private apiKey: string;

  constructor() {
    // Get configuration from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_SMITHERY_API_KEY || '';
    this.config = {
      cotiMcpAesKey: process.env.NEXT_PUBLIC_COTI_MCP_AES_KEY || '',
      cotiMcpPublicKey: process.env.NEXT_PUBLIC_COTI_MCP_PUBLIC_KEY || '',
      cotiMcpPrivateKey: process.env.NEXT_PUBLIC_COTI_MCP_PRIVATE_KEY || ''
    };
  }

  private async getClient(): Promise<Client> {
    if (this.client) {
      return this.client;
    }

    try {
      console.log('Creating Smithery URL with config:', this.config);
      console.log('Using API key:', this.apiKey ? 'API key provided' : 'No API key');

      // Create Smithery URL using the official SDK
      const serverUrl = createSmitheryUrl(
        "https://server.smithery.ai/@davibauer/coti-mcp",
        {
          config: this.config,
          apiKey: this.apiKey
        }
      );

      console.log('Generated Smithery URL:', serverUrl);

      // Create transport using the official MCP SDK
      const transport = new StreamableHTTPClientTransport(serverUrl);

      // Create MCP client
      this.client = new Client({
        name: "NFT Minting Platform",
        version: "1.0.0"
      });

      console.log('Connecting to MCP server...');
      await this.client.connect(transport);
      console.log('MCP Client connected successfully');

      return this.client;
    } catch (error) {
      console.error('Failed to create MCP client:', error);
      throw error;
    }
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    try {
      const client = await this.getClient();

      console.log('Calling tool:', toolName, 'with args:', args);

      // Use the official MCP SDK to call the tool
      const result = await client.callTool({
        name: toolName,
        arguments: args
      });

      console.log('Tool call result:', result);
      return result;
    } catch (error) {
      console.error('Tool call failed:', error);
      throw error;
    }
  }

  async listTools(): Promise<any> {
    try {
      const client = await this.getClient();

      console.log('Listing available tools...');

      // Use the official MCP SDK to list tools
      const tools = await client.listTools();

      console.log('Available tools:', tools);
      return tools;
    } catch (error) {
      console.error('Failed to list tools:', error);
      throw error;
    }
  }
}

// Function to test COTI API connection using Smithery SDK
export async function testCOTIConnection(): Promise<ConnectionTestResponse> {
  try {
    const client = new COTIMCPClient();
    const result = await client.listTools();

    console.log('Tools list result:', result);

    // Handle different response formats from the MCP SDK
    if (result && result.tools && Array.isArray(result.tools)) {
      return {
        success: true,
        message: `COTI MCP connection successful. Found ${result.tools.length} available tools.`,
      };
    } else if (Array.isArray(result)) {
      return {
        success: true,
        message: `COTI MCP connection successful. Found ${result.length} available tools.`,
      };
    }

    return {
      success: true,
      message: 'COTI MCP connection successful',
    };
  } catch (error) {
    console.error('COTI connection test failed:', error);
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Function to mint NFT using COTI MCP with Smithery SDK
export async function mintNFTOnCOTI(params: MintNFTParams): Promise<MintNFTResponse> {
  try {
    const client = new COTIMCPClient();
    const contractAddress = process.env.NEXT_PUBLIC_COTI_CONTRACT_ADDRESS || '0x09DBda61Af85D3f85a34D0CABf459EE44c456d6F';

    console.log('Minting NFT with params:', params);
    console.log('Using contract address:', contractAddress);

    // Use the official MCP SDK to call the mint tool
    const result = await client.callTool('mint_private_erc721_token', {
      to_address: params.toAddress,
      token_address: contractAddress,
      token_uri: params.tokenUri,
    });

    console.log('Mint result:', result);

    // Parse the response from the MCP tool call
    if (result && result.content && Array.isArray(result.content) && result.content.length > 0) {
      const responseText = result.content[0].text;
      console.log('MCP Response Text:', responseText);

      // Parse the response text to extract transaction hash and token ID
      const txHashMatch = responseText.match(/Transaction Hash: (0x[a-fA-F0-9]+)/);
      const tokenIdMatch = responseText.match(/Token ID: (\d+)/);

      const transactionHash = txHashMatch ? txHashMatch[1] : undefined;
      const tokenId = tokenIdMatch ? tokenIdMatch[1] : undefined;

      if (transactionHash) {
        return {
          success: true,
          transactionHash,
          tokenId,
        };
      } else {
        return {
          success: false,
          error: 'Minting response received but no transaction hash found',
        };
      }
    } else if (result && typeof result === 'string') {
      // Handle direct string response
      console.log('MCP String Response:', result);

      const txHashMatch = result.match(/Transaction Hash: (0x[a-fA-F0-9]+)/);
      const tokenIdMatch = result.match(/Token ID: (\d+)/);

      const transactionHash = txHashMatch ? txHashMatch[1] : undefined;
      const tokenId = tokenIdMatch ? tokenIdMatch[1] : undefined;

      if (transactionHash) {
        return {
          success: true,
          transactionHash,
          tokenId,
        };
      }
    }
    
    return {
      success: false,
      error: 'Invalid response format from COTI MCP API',
    };
  } catch (error) {
    console.error('NFT minting failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mint NFT',
    };
  }
}
