import { useCurrentAccount } from '@mysten/dapp-kit';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';

export default function DecentralizedHome() {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              🌐 Decentralized CMS
            </h1>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Content Management
            <br />
            <span className="text-blue-600">Fully Decentralized</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Built on Sui blockchain + Walrus storage
            <br />
            No servers. No passwords. Just your wallet.
          </p>

          {!currentAccount ? (
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect your Sui wallet to get started with decentralized content creation
                </p>
              </div>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
              <div className="mt-6 text-sm text-gray-500">
                <p>Don't have a wallet?</p>
                <a
                  href="https://chrome.google.com/webstore/detail/sui-wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Install Sui Wallet →
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Wallet Connected!
                </h3>
                <p className="text-gray-600 mb-2">
                  {currentAccount.address.slice(0, 8)}...
                  {currentAccount.address.slice(-6)}
                </p>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => navigate('/decentralized-editor')}
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-md"
                >
                  📝 Create Content
                </button>

                <button
                  onClick={() => navigate('/my-content')}
                  className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-lg font-semibold"
                >
                  📚 My Content
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              🔐
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              NFT Permissions
            </h3>
            <p className="text-sm text-gray-600">
              Author capabilities as NFTs on Sui blockchain
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              💾
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Walrus Storage
            </h3>
            <p className="text-sm text-gray-600">
              Content stored on decentralized Walrus network
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              ⚡
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Zero Backend
            </h3>
            <p className="text-sm text-gray-600">
              No servers required, just blockchain + storage
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            System Status
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                ✅
              </div>
              <div className="text-sm text-gray-500">Smart Contracts</div>
              <div className="text-xs text-green-600 mt-1">Deployed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                ✅
              </div>
              <div className="text-sm text-gray-500">Walrus Network</div>
              <div className="text-xs text-green-600 mt-1">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                ⚡
              </div>
              <div className="text-sm text-gray-500">Network</div>
              <div className="text-xs text-blue-600 mt-1">Testnet</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
