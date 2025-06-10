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

// MCP Protocol interfaces
interface MCPRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: any;
}

// Function to test COTI API connection
export async function testCOTIConnection(): Promise<ConnectionTestResponse> {
  try {
    const config = process.env.NEXT_PUBLIC_COTI_MCP_CONFIG!;
    const apiKey = process.env.NEXT_PUBLIC_COTI_MCP_API_KEY!;
    const baseEndpoint = process.env.NEXT_PUBLIC_COTI_MCP_ENDPOINT!;

    const endpoint = `${baseEndpoint}?config=${config}&api_key=${apiKey}`;

    const testPayload = {
      method: 'tools/list',
      params: {},
      jsonrpc: '2.0',
      id: 1,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'https://smithery.ai',
        'Referer': 'https://smithery.ai/',
      },
      body: JSON.stringify(testPayload),
    });

    if (response.ok) {
      const responseText = await response.text();
      console.log('Test Connection Response Text:', responseText);

      // Handle both SSE and regular JSON responses
      let data;
      try {
        if (responseText.startsWith('event: message\ndata: ')) {
          const jsonPart = responseText.replace('event: message\ndata: ', '').trim();
          data = JSON.parse(jsonPart);
        } else {
          data = JSON.parse(responseText);
        }

        console.log('Test Connection Response Data:', data);

        if (data.result && data.result.tools) {
          return {
            success: true,
            message: `COTI API connection successful. Found ${data.result.tools.length} available tools.`,
          };
        } else if (data.result) {
          return {
            success: true,
            message: 'COTI API connection successful',
          };
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return {
          success: false,
          message: `Connection successful but response parsing failed: ${parseError}`,
        };
      }
    }

    const errorText = await response.text();
    return {
      success: false,
      message: `Connection failed: ${response.status} ${response.statusText} - ${errorText}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Function to initialize a new MCP session
async function initializeMCPSession(): Promise<string | null> {
  try {
    const config = process.env.NEXT_PUBLIC_COTI_MCP_CONFIG!;
    const apiKey = process.env.NEXT_PUBLIC_COTI_MCP_API_KEY!;
    const baseEndpoint = process.env.NEXT_PUBLIC_COTI_MCP_ENDPOINT!;

    const initEndpoint = `${baseEndpoint}?config=${config}&api_key=${apiKey}`;

    // Proper MCP initialization payload
    const initPayload = {
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'nft-minting-platform',
          version: '1.0.0'
        }
      },
      jsonrpc: '2.0',
      id: 0,
    };

    const response = await fetch(initEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/event-stream',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'Origin': 'https://smithery.ai',
        'Priority': 'u=1, i',
        'Referer': 'https://smithery.ai/',
        'Sec-Ch-Ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(initPayload),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('MCP Initialize Response:', data);

      // Get session ID from response headers
      const sessionId = response.headers.get('mcp-session-id');
      if (sessionId) {
        console.log('New MCP session established:', sessionId);
        return sessionId;
      }

      // If no session ID in headers, check if initialization was successful
      if (data.result) {
        console.log('MCP initialization successful, using default session');
        return 'initialized'; // Use a placeholder to indicate successful init
      }
    }

    console.error('Failed to initialize MCP session:', response.status, response.statusText);
    return null;
  } catch (error) {
    console.error('Failed to initialize MCP session:', error);
    return null;
  }
}

export async function mintNFTOnCOTI(params: MintNFTParams): Promise<MintNFTResponse> {
  const baseEndpoint = process.env.NEXT_PUBLIC_COTI_MCP_ENDPOINT!;
  const contractAddress = process.env.NEXT_PUBLIC_COTI_CONTRACT_ADDRESS!;

  // COTI MCP API configuration from environment variables
  const config = process.env.NEXT_PUBLIC_COTI_MCP_CONFIG!;
  const apiKey = process.env.NEXT_PUBLIC_COTI_MCP_API_KEY!;
  let sessionId = process.env.NEXT_PUBLIC_COTI_MCP_SESSION_ID!;

  // Construct the full endpoint with query parameters
  const endpoint = `${baseEndpoint}?config=${config}&api_key=${apiKey}`;

  const payload = {
    method: 'tools/call',
    params: {
      name: 'mint_private_erc721_token',
      arguments: {
        to_address: params.toAddress,
        token_address: contractAddress,
        token_uri: params.tokenUri,
      },
    },
    jsonrpc: '2.0',
    id: 2,
  };

  // Function to attempt the API call
  const attemptMint = async (currentSessionId: string): Promise<MintNFTResponse> => {
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for blockchain operations

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/event-stream',
          'Accept-Language': 'en-US,en;q=0.9',
          'Content-Type': 'application/json',
          'mcp-session-id': currentSessionId,
          'Origin': 'https://smithery.ai',
          'Priority': 'u=1, i',
          'Referer': 'https://smithery.ai/',
          'Sec-Ch-Ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"macOS"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('API Error Response:', errorText);

        // Check if it's a transport closed error
        if (errorText.includes('Transport is closed') || response.status === 400) {
          throw new Error('TRANSPORT_CLOSED');
        }

        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Check if response is empty (common for long-running blockchain operations)
      const responseText = await response.text();
      if (!responseText.trim()) {
        return {
          success: false,
          error: 'Empty response from COTI API. The transaction may still be processing. Please check COTI Explorer for your transaction.',
        };
      }

      // Handle Server-Sent Events (SSE) format
      let data;
      if (responseText.startsWith('event: message\ndata: ')) {
        // Extract JSON from SSE format
        const jsonPart = responseText.replace('event: message\ndata: ', '').trim();
        data = JSON.parse(jsonPart);
      } else {
        // Handle regular JSON response
        data = JSON.parse(responseText);
      }

      if (data.error) {
        console.log('API Error Data:', data.error);

        // Check if it's a transport/session error
        if (data.error === 'Transport is closed' ||
            data.error.message?.includes('Transport is closed') ||
            data.error.message?.includes('session') ||
            data.error.code === 'TRANSPORT_CLOSED') {
          throw new Error('TRANSPORT_CLOSED');
        }

        return {
          success: false,
          error: data.error.message || data.error || 'Unknown error occurred',
        };
      }

      // Log the full response for debugging
      console.log('COTI API Response:', data);

      // Extract information from MCP response format
      const result = data.result;

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
      }

      return {
        success: false,
        error: 'Invalid response format from COTI MCP API',
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'TRANSPORT_CLOSED') {
        throw error; // Re-throw to trigger retry logic
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - the minting process took too long',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Failed to mint NFT - unknown error occurred',
      };
    }
  };

  try {
    // Use the existing session directly - no need to initialize
    console.log('Using existing session for minting:', sessionId);
    return await attemptMint(sessionId);
  } catch (error) {
    // If transport is closed, provide helpful error message
    if (error instanceof Error && error.message === 'TRANSPORT_CLOSED') {
      console.log('Transport closed - session has expired');

      return {
        success: false,
        error: 'COTI MCP session has expired. This is normal after some time of inactivity. Please refresh the page and try again, or contact support for a new session.',
      };
    }

    // For other errors, return appropriate error message
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to mint NFT - unknown error occurred',
    };
  }
}
