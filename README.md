# Wastland Kings Forum

React + TypeScript + Vite forum application with Firebase backend and image upload capabilities.

## Features

- 🔐 **Authentication**: Firebase Auth with email/password and Google OAuth
- 👥 **Role System**: Admin and user roles with permissions
- 💬 **Forum**: Sections, topics, posts with rich text editing
- 🖼️ **Image Upload**: Multiple hosting services (ImgBB, Cloudinary, Firebase Storage)
- 📱 **Responsive**: Mobile-friendly design with Bootstrap
- ⚡ **Fast**: React Query for efficient data fetching

## Quick Start

### 🚀 Fast Setup (Recommended)

**Option A: Using scripts**
```bash
# Linux/Mac
./setup-env.sh

# Windows
setup-env.bat
```

**Option B: Manual setup**
Create `.env` file in project root:
```env
VITE_IMAGE_UPLOAD_SERVICE=imgbb
VITE_IMGBB_API_KEY=4e22e91958b715051b583256f6ad5680
VITE_MAX_FILE_SIZE=33554432
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/bmp
```

### 📦 Install & Run
```bash
yarn install
yarn dev
```

**📋 See [QUICK_SETUP.md](QUICK_SETUP.md) for detailed setup instructions**

## Production Deployment

### GitHub Actions Setup

1. **Add GitHub Secret**:
   - Go to: Settings → Secrets and variables → Actions
   - Add secret: `IMGBB_API_KEY` = `4e22e91958b715051b583256f6ad5680`

2. **Deploy**:
   - Push to `main` branch triggers automatic deployment
   - Pull requests create preview deployments

### Manual Deployment
```bash
yarn build
firebase deploy
```

## Image Upload Services

The project supports multiple image hosting services:

- **ImgBB** (Default): Free, 32MB limit, fast CDN
- **Cloudinary**: Free tier, image optimization
- **Firebase Storage**: Google infrastructure, security rules
- **Base64**: Local storage, no external dependencies

**🔄 Easy switching**: Change `VITE_IMAGE_UPLOAD_SERVICE` in `.env` to switch services

See [README_IMAGE_UPLOAD.md](README_IMAGE_UPLOAD.md) for detailed setup instructions.

## Project Structure

```
src/
├── Components/          # React components
│   ├── RichTextEditor/  # Rich text editor with image upload
│   ├── Forum/          # Forum-specific components
│   └── Admin/          # Admin panel components
├── pages/              # Page components
├── services/           # API services
├── hooks/              # Custom React hooks
├── config/             # Configuration files
└── types/              # TypeScript type definitions
```

## Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_IMAGE_UPLOAD_SERVICE` | Image upload service | `imgbb` |
| `VITE_IMGBB_API_KEY` | ImgBB API key | Required for ImgBB |
| `VITE_MAX_FILE_SIZE` | Max file size (bytes) | `33554432` |
| `VITE_ALLOWED_FILE_TYPES` | Allowed MIME types | `image/jpeg,image/png,image/gif,image/webp,image/bmp` |

## Documentation

- [Quick Setup Guide](QUICK_SETUP.md) ⭐ **Start here**
- [Image Upload Setup](README_IMAGE_UPLOAD.md)
- [GitHub Secrets Setup](GITHUB_SECRETS_SETUP.md)
- [Firebase Setup](FIREBASE_SETUP.md)
- [ImgBB Setup](IMGBB_SETUP.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
