# 🔴 URGENT: MongoDB Connection Fix

## Current Problem
Your login page is refreshing because **MongoDB Atlas authentication is failing**.

## Quick Solutions (Choose One)

### ✅ Solution 1: Fix MongoDB Atlas (Recommended if you have access)

#### Step 1: Whitelist Your IP
1. Go to https://cloud.mongodb.com/
2. Login to your Atlas account
3. Click **"Network Access"** (left sidebar)
4. Click **"Add IP Address"**
5. Enter `0.0.0.0/0` (allow all IPs for development)
6. Click **"Confirm"**

#### Step 2: Check Your Database User
1. In Atlas, click **"Security"** → **"Database Access"**
2. Find user: `abhimanyu_db_user`
3. Make sure password is: `Abhidilli@123`
4. Make sure user has **"Read and write to any database"** role
5. If user doesn't exist, click **"Add New Database User"**:
   - Username: `abhimanyu_db_user`
   - Password: `Abhidilli@123`
   - Role: **"Read and write to any database"**

#### Step 3: Update Connection String
Current connection string in `.env`:
```
mongodb+srv://abhimanyu_db_user:Abhidilli%40123@cluster0.kw3el6q.mongodb.net/cms?retryWrites=true&w=majority
```

**The `@` in your password is already URL-encoded to `%40`** - this is correct!

#### Step 4: Test Connection
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

### ✅ Solution 2: Use Local MongoDB (Easiest)

#### Install MongoDB Locally

```bash
# Check if MongoDB is installed
mongod --version 2>/dev/null || echo "Not installed"

# If not installed, run these commands:
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### OR Use Docker (Simpler):
```bash
# Run MongoDB in Docker container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Check if running
docker ps | grep mongodb
```

#### Update .env File
```bash
cd /data/Abhimanyu/amit/cms
cat > .env << 'EOF'
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cms

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Frontend API URL
VITE_API_URL=http://localhost:5000/api
EOF
```

#### Restart Server and Seed
```bash
# Kill existing server
pkill -f nodemon

# Seed database
npm run seed

# Start server
npm run server
```

---

### ✅ Solution 3: Create New Atlas User (If you forgot password)

1. Go to Atlas → Security → Database Access
2. Click **"Add New Database User"**
3. Choose:
   - Username: `cms_user` (simple, no special chars)
   - Password: `CMS2024password` (simple password)
   - Role: **"Read and write to any database"**

4. Update `.env`:
```bash
cat > .env << 'EOF'
# MongoDB Configuration
MONGODB_URI=mongodb+srv://cms_user:CMS2024password@cluster0.kw3el6q.mongodb.net/cms?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Frontend API URL
VITE_API_URL=http://localhost:5000/api
EOF
```

5. Whitelist IP in Atlas Network Access: `0.0.0.0/0`

6. Test:
```bash
npm run seed
```

---

## After Fixing MongoDB

Once MongoDB connection works:

1. **Seed the database:**
   ```bash
   npm run seed
   ```

2. **Start the server:**
   ```bash
   npm run server
   ```

3. **Start the client (in another terminal):**
   ```bash
   npm run client
   ```

4. **Test login:**
   - Go to: http://localhost:5173
   - Login with: `admin@cms.com` / `admin123`

---

## Why Login Page is Refreshing

The login page is refreshing because:
1. MongoDB connection is failing
2. No users exist in database
3. Login API returns "Invalid credentials"
4. Your debug alerts were triggering refreshes

**I've already removed the debug alerts** (`alert(3)` and `alert(22)`), so once MongoDB is fixed, login will work!

---

## Still Having Issues?

Share:
1. Which solution you tried
2. Exact error message from `npm run seed`
3. Atlas Network Access screenshot (with IP whitelist)

**Most common issue:** IP not whitelisted in Atlas Network Access!

