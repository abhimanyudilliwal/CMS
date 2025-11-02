# Decentralized CMS - Setup & Deployment Guide

## Overview

This is a fully decentralized Content Management System built on:
- **Sui Blockchain** - For access control, permissions, and content metadata
- **Walrus Storage** - For decentralized blob storage of content and media
- **React Frontend** - Hosted on Walrus Sites (fully decentralized)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Walrus Sites (Frontend)               │
│                 React App + Wallet Connect              │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌─────────────────┐
│ Sui Blockchain│    │ Walrus Storage  │
│               │    │                 │
│ • Metadata    │    │ • Content Blobs │
│ • Permissions │    │ • Media Files   │
│ • Access Control    │ • Versions      │
└───────────────┘    └─────────────────┘
```

## Prerequisites

### 1. Install Sui CLI

```bash
# Install Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui

# Verify installation
sui --version
```

### 2. Create Sui Wallet

```bash
# Create new wallet
sui client new-address ed25519

# Get testnet tokens
# Visit: https://faucet.sui.io/
```

### 3. Install Walrus CLI

```bash
# Download Walrus CLI from official sources
# Visit: https://docs.walrus.site/

# Verify installation
walrus --version
```

## Project Structure

```
CMS/
├── move/                          # Sui Move smart contracts
│   └── cms/
│       └── decentralized_cms/
│           ├── sources/
│           │   └── content_registry.move
│           └── Move.toml
├── client/                        # React frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── walrus.js         # Walrus client
│   │   │   └── sui-cms.js        # Sui SDK wrapper
│   │   ├── context/
│   │   │   └── SuiWalletContext.jsx
│   │   ├── components/
│   │   │   └── WalletConnect.jsx
│   │   └── pages/
│   │       └── DecentralizedContentEditor.jsx
│   └── package.json
└── server/                        # Legacy backend (deprecated)
```

## Deployment Steps

### Step 1: Deploy Smart Contracts to Sui

```bash
# Navigate to Move project
cd move/cms/decentralized_cms

# Build the contract
sui move build

# Deploy to testnet
sui client publish --gas-budget 100000000

# Save the output - you'll need:
# - Package ID
# - CMSPlatform Object ID
# - ContentRegistry Object ID
```

**Expected Output:**
```
Transaction Digest: <digest>
Package ID: 0x<package_id>

Created Objects:
  - CMSPlatform: 0x<platform_id>
  - ContentRegistry: 0x<registry_id> (shared)
```

### Step 2: Configure Environment Variables

Create `client/.env` file:

```env
# Sui Network
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Smart Contract IDs (from deployment)
VITE_CMS_PACKAGE_ID=0x<your_package_id>
VITE_CMS_PLATFORM_ID=0x<your_platform_id>
VITE_CMS_REGISTRY_ID=0x<your_registry_id>

# Walrus Configuration
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
```

### Step 3: Install Frontend Dependencies

```bash
cd client
npm install
```

### Step 4: Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173`

### Step 5: Issue Author Capabilities

As the admin, you need to grant author permissions:

```javascript
// Using Sui CLI
sui client call \
  --package <PACKAGE_ID> \
  --module content_registry \
  --function issue_author_cap \
  --args <PLATFORM_ID> <AUTHOR_ADDRESS> \
  --gas-budget 10000000
```

Or use the TypeScript SDK:

```javascript
import { cmsClient } from './lib/sui-cms';

const tx = cmsClient.createIssueAuthorCapTx(
  PLATFORM_ID,
  'author_address_here'
);
await signAndExecute({ transaction: tx });
```

### Step 6: Deploy to Walrus Sites

```bash
# Build production bundle
npm run build

# Deploy to Walrus Sites
cd dist
walrus site publish --epochs 100

# You'll receive a Walrus Site URL
# Example: https://xyz123.walrus.site
```

## Usage Guide

### For Admins

**Grant Author Permissions:**
```javascript
// Connect admin wallet
// Use the issue_author_cap function
cmsClient.createIssueAuthorCapTx(platformId, authorAddress)
```

### For Authors

**1. Connect Wallet**
- Click "Connect Wallet" button
- Select your Sui wallet (Sui Wallet, Suiet, etc.)
- Approve connection

**2. Create Content**
```javascript
// Content is automatically uploaded to Walrus
// Metadata is stored on Sui blockchain
// Title, slug, and permissions are on-chain
// Content body is stored as Walrus blob
```

**3. Upload Media**
```javascript
// Media files are uploaded to Walrus
// Blob IDs are stored in the content metadata
// Images/videos are accessible via Walrus aggregator
```

