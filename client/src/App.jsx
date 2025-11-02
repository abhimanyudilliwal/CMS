import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyContent from './pages/MyContent';
import ContentEditor from './pages/ContentEditor';
import AdminAuthors from './pages/AdminAuthors';
import ContentViewer from './pages/ContentViewer';
import DecentralizedContentEditor from './pages/DecentralizedContentEditor';
import DecentralizedHome from './pages/DecentralizedHome';

// Public route wrapper
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log(user)
  console.log(loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Decentralized Home - Public, wallet-based */}
          <Route path="/web3" element={<DecentralizedHome />} />

          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/" element={<Layout />}>
            <Route index element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="my-content" element={
              <ProtectedRoute>
                <MyContent />
              </ProtectedRoute>
            } />
            
            <Route path="my-content/new" element={
              <ProtectedRoute>
                <ContentEditor />
              </ProtectedRoute>
            } />
            
            <Route path="my-content/edit/:id" element={
              <ProtectedRoute>
                <ContentEditor />
              </ProtectedRoute>
            } />
            
            <Route path="admin/authors" element={
              <ProtectedRoute requireAdmin>
                <AdminAuthors />
              </ProtectedRoute>
            } />
            
            <Route path="content/:slug" element={<ContentViewer />} />

            {/* Decentralized Content Editor - No auth required, uses wallet */}
            <Route path="decentralized-editor" element={<DecentralizedContentEditor />} />
            <Route path="decentralized-editor/:id" element={<DecentralizedContentEditor />} />

            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found</p>
                  <a
                    href="/dashboard"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Back to Dashboard
                  </a>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
