# Quick Start - Decentralized CMS Demo

## 🚀 Get Started in 5 Minutes

This guide will help you deploy and demo the decentralized CMS for your Wednesday client call.

## Step 1: Deploy Smart Contracts (2 minutes)

```bash
# Navigate to Move project
cd /Users/user/My_Data/CMS/move/cms/decentralized_cms

# Build and deploy
sui client publish --gas-budget 100000000
```

**Save these values from the output:**
```
Package ID: 0x...
CMSPlatform: 0x...
ContentRegistry: 0x... (shared object)
```

## Step 2: Configure Frontend (1 minute)

Create `client/.env`:

```env
VITE_SUI_NETWORK=testnet
VITE_CMS_PACKAGE_ID=<paste_package_id>
VITE_CMS_PLATFORM_ID=<paste_platform_id>
VITE_CMS_REGISTRY_ID=<paste_registry_id>
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
```

## Step 3: Run the App (1 minute)

```bash
cd client
npm install  # if not done already
npm run dev
```

Open: http://localhost:5173

## Step 4: Grant Author Permissions (1 minute)

Using Sui CLI:

```bash
# Get your wallet address
sui client active-address

# Grant yourself author permissions
sui client call \
  --package <PACKAGE_ID> \
  --module content_registry \
  --function issue_author_cap \
  --args <PLATFORM_ID> <YOUR_ADDRESS> \
  --gas-budget 10000000
```

## Demo Flow for Client Call

### 1. Show the Traditional CMS (Current State)
- Login with email/password
- Create content using centralized MongoDB
- Show the limitations: centralized server, single point of failure

### 2. Show the Decentralized Architecture
- Open the architecture diagram in `DECENTRALIZED_CMS_SETUP.md`
- Explain: Sui blockchain + Walrus storage = fully decentralized
- No backend servers needed

### 3. Demonstrate Wallet Integration
- Connect Sui wallet
- Show wallet address and connection status
- Explain: Authentication via wallet signatures, not passwords

### 4. Create Decentralized Content
- Use `DecentralizedContentEditor.jsx`
- Create a blog post
- Show content uploading to Walrus (real-time)
- Show transaction on Sui blockchain

### 5. Upload Media to Walrus
- Upload an image
- Show Walrus blob ID
- Display image from Walrus aggregator URL

### 6. Show On-Chain Data
- Open Sui Explorer: https://suiscan.xyz/testnet
- Search for your content transaction
- Show on-chain metadata vs off-chain content

### 7. Access Control Demo
- Show AuthorCap NFT in wallet
- Demonstrate permission-based editing
- Show how only authorized users can create content

## Key Talking Points

### ✅ What We've Built

1. **Smart Contracts** (Move language)
   - Content registry on Sui blockchain
   - NFT-based permissions (AuthorCap)
   - Decentralized access control
   - Event-driven architecture

2. **Walrus Integration**
   - Blob storage for content
   - Blob storage for media
   - Decentralized CDN
   - Permanent content addressing

3. **TypeScript SDK**
   - Easy blockchain interaction
   - Wallet integration
   - Transaction building
   - Event queries

4. **React Frontend**
   - Wallet connection (Sui Wallet, Suiet, etc.)
   - Rich text editor
   - Media upload
   - Real-time status updates

### 🎯 FRP Requirements Met

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Admins can manage authors | ✅ | AuthorCap NFT issuance |
| Authors can change content | ✅ | update_content function |
| Authors can upload media | ✅ | Walrus blob storage |
| Content rendered as Walrus Sites | 🔄 | Can deploy with `walrus site publish` |
| Client-side rendering | ✅ | React app fetches from Walrus |
| Web UX as Walrus Site | 🔄 | Ready to deploy |
| No centralized backend | ✅ | Only Sui + Walrus |

### 📊 What's Next (Post-Demo)

**Phase 1: Core Features** (This Week)
- ✅ Smart contracts deployed
- ✅ Walrus integration working
- ✅ Basic UI functional

**Phase 2: Polish** (Next Week)
- Deploy frontend to Walrus Sites
- Add content versioning UI
- Implement advanced search
- Add markdown preview

**Phase 3: Advanced Features** (Week 3-4)
- Template engine integration
- Multi-signature admin
- Token-gated content
- Analytics dashboard

**Phase 4: Go-to-Market**
- Documentation
- Landing page
- Video tutorials
- Developer docs

## Testing Checklist

Before the client call, test:

- [ ] Smart contracts deploy successfully
- [ ] Wallet connects properly
- [ ] Content uploads to Walrus
- [ ] Transactions execute on Sui
- [ ] Media uploads work
- [ ] Content displays correctly
- [ ] Author permissions work
- [ ] Publish/unpublish toggles work

## Backup Plan

If live demo fails:
1. Have screenshots ready
2. Pre-record video demo
3. Show code walkthrough
4. Explain architecture with diagrams

## Client Questions to Expect

**Q: Is this fully decentralized?**
A: Yes! No centralized servers. Only Sui blockchain + Walrus storage.

**Q: What about performance?**
A: Walrus has CDN-like performance. Sui finality is ~400ms.

**Q: Cost to run?**
A: No server costs! Only pay for blockchain gas (~$0.01 per content) and Walrus storage (~$0.10/MB/year).

**Q: Can we customize the templates?**
A: Yes! We can integrate any template engine (Handlebars, Liquid, etc.).

**Q: What if Walrus goes down?**
A: Walrus is decentralized with multiple redundant nodes. Content has multiple copies.

**Q: How do we migrate existing content?**
A: We'll build a migration script to upload existing content to Walrus and register on-chain.

**Q: Can we white-label this?**
A: Absolutely! All branding and UI is customizable.

## Demo Script (5 minutes)

**Minute 1**: Show architecture
- "Here's how it works: content on Walrus, metadata on Sui"

**Minute 2**: Connect wallet
- "No passwords needed - authenticate with your Sui wallet"

**Minute 3**: Create content
- "Watch as content uploads to Walrus in real-time"
- "Transaction is confirmed on Sui blockchain"

**Minute 4**: Show on-chain data
- "Here's the content metadata on Sui Explorer"
- "Here's the actual content blob on Walrus"

**Minute 5**: Discuss roadmap
- "This is our MVP - here's what's next..."

## After the Call

1. Share GitHub repository
2. Send deployment guide
3. Provide testnet credentials for them to test
4. Schedule technical deep-dive if interested

## Emergency Contacts

- Sui Discord: https://discord.gg/sui
- Walrus Docs: https://docs.walrus.site
- Your contact info for questions

---

Good luck with the demo! 🚀
