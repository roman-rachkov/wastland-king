// Image upload service configuration
export type ImageUploadService = 'imgbb' | 'cloudinary' | 'firebase' | 'base64';

export interface ImageUploadConfig {
  service: ImageUploadService;
  imgbbApiKey?: string;
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
  maxFileSize: number; // in bytes
  allowedTypes: string[];
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  return import.meta.env[key] || fallback;
};

const getEnvVarNumber = (key: string, fallback: number): number => {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) : fallback;
};

const getEnvVarArray = (key: string, fallback: string[]): string[] => {
  const value = import.meta.env[key];
  return value ? value.split(',').map((s: string) => s.trim()) : fallback;
};

// Default configuration using environment variables
export const imageUploadConfig: ImageUploadConfig = {
  service: (getEnvVar('VITE_IMAGE_UPLOAD_SERVICE', 'imgbb') as ImageUploadService),
  imgbbApiKey: getEnvVar('VITE_IMGBB_API_KEY', ''),
  cloudinaryCloudName: getEnvVar('VITE_CLOUDINARY_CLOUD_NAME', ''),
  cloudinaryUploadPreset: getEnvVar('VITE_CLOUDINARY_UPLOAD_PRESET', ''),
  maxFileSize: getEnvVarNumber('VITE_MAX_FILE_SIZE', 32 * 1024 * 1024), // 32MB default
  allowedTypes: getEnvVarArray('VITE_ALLOWED_FILE_TYPES', [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'image/bmp'
  ]),
};

// Service-specific configurations
export const serviceConfigs = {
  imgbb: {
    name: 'ImgBB',
    url: 'https://api.imgbb.com/',
    maxFileSize: 32 * 1024 * 1024, // 32MB
    features: ['Free', 'Fast CDN', 'Simple API'],
  },
  cloudinary: {
    name: 'Cloudinary',
    url: 'https://cloudinary.com/',
    maxFileSize: 100 * 1024 * 1024, // 100MB
    features: ['Free tier', 'Image optimization', 'Advanced features'],
  },
  firebase: {
    name: 'Firebase Storage',
    url: 'https://firebase.google.com/storage',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    features: ['Google infrastructure', 'Security rules', 'Integration'],
  },
  base64: {
    name: 'Base64 (Local)',
    url: 'local',
    maxFileSize: 1 * 1024 * 1024, // 1MB
    features: ['No external service', 'Works offline', 'Privacy'],
  },
};

// Helper function to validate file
export const validateImageFile = (file: File): string | null => {
  if (file.size > imageUploadConfig.maxFileSize) {
    return `File too large. Maximum size is ${Math.round(imageUploadConfig.maxFileSize / 1024 / 1024)}MB`;
  }
  
  if (!imageUploadConfig.allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${imageUploadConfig.allowedTypes.join(', ')}`;
  }
  
  return null;
};

// Helper function to get service info
export const getServiceInfo = (service: ImageUploadService) => {
  return serviceConfigs[service] || serviceConfigs.base64;
};

// Helper function to check if service is configured
export const isServiceConfigured = (service: ImageUploadService): boolean => {
  switch (service) {
    case 'imgbb':
      return !!imageUploadConfig.imgbbApiKey && imageUploadConfig.imgbbApiKey !== 'YOUR_IMGBB_API_KEY';
    case 'cloudinary':
      return !!imageUploadConfig.cloudinaryCloudName && 
             !!imageUploadConfig.cloudinaryUploadPreset &&
             imageUploadConfig.cloudinaryCloudName !== 'YOUR_CLOUD_NAME';
    case 'firebase':
      return !!getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', '') && 
             getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', '') !== 'YOUR_FIREBASE_STORAGE_BUCKET';
    case 'base64':
      return true; // Always available
    default:
      return false;
  }
}; 