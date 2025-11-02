# Decentralized CMS - Built on Sui & Walrus

A fully decentralized Content Management System leveraging Sui blockchain for access control and metadata, and Walrus for decentralized blob storage.

## 🌟 Key Features

- **Zero Backend Servers** - Fully decentralized on Sui blockchain + Walrus storage
- **NFT-Based Permissions** - Author capabilities as NFTs for access control
- **Immutable Content Storage** - Content stored on Walrus with permanent blob IDs
- **On-Chain Metadata** - Content metadata, permissions, and versions on Sui
- **Wallet Authentication** - No passwords, authenticate with Sui wallet
- **Rich Content Editor** - WYSIWYG editor with markdown support
- **Media Upload** - Upload images/videos to Walrus storage
- **Version Control** - Automatic version tracking on-chain
- **Event-Driven** - Real-time updates via blockchain events

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────┐
│           Frontend (Walrus Site)                     │
│   React + Vite + Sui Wallet Kit + Walrus Client     │
└─────────────┬────────────────────────────────────────┘
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
┌──────────┐    ┌─────────────┐
│   Sui    │    │   Walrus    │
│Blockchain│    │   Storage   │
│          │    │             │
│ • Access │    │ • Content   │
│   Control│    │   Blobs     │
│ • Metadata    │ • Media     │
│ • Versions    │ • Assets    │
│ • Events │    │             │
└──────────┘    └─────────────┘
```

## 📋 FRP Requirements Status

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Admins can make list of authors | ✅ | `issue_author_cap` smart contract function |
| Authors can change content | ✅ | `create_content` & `update_content` functions |
| Authors can upload rich media | ✅ | Walrus blob storage integration |
| Content rendered as Walrus Sites | ✅ | Ready to deploy with `walrus site publish` |
| Client-side rendering | ✅ | React app fetches from Walrus/Sui |
| All interactions through web UX | ✅ | Full React frontend |
| No centralized backend | ✅ | Only Sui + Walrus |
| Template engine integration | 🔄 | Planned for Phase 2 |

## 🚀 Quick Start

### Prerequisites

1. **Sui CLI** - [Install Guide](https://docs.sui.io/guides/developer/getting-started/sui-install)
2. **Sui Wallet** - [Sui Wallet Extension](https://chrome.google.com/webstore/detail/sui-wallet)
3. **Walrus CLI** - [Walrus Docs](https://docs.walrus.site/)
4. **Node.js 18+** - [Download](https://nodejs.org/)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd CMS

# Install frontend dependencies
cd client
npm install
```

### Deploy Smart Contracts

```bash
# Navigate to Move project
cd move/cms/decentralized_cms

# Build contracts
sui move build

# Deploy to testnet
sui client publish --gas-budget 100000000

# Save the Package ID, Platform ID, and Registry ID from output
```

### Configure Environment

Create `client/.env`:

```env
VITE_SUI_NETWORK=testnet
VITE_CMS_PACKAGE_ID=0x<your_package_id>
VITE_CMS_PLATFORM_ID=0x<your_platform_id>
VITE_CMS_REGISTRY_ID=0x<your_registry_id>
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
```

### Run Development Server

```bash
cd client
npm run dev
```

Visit: http://localhost:5173

### Grant Author Permissions

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module content_registry \
  --function issue_author_cap \
  --args <PLATFORM_ID> <AUTHOR_ADDRESS> \
  --gas-budget 10000000
```

## 📚 Project Structure

```
CMS/
├── move/                                   # Sui Move smart contracts
│   └── cms/
│       └── decentralized_cms/
│           ├── sources/
│           │   └── content_registry.move   # Main CMS contract
│           └── Move.toml
│
├── client/                                 # React frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── walrus.js                  # Walrus storage client
│   │   │   └── sui-cms.js                 # Sui SDK wrapper
│   │   ├── context/
│   │   │   ├── AuthContext.jsx            # Legacy auth (deprecated)
│   │   │   └── SuiWalletContext.jsx       # Sui wallet context
│   │   ├── components/
│   │   │   ├── Layout.jsx                 # Main layout
│   │   │   └── WalletConnect.jsx          # Wallet connect button
│   │   ├── pages/
│   │   │   ├── DecentralizedContentEditor.jsx  # New editor
│   │   │   ├── ContentEditor.jsx          # Legacy editor
│   │   │   └── ...
│   │   └── main.jsx
│   └── package.json
│
├── server/                                 # Legacy backend (deprecated)
│
├── DECENTRALIZED_CMS_SETUP.md             # Full setup guide
├── QUICK_START.md                         # Quick demo guide
└── README_DECENTRALIZED.md                # This file
```

## 🎯 Smart Contract API

### Admin Functions

```move
// Grant author permissions
public entry fun issue_author_cap(
    platform: &mut CMSPlatform,
    recipient: address,
    ctx: &mut TxContext
)

