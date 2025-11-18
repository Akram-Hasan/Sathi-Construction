# Sathi Constructions Backend API

Backend API for Sathi Constructions Management System built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT Authentication
- 👥 User Management (Admin/User roles)
- 🏗️ Project Management
- 👷 Manpower Management
- 📊 Progress Tracking
- 📦 Materials Management
- 💰 Finance Tracking
- 📍 Location Tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sarthi-constructions
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:19006
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Seed database (optional):
```bash
node scripts/seed.js
```

6. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-location` - Update user location

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)
- `GET /api/projects/status/started` - Get started projects
- `GET /api/projects/status/not-started` - Get not started projects

### Manpower
- `GET /api/manpower` - Get all manpower
- `GET /api/manpower/available` - Get available manpower
- `POST /api/manpower` - Create manpower (Admin only)
- `PUT /api/manpower/:id` - Update manpower (Admin only)
- `DELETE /api/manpower/:id` - Delete manpower (Admin only)

### Progress
- `GET /api/progress` - Get all progress reports
- `GET /api/progress/project/:projectId` - Get project progress
- `POST /api/progress` - Create progress report
- `PUT /api/progress/:id` - Update progress report

### Materials
- `GET /api/materials` - Get all materials
- `GET /api/materials/available` - Get available materials
- `GET /api/materials/required` - Get required materials
- `POST /api/materials` - Create material entry
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material

### Finance
- `GET /api/finance` - Get all finance records (Admin only)
- `GET /api/finance/summary` - Get finance summary (Admin only)
- `GET /api/finance/project/:projectId` - Get project finance
- `POST /api/finance` - Create finance record (Admin only)
- `PUT /api/finance/:id` - Update finance record (Admin only)

### Location
- `GET /api/location` - Get all staff locations
- `GET /api/location/user/:userId` - Get user location

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Default Credentials

After seeding:
- Admin: admin@sathi.com / admin123
- User: user@sathi.com / user123




