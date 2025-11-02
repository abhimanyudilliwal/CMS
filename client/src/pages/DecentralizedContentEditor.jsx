import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { uploadToWalrus, uploadMediaToWalrus, getFromWalrus } from '../lib/walrus';
import { cmsClient } from '../lib/sui-cms';
import Layout from '../components/Layout';

export default function DecentralizedContentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [authorCapId, setAuthorCapId] = useState(null);
  const [contentObjectId, setContentObjectId] = useState(null);

  // Platform and Registry IDs (should be stored in env or config)
  const PLATFORM_ID = import.meta.env.VITE_CMS_PLATFORM_ID;
  const REGISTRY_ID = import.meta.env.VITE_CMS_REGISTRY_ID;

  useEffect(() => {
    if (currentAccount) {
      loadAuthorCap();
    }
    if (id) {
      loadContent();
    }
  }, [currentAccount, id]);

  const loadAuthorCap = async () => {
    try {
      const cap = await cmsClient.getAuthorCap(currentAccount.address);
      if (cap) {
        setAuthorCapId(cap.data.objectId);
      } else {
        setMessage('You do not have author permissions. Please contact the admin.');
      }
    } catch (error) {
      console.error('Error loading author capability:', error);
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      const contentData = await cmsClient.getContentPage(id);

      if (contentData && contentData.data.content) {
        const fields = contentData.data.content.fields;
        setTitle(fields.title);
        setSlug(fields.slug);
        setIsPublished(fields.is_published);
        setContentObjectId(id);

        // Load content from Walrus
        const walrusContent = await getFromWalrus(fields.walrus_blob_id);
        setContent(walrusContent);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setMessage('Error loading content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!id) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage('Uploading media to Walrus...');

      const { blobId } = await uploadMediaToWalrus(file);

      // Insert image into content
      const imageUrl = `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
      const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
      setContent(content + imageMarkdown);

      // If editing existing content, also add to on-chain media list
      if (contentObjectId && authorCapId) {
        const tx = cmsClient.addMediaTx(contentObjectId, authorCapId, blobId);

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: () => {
              setMessage('Media uploaded and added to content!');
            },
            onError: (error) => {
              console.error('Error adding media on-chain:', error);
              setMessage('Media uploaded but failed to add on-chain');
            }
          }
        );
      } else {
        setMessage('Media uploaded to Walrus!');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      setMessage('Error uploading media: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentAccount) {
      setMessage('Please connect your wallet first');
      return;
    }

    if (!authorCapId) {
      setMessage('You do not have author permissions');
      return;
    }

    if (!title || !content) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setMessage('Uploading content to Walrus...');

      // Upload content to Walrus
      const { blobId } = await uploadToWalrus(content, 10); // Store for 10 epochs

      setMessage('Creating blockchain transaction...');

      let tx;
      if (contentObjectId) {
        // Update existing content
        tx = cmsClient.updateContentTx(contentObjectId, authorCapId, blobId, title);
      } else {
        // Create new content
        tx = cmsClient.createContentTx(
          authorCapId,
          REGISTRY_ID,
          PLATFORM_ID,
          slug,
          title,
          blobId
        );
      }

      // Sign and execute transaction
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Transaction successful:', result);
            setMessage('Content saved successfully on blockchain!');
            setTimeout(() => {
              navigate('/my-content');
            }, 2000);
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            setMessage('Error saving content: ' + error.message);
            setLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error saving content:', error);
      setMessage('Error: ' + error.message);
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!contentObjectId || !authorCapId) {
      setMessage('Cannot publish - content not saved yet');
      return;
    }

    try {
      setLoading(true);
      const tx = cmsClient.setPublishStatusTx(contentObjectId, authorCapId, !isPublished);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            setIsPublished(!isPublished);
            setMessage(`Content ${!isPublished ? 'published' : 'unpublished'} successfully!`);
            setLoading(false);
          },
          onError: (error) => {
            console.error('Error toggling publish status:', error);
            setMessage('Error: ' + error.message);
            setLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: ' + error.message);
      setLoading(false);
    }
  };

  if (!currentAccount) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Wallet Not Connected</h2>
            <p className="text-yellow-700">Please connect your Sui wallet to create or edit content.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Edit Content' : 'Create New Content'}
          </h1>
          <p className="text-gray-600 mt-2">
            Content stored on Walrus • Metadata on Sui blockchain
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL-friendly identifier)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading || !!id}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content (Markdown supported)
            </label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className="bg-white"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'code-block'],
                  ['clean'],
                ],
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Media to Walrus
            </label>
            <input
              type="file"
              onChange={handleMediaUpload}
              accept="image/*,video/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              disabled={uploading || loading}
            />
            {uploading && <p className="text-sm text-blue-600 mt-2">Uploading to Walrus...</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading || !authorCapId}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : (id ? 'Update Content' : 'Create Content')}
              </button>

              {contentObjectId && (
                <button
                  type="button"
                  onClick={handlePublishToggle}
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    isPublished
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isPublished ? 'Unpublish' : 'Publish'}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/my-content')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Decentralized Storage Info</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Content is stored as blobs on Walrus decentralized storage</li>
            <li>• Metadata (title, slug, permissions) is stored on Sui blockchain</li>
            <li>• All updates create new versions tracked on-chain</li>
            <li>• Media files are also stored on Walrus with permanent blob IDs</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
