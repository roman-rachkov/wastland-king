// Cloudinary API service for image hosting
// Sign up at: https://cloudinary.com/

import { imageUploadConfig } from '../config/imageUpload';

export interface CloudinaryResponse {
  public_id: string;
  version: number;
  width: number;
  height: number;
  format: string;
  created_at: string;
  resource_type: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
}

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    // Check if Cloudinary is configured
    if (!imageUploadConfig.cloudinaryCloudName || 
        !imageUploadConfig.cloudinaryUploadPreset ||
        imageUploadConfig.cloudinaryCloudName === 'YOUR_CLOUD_NAME') {
      throw new Error('Cloudinary not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file');
    }

    const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${imageUploadConfig.cloudinaryCloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', imageUploadConfig.cloudinaryUploadPreset);
    
    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: CloudinaryResponse = await response.json();
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (url: string, width: number = 800): string => {
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  // Add transformation parameters for optimization
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
}; 