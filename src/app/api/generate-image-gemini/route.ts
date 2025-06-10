import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const config = {
      responseModalities: ['IMAGE', 'TEXT'],
      responseMimeType: 'text/plain',
    };

    const model = 'gemini-2.0-flash-exp-image-generation';
    
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    console.log('Generating image with Gemini for prompt:', prompt);

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let imageData: string | null = null;
    let textResponse = '';

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue;
      }

      // Check for image data
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData;
        imageData = inlineData.data || null;
      }
      
      // Collect text response
      if (chunk.text) {
        textResponse += chunk.text;
      }
    }

    if (!imageData) {
      console.error('No image data received from Gemini');
      return NextResponse.json(
        { error: 'Failed to generate image - no image data received' },
        { status: 500 }
      );
    }

    // Convert base64 to data URL
    const imageUrl = `data:image/png;base64,${imageData}`;

    console.log('Image generated successfully');

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      textResponse: textResponse.trim(),
    });

  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    
    // Check if it's a specific Gemini API error
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid Gemini API key' },
          { status: 401 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json(
          { error: 'Gemini API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    );
  }
}
