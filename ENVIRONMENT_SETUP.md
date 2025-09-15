# Environment Variables Setup

## Required Environment Variables

Your application requires the following environment variables to be set:

### 1. Database Configuration
```
MONGODB_URI=mongodb+srv://youtubeuser:12345@cluster0.8b4rz.mongodb.net/notesapp?retryWrites=true&w=majority&appName=Cluster0&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&socketTimeoutMS=45000&maxPoolSize=10&minPoolSize=5&maxIdleTimeMS=30000
```

### 2. Frontend URL
```
FRONTEND_URL=https://notes-immx.vercel.app
```

### 3. JWT Configuration
```
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d
```

### 4. Server Configuration
```
PORT=5000
NODE_ENV=production
```

## Setup Instructions

### For Local Development:
1. Create a `.env` file in the `backend/` directory
2. Copy the variables above into the `.env` file
3. Replace `your_secure_jwt_secret_here` with a secure random string

### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to the "Environment Variables" section
4. Add each variable listed above
5. Make sure to set them for "Production" environment

## Security Notes:
- Never commit your `.env` file to version control
- Use a strong, random JWT secret for production
- The JWT secret should be at least 32 characters long