// Revoke author permissions
public entry fun deactivate_author(
    platform: &CMSPlatform,
    author_cap: &mut AuthorCap,
    ctx: &mut TxContext
)
```

### Author Functions

```move
// Create content
public entry fun create_content(
    _author_cap: &AuthorCap,
    registry: &mut ContentRegistry,
    platform: &mut CMSPlatform,
    slug: vector<u8>,
    title: vector<u8>,
    walrus_blob_id: vector<u8>,
    ctx: &mut TxContext
)

// Update content
public entry fun update_content(
    content: &mut ContentPage,
    _author_cap: &AuthorCap,
    new_walrus_blob_id: vector<u8>,
    new_title: vector<u8>,
    ctx: &mut TxContext
)

// Publish/unpublish
public entry fun set_publish_status(
    content: &mut ContentPage,
    _author_cap: &AuthorCap,
    is_published: bool,
    ctx: &mut TxContext
)

// Add editor
public entry fun add_editor(
    content: &mut ContentPage,
    _author_cap: &AuthorCap,
    editor: address,
    ctx: &mut TxContext
)
```

## 🛠 TypeScript SDK Usage

```javascript
import { cmsClient } from './lib/sui-cms';
import { uploadToWalrus, getFromWalrus } from './lib/walrus';

// Upload content to Walrus
const { blobId } = await uploadToWalrus('My blog post content');

// Create content on-chain
const tx = cmsClient.createContentTx(
  authorCapId,
  registryId,
  platformId,
  'my-first-post',
  'My First Post',
  blobId
);

await signAndExecute({ transaction: tx });

// Retrieve content
const content = await getFromWalrus(blobId);
console.log(content);
```

## 💰 Cost Estimates

### Sui Blockchain (Gas Fees)
- Create content: ~0.01 SUI (~$0.01)
- Update content: ~0.008 SUI
- Publish toggle: ~0.005 SUI
- Grant author cap: ~0.01 SUI

### Walrus Storage
- Small content (10KB): ~0.001 SUI per epoch
- Medium content (100KB): ~0.01 SUI per epoch
- Large media (1MB): ~0.1 SUI per epoch
- Recommended: 100 epochs = ~1 year storage

**Total monthly cost for 100 posts with media: ~$5-10**
(vs traditional hosting: $20-100/month)

## 🔐 Security Features

- **Capability-Based Access** - NFT-based permissions
- **On-Chain Verification** - All actions verified by smart contract
- **Immutable Storage** - Content on Walrus is permanent
- **Decentralized Auth** - No password database to hack
- **Event Logging** - All changes logged on-chain
- **Version Control** - Automatic versioning prevents data loss

## 🧪 Testing

### Test Smart Contracts

```bash
cd move/cms/decentralized_cms
sui move test
```

### Test Walrus Integration

```bash
cd client
npm run test
```

### Manual Testing

1. Connect Sui wallet
2. Create test content
3. Upload test media
4. Publish content
5. View on Sui Explorer
6. Verify Walrus blobs

## 📦 Deployment

### Deploy Frontend to Walrus Sites

```bash
# Build production bundle
cd client
npm run build

# Deploy to Walrus
cd dist
walrus site publish --epochs 100

# Output: https://xyz123.walrus.site
```

## 🗺 Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Smart contracts deployed
- [x] Walrus integration
- [x] Basic UI
- [x] Wallet authentication

### Phase 2: Enhanced Features (Week 2-3)
- [ ] Content versioning UI
- [ ] Advanced search/filtering
- [ ] Template engine integration
- [ ] Markdown preview mode
- [ ] Batch operations

### Phase 3: Advanced Features (Week 4-6)
- [ ] Multi-signature admin
- [ ] Token-gated content
- [ ] NFT memberships
- [ ] Analytics dashboard
- [ ] Content migration tools

### Phase 4: Go-to-Market (Week 7-8)
- [ ] Documentation site
- [ ] Video tutorials
- [ ] Developer SDK docs
- [ ] Landing page
- [ ] Marketing materials

## 📖 Documentation

- [Quick Start Guide](./QUICK_START.md) - Get started in 5 minutes
- [Setup Guide](./DECENTRALIZED_CMS_SETUP.md) - Detailed deployment instructions
- [Sui Docs](https://docs.sui.io) - Sui blockchain documentation
- [Walrus Docs](https://docs.walrus.site) - Walrus storage documentation

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🆘 Support

- **GitHub Issues**: [Report bugs](https://github.com/your-repo/issues)
- **Sui Discord**: [Join community](https://discord.gg/sui)
- **Email**: your-email@example.com

## 🎉 Acknowledgments

- Built for the Sui x Walrus FRP Grant
- Special thanks to Mysten Labs team
- Community contributors

---

**Built with ❤️ on Sui & Walrus**
