import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { contentAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { FiCalendar, FiUser, FiTag } from 'react-icons/fi';

const ContentViewer = () => {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent();
  }, [slug]);

  const fetchContent = async () => {
    try {
      const response = await contentAPI.getBySlug(slug);
      setContent(response.data);
    } catch (error) {
      setError('Content not found');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">Content not found</p>
          <a
            href="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white rounded-xl shadow-sm p-8 md:p-12">
        {/* Header */}
        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {content.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <FiUser className="w-4 h-4" />
              <span className="font-medium">{content.author.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <FiCalendar className="w-4 h-4" />
              <time dateTime={content.updatedAt}>
                {new Date(content.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-4 leading-relaxed" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-primary-600 hover:text-primary-700 underline"
                  {...props}
                />
              ),
              img: ({ node, ...props }) => (
                <img className="rounded-lg my-6" {...props} />
              ),
              code: ({ node, inline, ...props }) => {
                const className = inline
                  ? 'bg-gray-100 px-1 py-0.5 rounded text-sm'
                  : 'block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4';
                return <code className={className} {...props} />;
              },
              pre: ({ node, ...props }) => (
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto my-4" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 mb-4" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 mb-4" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-primary-500 pl-4 italic my-4 text-gray-700"
                  {...props}
                />
              ),
            }}
          >
            {content.content}
          </ReactMarkdown>
        </div>

        {/* Footer */}
        {content.meta?.keywords && content.meta.keywords.length > 0 && (
          <footer className="mt-12 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <FiTag className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {content.meta.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </footer>
        )}
      </article>
    </div>
  );
};

export default ContentViewer;

