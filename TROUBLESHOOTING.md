# Troubleshooting Guide

## MongoDB Connection Issues

### Common Errors and Solutions

#### 1. Authentication Failed Error
```
MongoServerError: bad auth : authentication failed
```

**Solutions:**
- Verify your MongoDB Atlas credentials
- Check if your IP address is whitelisted in Atlas
- Ensure the database user exists and has correct permissions
- Try URL-encoding special characters in password

**How to check Atlas IP whitelist:**
1. Go to MongoDB Atlas
2. Click "Network Access" in left sidebar
3. Click "Add IP Address"
4. Add `0.0.0.0/0` to allow all IPs (development only!)

#### 2. Connection String Issues

**Special characters in password:**
Use URL encoding:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `/` → `%2F`
- `:` → `%3A`

**Example:**
```
Password: Abhidilli@123
URL Encoded: Abhidilli%40123
```

#### 3. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=3000
```

#### 4. Using Local MongoDB

If you prefer local MongoDB:

```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt update
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Update .env
MONGODB_URI=mongodb://localhost:27017/cms
```

---

## Testing Your Setup

### Test MongoDB Connection

```bash
# Test connection
cd /data/Abhimanyu/amit/cms
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => {console.log('✅ Connected!'); process.exit(0);}).catch(err => {console.log('❌ Error:', err.message); process.exit(1);});"
```

### Test Server Without MongoDB

Comment out the MongoDB connection temporarily:

```javascript
// server/index.js
// mongoose.connect(MONGODB_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));
```

Then test if the server starts.

---

## Getting Correct MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password (URL-encoded if needed)
6. Add `?retryWrites=true&w=majority` if not present

**Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

---

## Quick Fixes

### Restart Everything
```bash
# Kill all processes
pkill -f nodemon
pkill -f node

# Wait a moment
sleep 2

# Start fresh
cd /data/Abhimanyu/amit/cms
npm run server
```

### Clear and Reinstall
```bash
cd /data/Abhimanyu/amit/cms
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
npm run install-all
```

### Check Dependencies
```bash
cd /data/Abhimanyu/amit/cms
node -e "console.log(require('mongoose').version)"
```

---

## Still Having Issues?

1. Check the full error message in terminal
2. Verify your `.env` file content
3. Test MongoDB connection separately
4. Check internet connectivity
5. Verify Atlas cluster is running
6. Review MongoDB Atlas logs

---

## Need Help?

Share:
1. Full error message
2. Your `.env` file (hide password!)
3. MongoDB connection method (Atlas or local)
4. Node and npm versions

Run: `node -v && npm -v`

