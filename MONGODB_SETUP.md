# MongoDB Setup Instructions

## Current Issue
Your server is trying to connect to MongoDB Atlas but getting authentication errors.

## Option 1: Fix MongoDB Atlas (Recommended for Production)

### Step 1: Check Your Atlas Database User

1. Go to https://cloud.mongodb.com/
2. Click on "Security" → "Database Access"
3. Find the user `abhimanyu_db_user`
4. Check if the password matches `Abhidilli@123`
5. Make sure the user has "Read and write to any database" role

### Step 2: Whitelist Your IP Address

1. In Atlas, click "Network Access"
2. Click "Add IP Address"
3. For development, add `0.0.0.0/0` (allows all IPs)
4. Click "Confirm"

⚠️ **Security Warning:** `0.0.0.0/0` allows access from anywhere. Use only for development!

### Step 3: Get the Correct Connection String

1. In Atlas, click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" as driver
4. Copy the connection string
5. It should look like:
   ```
   mongodb+srv://abhimanyu_db_user:<password>@cluster0.kw3el6q.mongodb.net/?retryWrites=true&w=majority
   ```

6. Replace `<password>` with your actual password (keep original, don't URL encode inside Atlas UI)

### Step 4: Update Your .env File

Edit `.env` and update the connection string:

```bash
MONGODB_URI=mongodb+srv://abhimanyu_db_user:YOUR_ACTUAL_PASSWORD@cluster0.kw3el6q.mongodb.net/cms?retryWrites=true&w=majority
```

**Important:** 
- If your password has `@`, `#`, `$` or other special characters, you MUST URL encode them
- `@` becomes `%40`
- Example: `Password@123` becomes `Password%40123`

---

## Option 2: Use Local MongoDB (Easier for Development)

### Install MongoDB Locally

#### Ubuntu/Debian:
```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```

#### Or use Docker (Easiest):
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running
docker ps | grep mongodb
```

### Update .env for Local MongoDB

```bash
# Update .env file
MONGODB_URI=mongodb://localhost:27017/cms
```

### Test Local MongoDB

```bash
# Test connection
mongo --eval "db.version()"

# Or
mongosh --eval "db.version()"
```

---

## Option 3: Use MongoDB Atlas Free Tier with Correct Setup

1. **Create a New Database User** (recommended):
   - Go to Atlas → Security → Database Access
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create user: `cms_admin`
   - Create password: `CMS_password_2024` (simple, no special chars)
   - Set role: "Read and write to any database"
   - Click "Add User"

2. **Whitelist IP**:
   - Go to Network Access
   - Add IP: `0.0.0.0/0` (for development)

3. **Get Connection String**:
   - Click "Connect" on cluster
   - Choose "Connect your application"
   - Copy connection string

4. **Update .env**:
   ```
   MONGODB_URI=mongodb+srv://cms_admin:CMS_password_2024@cluster0.kw3el6q.mongodb.net/cms?retryWrites=true&w=majority
   ```

---

## Testing Your Connection

### Test 1: Server Connection
```bash
cd /data/Abhimanyu/amit/cms
npm run server
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### Test 2: Direct Connection Test
```bash
cd /data/Abhimanyu/amit/cms
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connection successful!');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Connection failed:', err.message);
    process.exit(1);
  });
"
```

### Test 3: Seed Database
```bash
cd /data/Abhimanyu/amit/cms
npm run seed
```

You should see:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
👤 Created admin user: admin@cms.com
...
✨ Seeding completed successfully!
```

---

## Current Configuration

Your current `.env` has:
- Username: `abhimanyu_db_user`
- Password: `Abhidilli@123` (URL encoded: `Abhidilli%40123`)
- Cluster: `cluster0.kw3el6q.mongodb.net`
- Database: `cms`

**The most common issues are:**
1. ❌ IP not whitelisted in Atlas
2. ❌ Wrong password or user doesn't exist
3. ❌ Database user doesn't have correct permissions
4. ❌ Network connectivity issues

---

## Quick Checklist

- [ ] Atlas database user exists and password is correct
- [ ] IP address is whitelisted in Atlas (Network Access)
- [ ] User has "Read and write to any database" role
- [ ] Connection string in .env is correct
- [ ] Password is URL-encoded if it has special characters
- [ ] Cluster is running in Atlas
- [ ] Internet connection is working

---

## Need Help?

If still having issues, try **Option 2 (Local MongoDB)** first to get the app running, then fix Atlas later.

Share the exact error message and we can debug further!

