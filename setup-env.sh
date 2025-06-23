#!/bin/bash

# Setup .env file for local development
echo "Setting up .env file for local development..."

# Create .env file with comprehensive configuration
cat > .env << 'EOF'
# ========================================
# Image Upload Service Configuration
# ========================================

# Choose your image upload service:
# - imgbb: Free, 32MB limit, fast CDN (recommended)
# - cloudinary: Free tier, image optimization
# - firebase: Google infrastructure, security rules
# - base64: Local storage, no external dependencies
VITE_IMAGE_UPLOAD_SERVICE=imgbb

# ========================================
# ImgBB Configuration (Free Service)
# ========================================
# Get your API key from: https://api.imgbb.com/
# Sign up for free account and get API key from dashboard
VITE_IMGBB_API_KEY=4e22e91958b715051b583256f6ad5680

# ========================================
# Cloudinary Configuration (Alternative)
# ========================================
# Uncomment and configure if you want to use Cloudinary instead:
# VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
# VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
# 
# Setup instructions:
# 1. Sign up at https://cloudinary.com/
# 2. Get Cloud Name from dashboard
# 3. Create upload preset (set to "unsigned" for client-side uploads)
# 4. Change VITE_IMAGE_UPLOAD_SERVICE to "cloudinary"

# ========================================
# Firebase Storage Configuration (Alternative)
# ========================================
# Uncomment and configure if you want to use Firebase Storage:
# VITE_FIREBASE_STORAGE_BUCKET=your_bucket_name
# 
# Setup instructions:
# 1. Set up Firebase Storage in Firebase console
# 2. Configure security rules to allow uploads
# 3. Change VITE_IMAGE_UPLOAD_SERVICE to "firebase"

# ========================================
# File Upload Limits
# ========================================

# Maximum file size in bytes
# - ImgBB: 32MB (33554432 bytes)
# - Cloudinary: 100MB (104857600 bytes)
# - Firebase: 5MB (5242880 bytes)
# - Base64: 1MB (1048576 bytes)
VITE_MAX_FILE_SIZE=33554432

# Allowed file types (comma-separated MIME types)
# Supported formats: JPEG, PNG, GIF, WebP, BMP
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/bmp

# ========================================
# Service Comparison
# ========================================
# | Service    | Max Size | Features                    | Setup Difficulty |
# |------------|----------|----------------------------|------------------|
# | ImgBB      | 32MB     | Free, CDN, Simple          | Easy             |
# | Cloudinary | 100MB    | Optimization, Advanced     | Medium           |
# | Firebase   | 5MB      | Security, Integration      | Hard             |
# | Base64     | 1MB      | No external deps, Privacy  | None             |
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📝 Current Configuration:"
echo "   - Image upload service: ImgBB"
echo "   - Max file size: 32MB"
echo "   - Supported formats: JPEG, PNG, GIF, WebP, BMP"
echo ""
echo "🔄 To switch services:"
echo "   1. Edit .env file"
echo "   2. Change VITE_IMAGE_UPLOAD_SERVICE"
echo "   3. Configure service-specific variables"
echo "   4. Restart development server"
echo ""
echo "📚 See README_IMAGE_UPLOAD.md for detailed setup instructions"
echo ""
echo "🚀 You can now run: npm run dev" 