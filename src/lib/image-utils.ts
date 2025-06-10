/**
 * Utility functions for handling images in the NFT minting platform
 */

/**
 * Convert a data URL to a File object
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Convert a base64 string to a File object
 */
export function base64ToFile(base64: string, filename: string, mimeType: string = 'image/png'): File {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], filename, { type: mimeType });
}

/**
 * Check if a string is a valid base64 image
 */
export function isValidBase64Image(str: string): boolean {
  try {
    // Check if it's a data URL
    if (str.startsWith('data:image/')) {
      const base64Part = str.split(',')[1];
      return base64Part ? isValidBase64(base64Part) : false;
    }
    
    // Check if it's just base64
    return isValidBase64(str);
  } catch {
    return false;
  }
}

/**
 * Check if a string is valid base64
 */
function isValidBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

/**
 * Convert any image source to a File object for uploading
 */
export function convertToFile(imageUrl: string, filename?: string): File {
  const timestamp = Date.now();
  const defaultFilename = filename || `generated-nft-${timestamp}.png`;
  
  if (imageUrl.startsWith('data:image/')) {
    return dataUrlToFile(imageUrl, defaultFilename);
  }
  
  // If it's just base64, assume it's PNG
  return base64ToFile(imageUrl, defaultFilename, 'image/png');
}

/**
 * Resize an image while maintaining aspect ratio
 */
export function resizeImage(
  file: File, 
  maxWidth: number = 1024, 
  maxHeight: number = 1024, 
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}
