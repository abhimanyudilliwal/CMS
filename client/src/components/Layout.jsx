import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiFileText, FiUsers, FiLogOut } from 'react-icons/fi';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                🏛️ CMS
              </Link>
              
              {user && (
                <nav className="flex space-x-4">
                  <Link
                    to="/dashboard"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  > 

                    <FiHome className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    to="/my-content"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/my-content')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiFileText className="w-4 h-4" />
                    <span>My Content</span>
                  </Link>
                  
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/authors"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/admin/authors')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FiUsers className="w-4 h-4" />
                      <span>Manage Authors</span>
                    </Link>
                  )}
                </nav>
              )}
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.name}
                  {user.role === 'admin' && (
                    <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* {children} */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

