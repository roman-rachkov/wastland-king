import { imageUploadConfig, isServiceConfigured, getServiceInfo } from '../config/imageUpload';

export interface ConfigStatus {
  service: string;
  configured: boolean;
  message: string;
  details?: string;
}

export const checkImageUploadConfig = (): ConfigStatus => {
  const service = imageUploadConfig.service;
  const configured = isServiceConfigured(service);
  const serviceInfo = getServiceInfo(service);

  let message = '';
  let details = '';

  if (configured) {
    message = `✅ ${serviceInfo.name} is properly configured`;
  } else {
    message = `⚠️ ${serviceInfo.name} is not configured`;
    
    switch (service) {
      case 'imgbb':
        details = 'Set VITE_IMGBB_API_KEY in your .env file';
        break;
      case 'cloudinary':
        details = 'Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file';
        break;
      case 'firebase':
        details = 'Set VITE_FIREBASE_STORAGE_BUCKET in your .env file';
        break;
      default:
        details = 'Using base64 fallback';
    }
  }

  return {
    service,
    configured,
    message,
    details
  };
};

export const logConfigStatus = (): void => {
  const status = checkImageUploadConfig();
  console.log('🔧 Image Upload Configuration:');
  console.log(`   Service: ${status.service}`);
  console.log(`   Status: ${status.message}`);
  if (status.details) {
    console.log(`   Details: ${status.details}`);
  }
  console.log('');
};

// Auto-log on import (for development)
if (import.meta.env.DEV) {
  logConfigStatus();
} 