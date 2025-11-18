# 🏗️ Sathi Constructions - Complete Management System

A full-stack construction management system built with React Native (Expo) and Node.js + Express + MongoDB.

## ✨ Features

### Admin Features
- ✅ Project Management (Create, View, Update, Delete)
- ✅ Manpower Management
- ✅ Work Progress Tracking
- ✅ Project Status Monitoring
- ✅ Staff Location Tracking
- ✅ Finance Summary & Reports
- ✅ Materials Overview

### User/Staff Features
- ✅ View Assigned Projects
- ✅ Submit Progress Reports
- ✅ Report Not Started Reasons
- ✅ View Available Materials
- ✅ Request Materials
- ✅ View Available Manpower
- ✅ Update Location

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Expo CLI
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/sarthi-constructions

# Seed database (optional)
node scripts/seed.js

# Start server
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
# Install dependencies
npm install

# Update API URL in src/services/api.js
# For Android Emulator: http://10.0.2.2:5000/api
# For iOS Simulator: http://localhost:5000/api
# For Physical Device: http://YOUR_IP:5000/api

# Start Expo
npm start
```

## 🔐 Default Credentials

After seeding:
- **Admin**: `admin@sathi.com` / `admin123`
- **User**: `user@sathi.com` / `user123`

## 📱 Project Structure

```
sarthi-expo/
├── backend/              # Node.js + Express API
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & validation
│   └── server.js        # Express server
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── services/        # API service layer
│   ├── navigation/      # Navigation setup
│   └── styles/          # Shared styles
└── App.js              # Main app entry
```

## 🛠️ Tech Stack

### Frontend
- React Native (Expo)
- React Navigation
- Axios
- AsyncStorage
- Expo Linear Gradient

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs
- Express Validator

## 📚 API Documentation

See `backend/README.md` for complete API documentation.

## 🔧 Configuration

### Backend Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sarthi-constructions
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:19006
```

### Frontend API Configuration
Update `src/services/api.js`:
```javascript
baseURL: 'http://YOUR_IP:5000/api'
```

## 🧪 Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm start`
3. Login with admin credentials
4. Test features:
   - Create a project
   - Add manpower
   - Submit progress
   - View materials

## 📦 Installation Commands

```bash
# Backend
cd backend
npm install

# Frontend
npm install
```

## 🐛 Troubleshooting

### Backend Issues
- **MongoDB Connection**: Ensure MongoDB is running
- **Port Conflict**: Change PORT in .env
- **JWT Error**: Check JWT_SECRET in .env

### Frontend Issues
- **API Connection**: Verify backend URL in `src/services/api.js`
- **Token Issues**: Check AsyncStorage permissions
- **Network Error**: Use correct IP for physical device

## 📝 License

This project is private and proprietary.

## 🤝 Support

For issues, check:
- Backend logs
- Frontend Expo DevTools
- MongoDB connection status
- API endpoint responses

---

**Built with ❤️ for Sathi Constructions**



