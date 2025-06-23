@echo off
echo Setting up .env file for local development...

REM Create .env file with comprehensive configuration
(
echo # ========================================
echo # Image Upload Service Configuration
echo # ========================================
echo.
echo # Choose your image upload service:
echo # - imgbb: Free, 32MB limit, fast CDN (recommended)
echo # - cloudinary: Free tier, image optimization
echo # - firebase: Google infrastructure, security rules
echo # - base64: Local storage, no external dependencies
echo VITE_IMAGE_UPLOAD_SERVICE=imgbb
echo.
echo # ========================================
echo # ImgBB Configuration (Free Service)
echo # ========================================
echo # Get your API key from: https://api.imgbb.com/
echo # Sign up for free account and get API key from dashboard
echo VITE_IMGBB_API_KEY=4e22e91958b715051b583256f6ad5680
echo.
echo # ========================================
echo # Cloudinary Configuration (Alternative)
echo # ========================================
echo # Uncomment and configure if you want to use Cloudinary instead:
echo # VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
echo # VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
echo # 
echo # Setup instructions:
echo # 1. Sign up at https://cloudinary.com/
echo # 2. Get Cloud Name from dashboard
echo # 3. Create upload preset (set to "unsigned" for client-side uploads)
echo # 4. Change VITE_IMAGE_UPLOAD_SERVICE to "cloudinary"
echo.
echo # ========================================
echo # Firebase Storage Configuration (Alternative)
echo # ========================================
echo # Uncomment and configure if you want to use Firebase Storage:
echo # VITE_FIREBASE_STORAGE_BUCKET=your_bucket_name
echo # 
echo # Setup instructions:
echo # 1. Set up Firebase Storage in Firebase console
echo # 2. Configure security rules to allow uploads
echo # 3. Change VITE_IMAGE_UPLOAD_SERVICE to "firebase"
echo.
echo # ========================================
echo # File Upload Limits
echo # ========================================
echo.
echo # Maximum file size in bytes
echo # - ImgBB: 32MB (33554432 bytes)
echo # - Cloudinary: 100MB (104857600 bytes)
echo # - Firebase: 5MB (5242880 bytes)
echo # - Base64: 1MB (1048576 bytes)
echo VITE_MAX_FILE_SIZE=33554432
echo.
echo # Allowed file types (comma-separated MIME types)
echo # Supported formats: JPEG, PNG, GIF, WebP, BMP
echo VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/bmp
echo.
echo # ========================================
echo # Service Comparison
echo # ========================================
echo # ^| Service    ^| Max Size ^| Features                    ^| Setup Difficulty ^|
echo # ^|------------^|----------^|----------------------------^|------------------^|
echo # ^| ImgBB      ^| 32MB     ^| Free, CDN, Simple          ^| Easy             ^|
echo # ^| Cloudinary ^| 100MB    ^| Optimization, Advanced     ^| Medium           ^|
echo # ^| Firebase   ^| 5MB      ^| Security, Integration      ^| Hard             ^|
echo # ^| Base64     ^| 1MB      ^| No external deps, Privacy  ^| None             ^|
) > .env

echo ✅ .env file created successfully!
echo.
echo 📝 Current Configuration:
echo    - Image upload service: ImgBB
echo    - Max file size: 32MB
echo    - Supported formats: JPEG, PNG, GIF, WebP, BMP
echo.
echo 🔄 To switch services:
echo    1. Edit .env file
echo    2. Change VITE_IMAGE_UPLOAD_SERVICE
echo    3. Configure service-specific variables
echo    4. Restart development server
echo.
echo 📚 See README_IMAGE_UPLOAD.md for detailed setup instructions
echo.
echo 🚀 You can now run: npm run dev
pause 