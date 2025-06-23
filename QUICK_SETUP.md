# Quick Setup Guide

## 🚀 Fast Setup (Recommended)

### Option 1: Using Scripts

**Linux/Mac:**
```bash
./setup-env.sh
```

**Windows:**
```cmd
setup-env.bat
```

### Option 2: Manual Setup

1. Copy the template:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and replace `YOUR_IMGBB_API_KEY` with your actual key:
   ```env
   VITE_IMGBB_API_KEY=4e22e91958b715051b583256f6ad5680
   ```

## 📋 What the Scripts Create

The setup scripts create a comprehensive `.env` file with:

- ✅ **ImgBB configuration** (ready to use)
- 📝 **Cloudinary setup instructions** (commented)
- 📝 **Firebase Storage setup instructions** (commented)
- 📊 **Service comparison table**
- ⚙️ **File size limits** for each service
- 📁 **Supported file types**

## 🔄 Switching Services

To switch from ImgBB to another service:

1. **Edit `.env` file**
2. **Change service**:
   ```env
   VITE_IMAGE_UPLOAD_SERVICE=cloudinary  # or firebase, base64
   ```
3. **Configure service-specific variables** (uncomment and fill)
4. **Restart development server**

## 🎯 Service Recommendations

| Use Case | Recommended Service | Why |
|----------|-------------------|-----|
| **Quick start** | ImgBB | Free, simple setup |
| **High quality** | Cloudinary | Image optimization |
| **Security focus** | Firebase Storage | Google infrastructure |
| **Privacy focus** | Base64 | No external services |

## 🚨 Important Notes

- **GitHub Secrets**: For production, add `IMGBB_API_KEY` to GitHub Secrets
- **File Limits**: Each service has different size limits
- **Restart Required**: Always restart dev server after changing `.env`
- **Security**: API keys in `.env` are client-side (normal for this setup)

## 📚 More Information

- [Detailed Image Upload Guide](README_IMAGE_UPLOAD.md)
- [GitHub Secrets Setup](GITHUB_SECRETS_SETUP.md)
- [Firebase Setup](FIREBASE_SETUP.md)
- [ImgBB Setup](IMGBB_SETUP.md) 