export type ImageSource = 'upload' | 'generate';

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface ImageData {
  source: ImageSource;
  file?: File;
  generatedImage?: GeneratedImage;
  preview?: string;
}
