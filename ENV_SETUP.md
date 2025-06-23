# Environment Variables Setup

## Quick Start

1. **Create `.env` file** in the project root:
   ```bash
   cp env.example .env
   ```

2. **Configure your image upload service**:

   ### Option 1: ImgBB (Recommended - Free)
   ```env
   VITE_IMAGE_UPLOAD_SERVICE=imgbb
   VITE_IMGBB_API_KEY=your_api_key_here
   ```
   
   Get API key: https://api.imgbb.com/

   ### Option 2: Cloudinary
   ```env
   VITE_IMAGE_UPLOAD_SERVICE=cloudinary
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

   ### Option 3: Base64 (No setup required)
   ```env
   VITE_IMAGE_UPLOAD_SERVICE=base64
   ```

3. **Restart development server**:
   ```bash
   npm run dev
   ```

## Available Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_IMAGE_UPLOAD_SERVICE` | Service to use | Yes |
| `VITE_IMGBB_API_KEY` | ImgBB API key | For ImgBB |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | For Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | For Cloudinary |
| `VITE_MAX_FILE_SIZE` | Max file size in bytes | No |
| `VITE_ALLOWED_FILE_TYPES` | Allowed MIME types | No |

## Verification

After setup, the RichTextEditor will show:
- ✅ **Service name** if configured correctly
- ⚠️ **"Not configured"** if using fallback

See `README_IMAGE_UPLOAD.md` for detailed setup instructions. 