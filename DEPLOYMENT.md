# Deployment Guide

## Quick Start

### 1. Backend Deployment (Vercel)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Root Directory**: Set to `/backend` in Vercel settings
3. **Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notes-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
4. **Deploy**: Vercel will automatically deploy

### 2. Frontend Deployment (Vercel)

1. **Create New Project**: Deploy from `/frontend` directory
2. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   ```
3. **Deploy**: Vercel will automatically deploy

### 3. Database Setup

1. **MongoDB Atlas**:
   - Create free cluster
   - Get connection string
   - Update `MONGODB_URI` in backend environment

2. **Seed Database**:
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
# Create .env file with local MongoDB URI
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

## Testing

1. **Health Check**: `GET /health`
2. **Login**: Use test accounts from README
3. **Create Notes**: Test CRUD operations
4. **Upgrade**: Test subscription upgrade (Admin only)

## URLs

- **Backend**: `https://your-backend.vercel.app`
- **Frontend**: `https://your-frontend.vercel.app`
- **Health**: `https://your-backend.vercel.app/health`
