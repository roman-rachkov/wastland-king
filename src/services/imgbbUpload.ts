// ImgBB API service for image hosting
// Get your API key from: https://api.imgbb.com/

import { imageUploadConfig } from '../config/imageUpload';

const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url: string;
    display_url: string;
    size: number;
    delete_url: string;
    time: string;
  };
  success: boolean;
  status: number;
}

export const uploadImageToImgBB = async (file: File): Promise<string> => {
  try {
    // Check if API key is configured
    if (!imageUploadConfig.imgbbApiKey || imageUploadConfig.imgbbApiKey === 'YOUR_IMGBB_API_KEY') {
      throw new Error('ImgBB API key not configured. Please set VITE_IMGBB_API_KEY in your .env file');
    }

    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // Prepare form data
    const formData = new FormData();
    formData.append('key', imageUploadConfig.imgbbApiKey);
    formData.append('image', base64);
    formData.append('name', file.name);
    
    // Upload to ImgBB
    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ImgBBResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to upload image to ImgBB');
    }
    
    return result.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw new Error('Failed to upload image');
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// Alternative: Upload using multipart form data (more efficient)
export const uploadImageToImgBBMultipart = async (file: File): Promise<string> => {
  try {
    // Check if API key is configured
    if (!imageUploadConfig.imgbbApiKey || imageUploadConfig.imgbbApiKey === 'YOUR_IMGBB_API_KEY') {
      throw new Error('ImgBB API key not configured. Please set VITE_IMGBB_API_KEY in your .env file');
    }

    const formData = new FormData();
    formData.append('key', imageUploadConfig.imgbbApiKey);
    formData.append('image', file);
    
    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ImgBBResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to upload image to ImgBB');
    }
    
    return result.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw new Error('Failed to upload image');
  }
}; 