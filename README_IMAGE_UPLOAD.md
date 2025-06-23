# Image Upload System

This project includes a flexible image upload system that supports multiple hosting services with automatic fallback to base64 encoding.

## Features

- **Multiple hosting services**: ImgBB, Cloudinary, Firebase Storage
- **Automatic fallback**: Falls back to base64 if external service fails
- **Drag & drop**: Support for dragging images directly into the editor
- **Paste support**: Paste images from clipboard
- **File validation**: Size and type validation
- **Environment configuration**: Easy setup via environment variables

## Quick Setup

1. **Copy environment template**:
   ```bash
   cp env.example .env
   ```

2. **Configure your preferred service** in `.env`:
   ```env
   # Choose your service
   VITE_IMAGE_UPLOAD_SERVICE=imgbb
   
   # ImgBB (Free, recommended)
   VITE_IMGBB_API_KEY=your_api_key_here
   
   # OR Cloudinary
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   
   # OR Firebase Storage
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket_name
   ```

3. **Restart your development server** after making changes to `.env`

## Service Setup

### ImgBB (Recommended - Free)

1. Go to [https://api.imgbb.com/](https://api.imgbb.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env`:
   ```env
   VITE_IMGBB_API_KEY=your_api_key_here
   VITE_IMAGE_UPLOAD_SERVICE=imgbb
   ```

**Pros**: Free, fast CDN, simple setup
**Cons**: 32MB file limit

### Cloudinary

1. Sign up at [https://cloudinary.com/](https://cloudinary.com/)
2. Get your Cloud Name from the dashboard
3. Create an upload preset (set to "unsigned" for client-side uploads)
4. Add to `.env`:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   VITE_IMAGE_UPLOAD_SERVICE=cloudinary
   ```

**Pros**: Free tier, image optimization, advanced features
**Cons**: More complex setup

### Firebase Storage

1. Set up Firebase Storage in your Firebase console
2. Configure security rules to allow uploads
3. Add to `.env`:
   ```env
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket_name
   VITE_IMAGE_UPLOAD_SERVICE=firebase
   ```

**Pros**: Google infrastructure, security rules
**Cons**: Requires Firebase setup, 5MB limit

### Base64 (Fallback)

If no external service is configured, images will be stored as base64 strings in the database.

**Pros**: No external dependencies, works offline
**Cons**: Large database size, 1MB limit

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_IMAGE_UPLOAD_SERVICE` | Service to use | `imgbb` |
| `VITE_MAX_FILE_SIZE` | Maximum file size in bytes | `33554432` (32MB) |
| `VITE_ALLOWED_FILE_TYPES` | Comma-separated MIME types | `image/jpeg,image/png,image/gif,image/webp,image/bmp` |

### File Limits by Service

| Service | Max File Size | Features |
|---------|---------------|----------|
| ImgBB | 32MB | Free, CDN |
| Cloudinary | 100MB | Optimization |
| Firebase | 5MB | Security |
| Base64 | 1MB | Local |

## Usage

### In React Components

```tsx
import RichTextEditor from './Components/RichTextEditor/RichTextEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
    />
  );
}
```

### Programmatic Upload

```tsx
import { uploadImage } from './services/imageUpload';

const handleFileUpload = async (file: File) => {
  try {
    const imageUrl = await uploadImage(file);
    console.log('Uploaded:', imageUrl);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## Troubleshooting

### "Service not configured" Error

1. Check that your `.env` file exists and has the correct variables
2. Verify API keys are correct
3. Restart the development server after changing `.env`
4. Check browser console for detailed error messages

### CORS Errors

- **ImgBB**: Should work without CORS issues
- **Cloudinary**: Make sure upload preset is set to "unsigned"
- **Firebase**: Check security rules allow uploads

### Large File Errors

- Check `VITE_MAX_FILE_SIZE` in your `.env`
- Verify service-specific limits
- Consider image compression before upload

### Service Status

The editor shows the current service and configuration status:
- ✅ **Configured**: Service is properly set up
- ⚠️ **Not configured**: Using fallback (base64)

## Security Notes

- API keys in `.env` are exposed to the client (this is normal for client-side uploads)
- Use unsigned upload presets for Cloudinary
- Configure Firebase Storage rules appropriately
- Consider server-side uploads for sensitive applications

## Development

### Adding a New Service

1. Create a new service file in `src/services/`
2. Add configuration to `src/config/imageUpload.ts`
3. Update the main `uploadImage` function
4. Add environment variables to `env.example`

### Testing

```bash
# Test with different services
VITE_IMAGE_UPLOAD_SERVICE=imgbb npm run dev
VITE_IMAGE_UPLOAD_SERVICE=cloudinary npm run dev
VITE_IMAGE_UPLOAD_SERVICE=base64 npm run dev
```

## Support

For issues with specific services:
- **ImgBB**: [API Documentation](https://api.imgbb.com/)
- **Cloudinary**: [Upload API](https://cloudinary.com/documentation/upload_images)
- **Firebase**: [Storage Documentation](https://firebase.google.com/docs/storage) 