import { uploadImageToImgBBMultipart } from './imgbbUpload';
import { uploadImageToCloudinary } from './cloudinaryUpload';
import { imageUploadConfig, validateImageFile, isServiceConfigured } from '../config/imageUpload';

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Validate file first
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Check if selected service is configured
    if (!isServiceConfigured(imageUploadConfig.service)) {
      console.warn(`Service ${imageUploadConfig.service} is not configured, falling back to base64`);
      throw new Error(`${imageUploadConfig.service} is not configured`);
    }

    // Use configured service
    switch (imageUploadConfig.service) {
      case 'imgbb':
        return await uploadImageToImgBBMultipart(file);
      
      case 'cloudinary':
        return await uploadImageToCloudinary(file);
      
      case 'firebase':
        // Fallback to base64 for now since Firebase Storage needs setup
        throw new Error('Firebase Storage not configured');
      
      case 'base64':
      default:
        // Convert to base64 for local storage
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Fallback: convert to base64 for local storage
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
};

export const uploadImageFromBase64 = async (base64Data: string): Promise<string> => {
  try {
    // Convert base64 to blob
    const response = await fetch(base64Data);
    const blob = await response.blob();
    
    // Create a file from blob
    const file = new File([blob], `image_${Date.now()}.png`, { type: 'image/png' });
    
    // Upload using the existing function
    return await uploadImage(file);
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    throw new Error('Failed to upload image');
  }
}; 