# CMS Setup Instructions

## Quick Start Guide

Follow these steps to get the CMS running on your machine:

### 1. Prerequisites

Make sure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (local installation or Atlas account)
- npm or yarn

### 2. Install Dependencies

```bash
# From the project root directory
npm run install-all
```

This will install all dependencies for both the backend and frontend.

### 3. Configure MongoDB

#### Option A: Local MongoDB
If you have MongoDB installed locally, make sure it's running:
```bash
# Start MongoDB (varies by OS)
# Linux/Mac:
sudo service mongod start
# or
sudo systemctl start mongod

# Windows:
net start MongoDB
```

#### Option B: MongoDB Atlas
If using MongoDB Atlas:
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update the MONGODB_URI in `.env`

### 4. Configure Environment

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and update:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong random secret (important for security!)
- `PORT` - Backend port (default: 5000)

### 5. Seed the Database (Optional)

Create sample data including admin and author users:
```bash
npm run seed
```

This creates:
- **Admin**: admin@cms.com / admin123
- **Author 1**: author@cms.com / author123
- **Author 2**: jane@cms.com / jane123
- 2 sample content pages

### 6. Start the Application

#### Development Mode (Recommended)
Run both frontend and backend together:
```bash
npm run dev
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:5173

#### Separate Terminals
Or run them separately:

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run client
```

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

Login with one of the seeded accounts:
- Admin: admin@cms.com / admin123
- Author: author@cms.com / author123

## First Steps

1. **Login** with admin credentials
2. **Explore** the dashboard
3. **Create** a new author in "Manage Authors"
4. **Create** content in "My Content"
5. **Publish** your first article
6. **View** your content at `/content/:slug`

## Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running
- Verify connection string in `.env`
- Check firewall settings for remote MongoDB

### Port Already in Use
- Change PORT in `.env` for backend
- Update VITE_API_URL to match new backend port

### Dependencies Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Blank Screen
- Check browser console for errors
- Verify all environment variables are set
- Ensure backend is running

## Build for Production

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Security Notes

⚠️ **Important**: Before deploying to production:
1. Change `JWT_SECRET` to a strong random value
2. Use a secure MongoDB database
3. Enable HTTPS
4. Review CORS settings
5. Set up proper file upload security
6. Add rate limiting
7. Implement proper logging

## Need Help?

- Check the main README.md for more details
- Review API documentation in the code
- Look at the seed.js file for data structure examples

