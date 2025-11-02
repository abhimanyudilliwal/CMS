import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiFileText, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { authorAPI, adminAPI } from '../services/api';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    myContent: 0,
    published: 0,
    authors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [contentRes, authorsRes] = await Promise.all([
          authorAPI.getMyContent(),
          isAdmin ? adminAPI.getAuthors() : Promise.resolve({ data: [] }),
        ]);

        setStats({
          myContent: contentRes.data.length,
          published: contentRes.data.filter((c) => c.isPublished).length,
          authors: authorsRes.data.length,
        });
        setError('');
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, isAdmin]);

  const statCards = [
    {
      title: 'My Content',
      value: stats.myContent,
      icon: FiFileText,
      color: 'bg-blue-500',
      href: '/my-content',
    },
    {
      title: 'Published',
      value: stats.published,
      icon: FiTrendingUp,
      color: 'bg-green-500',
    },
    ...(isAdmin
      ? [
          {
            title: 'Authors',
            value: stats.authors,
            icon: FiUsers,
            color: 'bg-purple-500',
            href: '/admin/authors',
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your content and stay productive
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <Link
          to="/my-content/new"
          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create New Content</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`${stat.color} text-white p-3 rounded-lg`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/my-content"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiFileText className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium text-gray-900">View All Content</p>
              <p className="text-sm text-gray-600">Manage your articles</p>
            </div>
          </Link>

          {isAdmin && (
            <Link
              to="/admin/authors"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiUsers className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Manage Authors</p>
                <p className="text-sm text-gray-600">Add or remove authors</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

