# Full-Featured CMS Website

A modern, full-stack Content Management System built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### Tech Stack
- **Frontend:** React + Vite with TailwindCSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ORM
- **Authentication:** JWT-based authentication with role-based access
- **Rich Text Editor:** React Quill
- **Markdown Rendering:** React Markdown

### Core Functionalities

#### Admin Dashboard
- ✅ Manage authors (add/remove/update)
- ✅ View all content pages
- ✅ Assign editing rights to authors
- ✅ Activate/deactivate authors

#### Author Features
- ✅ Create and edit content pages
- ✅ Rich text editor with formatting tools
- ✅ Upload and embed media
- ✅ Publish/draft content
- ✅ View own content and assigned content

#### Content Management
- ✅ Client-side rendering of content
- ✅ Automatic refresh on updates
- ✅ Dynamic slug generation
- ✅ Template-based rendering
- ✅ Meta information support

#### UX
- ✅ Single-page application
- ✅ RESTful API architecture
- ✅ Responsive design
- ✅ Modern, intuitive interface
- ✅ Protected routes with role-based access

## 📦 Installation

### Quick Start

```bash
# 1. Install dependencies
npm run install-all

# 2. Setup environment (already created)
# .env file is ready with defaults

# 3. Seed database with sample data
npm run seed

# 4. Start the application
npm run dev

# 5. Open http://localhost:5173
# Login with: admin@cms.com / admin123
```

### Detailed Setup

See [SETUP.md](SETUP.md) for comprehensive installation instructions or [QUICKSTART.md](QUICKSTART.md) for quick reference.

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🎯 Usage

### Admin Access
1. Login with admin credentials
2. Navigate to "Manage Authors" to add/remove authors
3. View all content in "Dashboard"
4. Assign editing permissions to authors

### Author Access
1. Login with author credentials
2. Create new content in "My Content"
3. Use rich text editor to format content
4. Publish or save as draft
5. Edit any content assigned to you

### Public Access
1. View published content at `/content/:slug`
2. Automatic rendering with markdown support

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Admin
- `GET /api/admin/authors` - Get all authors
- `POST /api/admin/authors` - Add author
- `PUT /api/admin/authors/:id` - Update author
- `DELETE /api/admin/authors/:id` - Delete author
- `GET /api/admin/content` - Get all content
- `PUT /api/admin/content/:id/editors` - Assign editors

### Author
- `GET /api/author/my-content` - Get author's content
- `POST /api/author/content` - Create content
- `PUT /api/author/content/:id` - Update content
- `DELETE /api/author/content/:id` - Delete content

### Public
- `GET /api/content` - Get all published content
- `GET /api/content/:slug` - Get content by slug

## 🎨 Customization

### Styling
- TailwindCSS configuration: `client/tailwind.config.js`
- Custom styles: `client/src/index.css`
- Brand colors: Update in Tailwind config

### Templates
- Content templates: Modify Content model in `server/models/Content.js`
- Render logic: Update `ContentViewer.jsx`

### File Uploads
- Currently placeholder implementation
- Integrate Cloudinary or S3 in `server/routes/author.js`

## 📝 Documentation

- **README.md** - This file (project overview)
- **SETUP.md** - Detailed installation and configuration guide
- **QUICKSTART.md** - 5-minute quick start guide
- **FEATURES.md** - Complete feature list and roadmap

## 📝 Environment Variables

See `.env.example` for all available options. Default configuration is ready in `.env`.

## 🔐 Security

- JWT tokens with 7-day expiration
- Password hashing with bcrypt
- Protected routes and role-based access
- Input validation with express-validator
- CORS configuration

## 🚧 Future Enhancements

- File upload to Cloudinary/S3
- Email notifications
- Content versioning
- Search functionality
- SEO optimization
- Analytics dashboard
- Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 🛠️ Support

For issues and questions, please open an issue on GitHub.

