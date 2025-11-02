# CMS Frontend

This is the frontend client for the CMS application, built with React + Vite.

## Features

- React 18 with Hooks
- Vite for fast development and builds
- TailwindCSS for styling
- React Router for navigation
- React Quill for rich text editing
- React Markdown for content rendering
- Context API for state management

## Development

Run the frontend in development mode:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

## Configuration

The API base URL is configured in `src/services/api.js` and defaults to:
- Development: `http://localhost:5000/api`
- Production: Set `VITE_API_URL` environment variable

See the main README.md for full setup instructions.
