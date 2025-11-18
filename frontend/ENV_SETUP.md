# 🔧 Environment Variables Setup Guide

## Quick Setup

### Backend Setup

1. **Navigate to backend folder:**
```bash
cd backend
```

2. **Copy example.env to .env:**
```bash
# Windows
copy example.env .env

# Mac/Linux
cp example.env .env
```

3. **Edit .env file and update:**
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong random string (use: `openssl rand -base64 32`)
   - `PORT` - Server port (default: 5000)
   - `FRONTEND_URL` - Frontend URL for CORS

### Frontend Setup

1. **Copy example.env to .env (in project root):**
```bash
# Windows
copy example.env .env

# Mac/Linux
cp example.env .env
```

2. **Edit .env file and update:**
   - `EXPO_PUBLIC_API_URL` - Backend API URL based on your environment:
     - **Android Emulator**: `http://10.0.2.2:5000/api`
     - **iOS Simulator**: `http://localhost:5000/api`
     - **Physical Device**: `http://YOUR_COMPUTER_IP:5000/api`

## Environment-Specific Configurations

### Development (Local)
```env
# Backend (.env in backend/)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sarthi-constructions
JWT_SECRET=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:19006

# Frontend (.env in root/)
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### Physical Device Testing
```env
# Frontend (.env in root/)
# Replace 192.168.1.100 with your computer's IP
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
```

### Production
```env
# Backend (.env in backend/)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sarthi-constructions
JWT_SECRET=<strong-random-32-char-string>
FRONTEND_URL=https://yourdomain.com

# Frontend (.env in root/)
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## Finding Your Computer's IP Address

### Windows
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

### Mac/Linux
```bash
ifconfig
# Look for "inet" under your active network adapter (usually en0 or eth0)
```

### Quick Method
- Windows: `ipconfig | findstr IPv4`
- Mac/Linux: `ifconfig | grep "inet "`

## Security Notes

⚠️ **IMPORTANT:**
1. **Never commit .env files to Git**
2. **Use strong JWT_SECRET in production** (minimum 32 characters)
3. **Use environment-specific values**
4. **Keep .env files secure and private**

## Verifying Setup

### Backend
```bash
cd backend
node -e "require('dotenv').config(); console.log('MongoDB:', process.env.MONGODB_URI ? 'Set' : 'Missing');"
```

### Frontend
After setting up .env, restart Expo:
```bash
npm start
```

The API URL will be loaded from `EXPO_PUBLIC_API_URL` environment variable.

## Troubleshooting

### Backend can't connect to MongoDB
- Check `MONGODB_URI` is correct
- Ensure MongoDB is running
- Verify network connectivity

### Frontend can't connect to backend
- Verify backend is running on correct port
- Check `EXPO_PUBLIC_API_URL` matches backend URL
- For physical device, ensure same WiFi network
- Check firewall settings

### Environment variables not loading
- Ensure .env file is in correct location
- Restart server/app after changing .env
- Check for typos in variable names
- Verify no extra spaces in .env file



