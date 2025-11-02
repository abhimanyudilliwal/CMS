import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authorAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiCalendar } from 'react-icons/fi';

const MyContent = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await authorAPI.getMyContent();
      setContent(response.data);
    } catch (error) {
      setError('Failed to fetch content');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await authorAPI.deleteContent(id);
      setContent(content.filter((item) => item._id !== id));
    } catch (error) {
      alert('Failed to delete content');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Content</h1>
          <p className="text-gray-600 mt-2">
            Manage and edit your content pages
          </p>
        </div>
        <Link
          to="/my-content/new"
          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
        >
          <FiPlus className="w-5 h-5" />
          <span>New Content</span>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {content.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FiEye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No content yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first content page to get started
          </p>
          <Link
            to="/my-content/new"
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Content</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {item.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <FiCalendar className="w-4 h-4" />
                    <span>
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/my-content/edit/${item._id}`}
                    className="flex-1 inline-flex items-center justify-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  {item.isPublished && (
                    <Link
                      to={`/content/${item.slug}`}
                      className="inline-flex items-center justify-center bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      target="_blank"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="inline-flex items-center justify-center bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyContent;

