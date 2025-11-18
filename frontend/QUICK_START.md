# 🚀 Quick Start Guide

## Step 1: Backend Setup (5 minutes)

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
# Copy .env.example to .env and update:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any random string)

# 4. Make sure MongoDB is running
# Local: mongod
# Or use MongoDB Atlas (cloud)

# 5. Seed database (creates default users)
node scripts/seed.js

# 6. Start backend server
npm run dev
```

✅ Backend should be running on `http://localhost:5000`

## Step 2: Frontend Setup (3 minutes)

```bash
# 1. Install dependencies (from project root)
npm install

# 2. Update API URL in src/services/api.js
# For Android Emulator: http://10.0.2.2:5000/api
# For iOS Simulator: http://localhost:5000/api
# For Physical Device: http://YOUR_COMPUTER_IP:5000/api

# 3. Start Expo
npm start
```

✅ Frontend should start in Expo

## Step 3: Test Login

1. Open app in Expo Go or emulator
2. Login with:
   - **Admin**: `admin@sathi.com` / `admin123`
   - **User**: `user@sathi.com` / `user123`

## 🎯 What's Working

✅ Authentication (Login/Register)  
✅ Project Management (CRUD)  
✅ Manpower Management  
✅ Progress Tracking  
✅ Materials Management  
✅ Finance Tracking  
✅ Location Tracking  
✅ Role-based Access Control  

## 📱 API URL Configuration

### For Physical Device Testing:

1. Find your computer's IP:
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` (look for inet)

2. Update `src/services/api.js`:
   ```javascript
   baseURL: 'http://192.168.1.100:5000/api' // Your IP
   ```

3. Make sure phone and computer are on same WiFi

## 🐛 Common Issues

### Backend won't start
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check if port 5000 is available

### Frontend can't connect
- Verify backend is running
- Check API URL in src/services/api.js
- For physical device, use computer's IP, not localhost

### Login fails
- Make sure database is seeded
- Check backend logs for errors
- Verify credentials match seed data

## 📚 Next Steps

1. Test all features
2. Customize for your needs
3. Add more projects/manpower
4. Deploy backend to cloud
5. Build production app

---

**Need Help?** Check `PROJECT_SETUP.md` for detailed documentation.