**4. Publish Content**
```javascript
// Toggle publish status on-chain
// Only published content is visible to viewers
```

### For Viewers

**View Published Content:**
- Visit the Walrus Site URL
- Browse published articles
- Content is fetched from Walrus using blob IDs
- No backend required - fully client-side rendering

## Smart Contract Functions

### Admin Functions

| Function | Description |
|----------|-------------|
| `issue_author_cap` | Grant author permissions to a user |
| `deactivate_author` | Revoke author permissions |
| `activate_author` | Re-enable author permissions |

### Author Functions

| Function | Description |
|----------|-------------|
| `create_content` | Create new content page |
| `update_content` | Update existing content |
| `add_media` | Add media blob to content |
| `set_publish_status` | Publish/unpublish content |
| `add_editor` | Add editor to content |
| `remove_editor` | Remove editor from content |

### Public Getters

| Function | Description |
|----------|-------------|
| `get_slug` | Get content slug |
| `get_title` | Get content title |
| `get_blob_id` | Get Walrus blob ID |
| `is_published` | Check if content is published |
| `get_version` | Get content version number |

## Testing

### Test Smart Contracts

```bash
cd move/cms/decentralized_cms
sui move test
```

### Test Walrus Upload

```javascript
import { uploadToWalrus, getFromWalrus } from './lib/walrus';

// Upload test
const { blobId } = await uploadToWalrus('Hello Walrus!');
console.log('Blob ID:', blobId);

// Retrieve test
const content = await getFromWalrus(blobId);
console.log('Content:', content);
```

### Test Sui Integration

```javascript
import { cmsClient } from './lib/sui-cms';

// Get author capability
const cap = await cmsClient.getAuthorCap(authorAddress);
console.log('Author Cap:', cap);

// Get content by owner
const content = await cmsClient.getContentByOwner(authorAddress);
console.log('My Content:', content);
```

## Troubleshooting

### Wallet Not Connecting
- Ensure you have a Sui wallet extension installed
- Make sure you're on testnet
- Check browser console for errors

### Transaction Failures
- Ensure you have sufficient SUI for gas
- Verify object IDs are correct
- Check that you have the required capabilities

### Walrus Upload Failures
- Verify Walrus network is accessible
- Check file size limits
- Ensure sufficient epochs specified

### Content Not Loading
- Verify blob ID is correct
- Check Walrus aggregator URL
- Ensure content was successfully uploaded

## Environment Configuration

### Testnet
```env
VITE_SUI_NETWORK=testnet
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
```

### Mainnet (when ready)
```env
VITE_SUI_NETWORK=mainnet
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus.space
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus.space
```

## Security Considerations

1. **Private Keys**: Never commit wallet private keys
2. **Admin Keys**: Keep admin wallet secure - it controls author permissions
3. **Content Validation**: Implement client-side content validation
4. **Rate Limiting**: Consider rate limits for content creation
5. **Blob Verification**: Verify blob contents before displaying

## Performance Optimization

1. **Caching**: Cache Walrus content locally
2. **Lazy Loading**: Load content on-demand
3. **Pagination**: Paginate content lists
4. **CDN**: Use Walrus aggregator caching
5. **Indexing**: Index on-chain events for faster queries

## Monitoring

### Track Events

```javascript
// Listen for content creation
const events = await cmsClient.getPublishedContent();

// Listen for content updates
const updates = await cmsClient.getContentEvents(contentId);
```

### Analytics

- Track wallet connections
- Monitor content creation rate
- Track Walrus storage usage
- Monitor transaction costs

## Cost Estimates

### Sui Blockchain
- Content creation: ~0.01 SUI
- Content update: ~0.008 SUI
- Publishing: ~0.005 SUI
- Author cap issuance: ~0.01 SUI

### Walrus Storage
- Content blob (10KB): ~0.001 SUI per epoch
- Media file (1MB): ~0.1 SUI per epoch
- Recommended epochs: 100+ for permanent storage

## Next Steps

1. ✅ Deploy smart contracts
2. ✅ Configure environment
3. ✅ Issue author capabilities
4. ✅ Create test content
5. ✅ Deploy to Walrus Sites
6. 🔄 Add custom domain (optional)
7. 🔄 Implement advanced features:
   - Content versioning UI
   - Multi-signature admin
   - Token-gated content
   - NFT-based memberships

## Support & Resources

- **Sui Documentation**: https://docs.sui.io
- **Walrus Documentation**: https://docs.walrus.site
- **Sui Discord**: https://discord.gg/sui
- **GitHub Issues**: [Your repo URL]

## License

MIT License - See LICENSE file for details
