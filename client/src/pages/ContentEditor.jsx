import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authorAPI } from '../services/api';
import { FiSave, FiEye, FiArrowLeft } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ContentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchContent();
    }
  }, [id, isEdit]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await authorAPI.getMyContent();
      const contentItem = response.data.find((item) => item._id === id);
      
      if (contentItem) {
        setTitle(contentItem.title);
        setContent(contentItem.content);
        setIsPublished(contentItem.isPublished);
      } else {
        setError('Content not found');
      }
    } catch (error) {
      setError('Failed to fetch content');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        await authorAPI.updateContent(id, {
          title,
          content,
          isPublished,
        });
      } else {
        const response = await authorAPI.createContent({
          title,
          content,
          isPublished,
        });
        navigate(`/my-content/edit/${response.data._id}`);
      }
      
      alert('Content saved successfully!');
    } catch (error) {
      setError(
        error.response?.data?.error || 'Failed to save content'
      );
    } finally {
      setSaving(false);
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
      <div className="mb-8 flex items-center space-x-4">
        <button
          onClick={() => navigate('/my-content')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Content' : 'Create New Content'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="Enter content title..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            style={{ minHeight: '400px', marginBottom: '60px' }}
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image', 'video'],
                ['code-block'],
                ['clean'],
              ],
            }}
          />
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <FiSave className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Publish immediately
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;

