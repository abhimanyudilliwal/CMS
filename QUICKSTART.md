# CMS Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Setup Database
Make sure MongoDB is running:
```bash
# Check if MongoDB is running
# If not, start it based on your OS
```

### Step 3: Seed Sample Data
```bash
npm run seed
```
This creates:
- 1 admin user: `admin@cms.com` / `admin123`
- 2 author users
- 2 sample content pages

### Step 4: Start the App
```bash
npm run dev
```

### Step 5: Open Browser
Navigate to: **http://localhost:5173**

### Step 6: Login
Use: **admin@cms.com** / **admin123**

---

## 📋 What You Can Do

### As Admin
1. ✅ View dashboard with statistics
2. ✅ Manage authors (add/edit/delete)
3. ✅ View all content
4. ✅ Assign editing rights
5. ✅ Create and edit content

### As Author
1. ✅ Create new content pages
2. ✅ Edit your content with rich text editor
3. ✅ Publish or save as draft
4. ✅ Edit content assigned to you
5. ✅ View published content

---

## 🗂️ Project Structure

```
cms/
├── server/              # Backend Express API
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   └── index.js        # Server entry point
├── client/             # React frontend
│   ├── src/
│   │   ├── pages/     # React pages
│   │   ├── components/# Reusable components
│   │   ├── context/   # Context API
│   │   └── services/  # API service
│   └── package.json
├── .env               # Environment variables
├── .env.example       # Template config
└── package.json       # Root package
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Current user

### Admin
- `GET /api/admin/authors` - List authors
- `POST /api/admin/authors` - Add author
- `PUT /api/admin/authors/:id` - Update author
- `DELETE /api/admin/authors/:id` - Delete author
- `GET /api/admin/content` - All content
- `PUT /api/admin/content/:id/editors` - Assign editors

### Author
- `GET /api/author/my-content` - Author's content
- `POST /api/author/content` - Create content
- `PUT /api/author/content/:id` - Update content
- `DELETE /api/author/content/:id` - Delete content

### Public
- `GET /api/content` - Published content list
- `GET /api/content/:slug` - Specific content

---

## 🎨 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Rich Editor | React Quill |
| Markdown | React Markdown |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| Validation | Express Validator |

---

## 🐛 Common Issues

**MongoDB not connecting?**
- Check if MongoDB is running
- Verify connection string in `.env`
- Try `mongodb://localhost:27017/cms`

**Port already in use?**
- Change `PORT` in `.env`
- Update `VITE_API_URL` to match

**Cannot login after seed?**
- Run `npm run seed` again
- Check MongoDB connection
- Verify user exists in database

**Frontend not connecting to backend?**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Clear browser cache

---

## 📚 Next Steps

1. **Customize** - Update brand colors in `client/tailwind.config.js`
2. **Extend** - Add file upload to Cloudinary/S3
3. **Deploy** - Build and deploy to production
4. **Secure** - Update JWT secret and add HTTPS

---

## 📖 Full Documentation

- See `README.md` for detailed documentation
- See `SETUP.md` for installation instructions
- Check API routes in `server/routes/`
- Review components in `client/src/pages/`

---

## 💡 Tips

- Use browser DevTools to inspect API calls
- Check browser console for errors
- MongoDB data persists between restarts
- JWT tokens expire after 7 days
- Content auto-generates slugs from titles

---

**Need help?** Check the full README.md or SETUP.md for more details!

