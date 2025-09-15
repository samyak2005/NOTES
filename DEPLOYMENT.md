# Deployment Guide

## Quick Start

### 1. Backend Deployment (Vercel)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Root Directory**: Set to `/backend` in Vercel settings
3. **Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://youtubeuser:12345@cluster0.8b4rz.mongodb.net/notesapp?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=https://notes-immx.vercel.app
   NODE_ENV=production
   ```
4. **Deploy**: Vercel will automatically deploy

### 2. Frontend Deployment (Vercel)

1. **Create New Project**: Deploy from `/frontend` directory
2. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   ```
3. **Deploy**: Vercel will automatically deploy

**Note**: Your frontend is already deployed at: `https://notes-immx.vercel.app`

### 3. Database Setup

1. **MongoDB Atlas**:
   - ✅ **Already configured**: `mongodb+srv://youtubeuser:12345@cluster0.8b4rz.mongodb.net/notesapp`
   - Database name: `notesapp`
   - Cluster: `Cluster0`

2. **Seed Database** (Optional - for initial data):
   ```bash
   cd backend
   npm install
   npm run seed
   ```

## Local Development

### Backend
```bash
cd backend
npm install
# Create .env file with:
# MONGODB_URI=mongodb+srv://youtubeuser:12345@cluster0.8b4rz.mongodb.net/notesapp?retryWrites=true&w=majority&appName=Cluster0
# JWT_SECRET=your-local-jwt-secret
# FRONTEND_URL=http://localhost:3000
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

## Testing

1. **Health Check**: `GET /health`
2. **Login**: Use test accounts from README
3. **Create Notes**: Test CRUD operations
4. **Upgrade**: Test subscription upgrade (Admin only)

## URLs

- **Backend**: `https://notes-wheat.vercel.app` ✅
- **Frontend**: `https://notes-immx.vercel.app` ✅
- **Health**: `https://notes-wheat.vercel.app/health` ✅
