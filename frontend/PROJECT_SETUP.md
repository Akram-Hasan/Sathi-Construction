# Sathi Constructions - Complete Project Setup Guide

## 🚀 Project Overview

A full-stack construction management system with:
- **Frontend**: React Native (Expo) mobile app
- **Backend**: Node.js + Express + MongoDB REST API
- **Features**: Project management, Manpower tracking, Progress monitoring, Materials management, Finance tracking, Location tracking

## 📁 Project Structure

```
sarthi-expo/
├── backend/                 # Backend API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & validation middleware
│   ├── scripts/            # Database seeding
│   └── server.js           # Express server
├── src/                    # Frontend React Native
│   ├── components/         # Reusable components
│   ├── screens/            # Screen components
│   ├── services/           # API service layer
│   ├── navigation/         # Navigation setup
│   ├── styles/             # Shared styles
│   └── config/             # Configuration
└── App.js                  # Main app entry
```

## 🛠️ Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
cp .env.example .env
```

4. **Update `.env` with your configuration:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sarthi-constructions
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:19006
```

5. **Start MongoDB:**
   - If using local MongoDB: `mongod`
   - Or use MongoDB Atlas (cloud)

6. **Seed the database (optional):**
```bash
node scripts/seed.js
```

7. **Start the backend server:**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Update API URL in `src/services/api.js`:**
   - For Android Emulator: `http://10.0.2.2:5000/api`
   - For iOS Simulator: `http://localhost:5000/api`
   - For Physical Device: `http://YOUR_COMPUTER_IP:5000/api`

3. **Start Expo:**
```bash
npm start
```

4. **Run on device:**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 🔐 Default Credentials

After seeding the database:
- **Admin**: `admin@sathi.com` / `admin123`
- **User**: `user@sathi.com` / `user123`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-location` - Update location

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Admin)
- `GET /api/projects/status/started` - Get started projects
- `GET /api/projects/status/not-started` - Get not started projects

### Manpower
- `GET /api/manpower` - Get all manpower
- `POST /api/manpower` - Create manpower (Admin)
- `GET /api/manpower/available` - Get available manpower

### Progress
- `POST /api/progress` - Create progress report
- `GET /api/progress/project/:id` - Get project progress

### Materials
- `GET /api/materials/available` - Get available materials
- `GET /api/materials/required` - Get required materials
- `POST /api/materials` - Create material entry

### Finance
- `GET /api/finance/summary` - Get finance summary (Admin)
- `GET /api/finance/project/:id` - Get project finance

### Location
- `GET /api/location` - Get all staff locations

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sarthi-constructions
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:19006
```

### Frontend
Update `src/services/api.js` with your backend URL:
```javascript
baseURL: 'http://YOUR_IP:5000/api'
```

## 🧪 Testing the Setup

1. **Start Backend:**
```bash
cd backend
npm run dev
```

2. **Start Frontend:**
```bash
npm start
```

3. **Test Login:**
   - Use admin credentials
   - Should navigate to admin dashboard

4. **Test Features:**
   - Create a project (Admin)
   - Add manpower (Admin)
   - Submit progress (User)
   - View materials (User)

## 🐛 Troubleshooting

### Backend Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env

2. **Port Already in Use:**
   - Change PORT in .env
   - Or kill process using port 5000

### Frontend Issues

1. **API Connection Error:**
   - Check backend is running
   - Verify API URL in `src/services/api.js`
   - For physical device, use computer's IP address

2. **Token Not Saving:**
   - Ensure AsyncStorage is installed
   - Check permissions on device

## 📦 Dependencies

### Backend
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- helmet
- morgan

### Frontend
- react-native
- expo
- axios
- @react-native-async-storage/async-storage
- @react-navigation/native
- expo-linear-gradient

## 🚀 Deployment

### Backend
- Deploy to Heroku, Railway, or AWS
- Update MONGODB_URI to production database
- Set NODE_ENV=production

### Frontend
- Build with Expo: `expo build:android` or `expo build:ios`
- Or use EAS Build: `eas build`

## 📝 Next Steps

1. Add image upload functionality
2. Add push notifications
3. Add real-time updates with WebSockets
4. Add reporting and analytics
5. Add offline support
6. Add data export features

## 🤝 Support

For issues or questions, check:
- Backend logs in terminal
- Frontend logs in Expo DevTools
- MongoDB connection status
- API endpoint responses



