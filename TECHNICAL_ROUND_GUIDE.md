# Technical Round Preparation - How the Decentralized CMS Works

## 🎯 What You're Building

A **fully decentralized Content Management System** where:
- ✅ NO backend servers
- ✅ NO centralized database
- ✅ Sui blockchain for permissions & metadata
- ✅ Walrus storage for actual content
- ✅ React frontend hosted on Walrus Sites

**Think**: WordPress/Medium, but 100% decentralized

---

## 🏗️ System Architecture

### The Big Picture

```
USER BROWSER
     │
     ├──> React App (hosted on Walrus Sites)
     │    • Rich text editor
     │    • Wallet connect
     │    • Content viewer
     │
     ├──> SUI BLOCKCHAIN
     │    • Stores metadata (title, author, dates)
     │    • Stores blob IDs (pointers to Walrus)
     │    • Manages permissions (NFT-based)
     │
     └──> WALRUS STORAGE
          • Stores actual content (blog posts)
          • Stores media files (images, videos)
          • Decentralized blob storage
```

### Why This Split?

**Sui Blockchain** = Expensive but queryable
- Store small data (metadata)
- Need to search/filter
- Need smart contract logic

**Walrus Storage** = Cheap but immutable
- Store large data (content, media)
- Don't need to search content directly
- Just need to retrieve by ID

---

## 📊 Data Model

### What Lives on Sui Blockchain

```javascript
ContentPage Object:
{
  id: "0x1234...",                    // Unique ID
  slug: "my-first-blog-post",         // URL slug
  title: "My First Blog Post",        // Title
  walrus_blob_id: "abc123xyz...",     // ← POINTER to Walrus!
  media_blob_ids: ["img1", "img2"],   // ← Image pointers
  author: "0x3d20...",                // Author wallet address
  editors: ["0xabcd...", "0xef12..."],// Who can edit
  is_published: true,                 // Published status
  created_at: 1699123456,             // Timestamp
  updated_at: 1699234567,             // Last updated
  version: 3                          // Version number
}
```

### What Lives on Walrus Storage

```javascript
Blob ID: "abc123xyz..."
Content: "# My First Blog Post\n\nThis is the content..."
Size: 15KB
Epochs: 100 (how long to store)

Blob ID: "img1"
Content: [binary image data]
Size: 500KB
Epochs: 100
```

### The Connection

```
Sui ContentPage has:
  walrus_blob_id = "abc123"
                    │
                    │ Points to
                    ▼
Walrus Blob: "abc123"
  Content = "# My blog post..."
```

---

## 🔄 Core Workflows

### 1. Creating Content (Step by Step)

**What Happens:**

```
Step 1: User writes content
  └─> Types in React editor: "# My Blog Post\n\nContent here..."

Step 2: Click "Create Content"
  └─> Frontend prepares to upload

Step 3: Upload to Walrus
  └─> PUT https://publisher.walrus-testnet.walrus.space/v1/store?epochs=100
  └─> Send content as blob
  └─> Response: { blobId: "abc123xyz..." }

Step 4: Create Sui transaction
  └─> Call smart contract: create_content()
  └─> Pass: title, slug, blob_id
  └─> Also pass: AuthorCap (permission NFT)

Step 5: Sign transaction in wallet
  └─> Wallet popup appears
  └─> User approves transaction

Step 6: Transaction executes
  └─> Smart contract creates ContentPage object
  └─> Stores metadata + blob_id on blockchain
  └─> Emits ContentCreated event

Step 7: Success!
  └─> Content is now decentralized
  └─> Metadata on Sui, content on Walrus
```

**The Code:**

```javascript
async function createContent(title, content) {
  // 1. Upload to Walrus
  const blob = new Blob([content], { type: 'text/plain' });
  const response = await fetch(
    'https://publisher.walrus-testnet.walrus.space/v1/store?epochs=100',
    {
      method: 'PUT',
      body: blob
    }
  );
  const result = await response.json();
  const blobId = result.newlyCreated.blobObject.blobId;

  // 2. Create Sui transaction
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::content_registry::create_content`,
    arguments: [
      tx.object(authorCapId),  // Permission NFT
      tx.object(registryId),
      tx.object(platformId),
      tx.pure.string(slug),
      tx.pure.string(title),
      tx.pure.string(blobId)   // ← Walrus pointer!
    ]
  });

  // 3. Sign and execute
  const result = await signAndExecuteTransaction({ transaction: tx });
  
  console.log('Success! Digest:', result.digest);
}
```

---

### 2. Reading Content (Step by Step)

**What Happens:**

```
Step 1: User visits URL
  └─> Navigate to: /content/my-first-blog-post

Step 2: Query Sui blockchain
  └─> Search for ContentPage with slug = "my-first-blog-post"
  └─> Get ContentPage object

Step 3: Extract blob ID
  └─> From ContentPage: walrus_blob_id = "abc123xyz..."

Step 4: Fetch from Walrus
  └─> GET https://aggregator.walrus-testnet.walrus.space/v1/abc123xyz...
  └─> Response: "# My First Blog Post\n\nContent..."

Step 5: Render in browser
  └─> Parse markdown
  └─> Display to user
  └─> All client-side!
```

**The Code:**

```javascript
async function loadContent(slug) {
  // 1. Query Sui for metadata
  const contentPage = await suiClient.getObject({
    id: contentId,
    options: { showContent: true }
  });

  const fields = contentPage.data.content.fields;
  const blobId = fields.walrus_blob_id;

  // 2. Fetch content from Walrus
  const response = await fetch(
    `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`
  );
  const content = await response.text();

  // 3. Display
  return {
    title: fields.title,
    author: fields.author,
    content: content
  };
}
```

---

### 3. Updating Content (How to Handle Immutability)

**Problem**: Walrus blobs are IMMUTABLE (can't edit)

**Solution**: Upload NEW blob, update pointer on Sui

```
Step 1: User edits content
  └─> Makes changes in editor

Step 2: Upload NEW version to Walrus
  └─> PUT to Walrus Publisher
  └─> Get NEW blob_id: "xyz789new..."

Step 3: Update Sui metadata
  └─> Call update_content() smart contract
  └─> Pass NEW blob_id
  └─> Increment version number

Result:
  Old: version=1, blob_id="abc123old"
  New: version=2, blob_id="xyz789new"
  
  Both blobs exist on Walrus!
  Current version points to new blob
  Old blob expires after epochs
```

**Version History:**

```
Timeline:
───────────────────────────────────────────────
V1: Created           V2: Updated          V3: Updated
blob="abc"            blob="def"           blob="xyz"
(expires epoch 105)   (expires 115)        (expires 125)
                                           ↑ Current
```

---

## 🔐 Permission System (AuthorCap NFT)

### How Permissions Work

**Traditional CMS:**
```
User → Password → Database check → Allowed/Denied
        ↑ Can be hacked
        ↑ Centralized
        ↑ Single point of failure
```

**Decentralized CMS:**
```
User → Owns AuthorCap NFT → Smart contract verifies → Allowed/Denied
        ↑ Cannot be faked (blockchain)
        ↑ Decentralized
        ↑ No passwords needed!
```

### AuthorCap NFT

```javascript
AuthorCap Object:
{
  id: "0xbe514b...",
  author_address: "0x3d20a...",  // Who owns this
  is_active: true                 // Can be deactivated by admin
}
```

**How It Works:**

1. **Admin issues AuthorCap**
   ```move
   issue_author_cap(platform, recipient_address)
   // Creates NFT, transfers to recipient
   ```

2. **Author owns NFT in wallet**
   - Shows up in wallet as owned object
   - Can't be faked (blockchain verified)

3. **Author uses NFT to create content**
   ```move
   create_content(
     _author_cap: &AuthorCap,  // ← Must pass this!
     ...
   )
   // Smart contract checks:
   // - Does user own this AuthorCap?
   // - Is it active?
   // - If yes → allow, if no → reject
   ```

---

## 💾 Storage Strategy

### What Goes Where

**Sui Blockchain** (Expensive ~$0.10/KB):
```
✅ DO Store:
- Metadata (title, author, dates)
- Blob IDs (pointers to Walrus)
- Permissions
- Publish status
- Version numbers

❌ DON'T Store:
- Actual content (too expensive!)
- Images (way too expensive!)
- Videos (impossible!)
```

**Walrus** (Cheap ~$0.001/KB):
```
✅ DO Store:
- Blog post content
- Images
- Videos
- Documents
- Any large files

❌ DON'T Store:
- Metadata (better on-chain for querying)
- Permissions (need smart contract logic)
```

### Cost Example

**10KB blog post:**
- On Sui: ~$0.10
- On Walrus (100 epochs): ~$0.01
- **Savings: 90%!**

**1MB image:**
- On Sui: ~$10+ (impractical!)
- On Walrus (100 epochs): ~$0.10
- **Savings: 99%!**

---

## 🔍 How Search Works

### The Challenge

Can't search INSIDE Walrus blobs directly.

### The Solution

Index metadata on Sui!

**What's Searchable:**

```javascript
// From Sui blockchain (fast to query)
ContentPage {
  title: "My Blog Post",     // ✅ Searchable
  slug: "my-blog-post",       // ✅ Searchable
  author: "0x3d20...",        // ✅ Searchable
  is_published: true,         // ✅ Searchable
  created_at: 1699123456,     // ✅ Searchable
  
  walrus_blob_id: "abc123"    // ❌ Content not searchable
}
```

**Search Implementation:**

```javascript
// Search by title
const results = await suiClient.queryEvents({
  query: { MoveEventType: `${PACKAGE_ID}::content_registry::ContentCreated` }
});

const matches = results.filter(r => 
  r.parsedJson.title.toLowerCase().includes(searchTerm)
);

// Search by author
const authorContent = await suiClient.getOwnedObjects({
  owner: authorAddress,
  filter: { StructType: `${PACKAGE_ID}::content_registry::ContentPage` }
});
```

---

## 🚀 Frontend Hosting (Walrus Sites)

### How to Deploy

```bash
# 1. Build React app
npm run build
# Creates: dist/ folder

# 2. Deploy to Walrus
walrus site publish --path dist --epochs 100

# Output:
# Site URL: https://a1b2c3d4.walrus.site
```

### What Happens

```
Your React app files:
├── index.html      → Uploaded to Walrus → blob_id: "html123"
├── app.js          → Uploaded to Walrus → blob_id: "js456"
├── styles.css      → Uploaded to Walrus → blob_id: "css789"
└── logo.png        → Uploaded to Walrus → blob_id: "png012"

Site config stored on Sui:
- Maps URLs to blob IDs
- Example: "/" → "html123"
           "/app.js" → "js456"

When user visits https://a1b2c3d4.walrus.site:
1. Walrus gateway checks Sui for site config
2. Finds blob ID for index.html
3. Fetches from Walrus Aggregator
4. Returns to browser
5. Browser loads other files from Walrus
6. React app runs fully in browser!
```

**Result**: Zero web servers needed!

---

## ⚡ Performance Optimizations

### 1. Caching

```javascript
// Cache Walrus content in browser
const cache = {};

async function getContent(blobId) {
  if (cache[blobId]) {
    return cache[blobId]; // Instant!
  }
  
  const content = await fetchFromWalrus(blobId);
  cache[blobId] = content;
  return content;
}
```

### 2. Parallel Loading

```javascript
// Load metadata and content simultaneously
async function loadPage(contentId) {
  // Start metadata fetch
  const metadataPromise = fetchFromSui(contentId);
  
  // While waiting, show loading screen
  showLoading();
  
  // Get metadata (fast ~100ms)
  const metadata = await metadataPromise;
  
  // Show title/author immediately
  displayMetadata(metadata);
  
  // Fetch content in background (slower ~200ms)
  const content = await fetchFromWalrus(metadata.blobId);
  
  // Display content when ready
  displayContent(content);
}
```

### 3. Lazy Loading Media

```javascript
// Load images only when visible
<img 
  src={walrusBlobUrl} 
  loading="lazy"  // Browser only loads when scrolled into view
/>
```

---

## 🎯 Complete Data Flow Example

### Creating a Blog Post

```
1. USER ACTION
   └─> Types: "# Hello World\nMy first post!"
   └─> Clicks "Create"

2. FRONTEND (React)
   └─> Validates form
   └─> Prepares content blob
   └─> Shows "Uploading..."

3. WALRUS UPLOAD
   └─> PUT to Publisher API
   └─> Content encoded with erasure coding
   └─> Distributed across storage nodes
   └─> Returns: blob_id = "abc123xyz"
   └─> Takes ~200-500ms

4. FRONTEND (React)
   └─> Shows "Creating transaction..."
   └─> Builds Sui transaction
   └─> Includes: title, slug, blob_id, AuthorCap

5. SUI WALLET
   └─> Popup appears
   └─> Shows transaction details
   └─> User clicks "Approve"
   └─> Signs transaction
   └─> Takes ~2-5 seconds

6. SUI BLOCKCHAIN
   └─> Transaction executes
   └─> Smart contract validates AuthorCap
   └─> Creates ContentPage object
   └─> Stores metadata + blob_id
   └─> Emits ContentCreated event
   └─> Takes ~400ms (Sui finality)

7. FRONTEND (React)
   └─> Receives transaction digest
   └─> Shows "Success!"
   └─> Redirects to content list

Total time: ~3-6 seconds
```

### Reading a Blog Post

```
1. USER ACTION
   └─> Visits: /content/hello-world

2. FRONTEND (React)
   └─> Extracts slug: "hello-world"
   └─> Shows "Loading..."

3. SUI QUERY
   └─> Query for ContentPage by slug
   └─> Find matching object
   └─> Fetch object data
   └─> Extract: title, author, blob_id
   └─> Takes ~100ms

4. FRONTEND (React)
   └─> Shows title and author immediately
   └─> Still loading content...

5. WALRUS FETCH
   └─> GET from Aggregator API
   └─> Aggregator reconstructs blob from fragments
   └─> Returns content text
   └─> Takes ~150-300ms

6. FRONTEND (React)
   └─> Parse markdown
   └─> Render HTML
   └─> Display to user

Total time: ~250-400ms (fast!)
```

---

## 🛠️ Tech Stack

**Smart Contracts:**
```
Move language on Sui blockchain
- content_registry.move (370 lines)
- Manages permissions, metadata, registry
```

**Storage:**
```
Walrus decentralized storage
- Erasure coding
- Testnet endpoints
- Blob-based storage
```

**Frontend:**
```
React 18
- Vite (build tool)
- TailwindCSS (styling)
- React Quill (editor)
- @mysten/dapp-kit (wallet)
- @mysten/sui (blockchain SDK)
- Custom Walrus client
```

**Deployment:**
```
Smart contracts → Sui testnet
Frontend → Walrus Sites
Content → Walrus storage
NO traditional hosting!
```

---

## 📝 Key Facts to Remember

### Endpoints
```
Sui RPC: https://fullnode.testnet.sui.io:443
Walrus Publisher: https://publisher.walrus-testnet.walrus.space
Walrus Aggregator: https://aggregator.walrus-testnet.walrus.space
```

### API Calls
```
Upload:   PUT /v1/store?epochs=100
Download: GET /v1/{blob_id}
Check:    HEAD /v1/{blob_id}
```

### Key Concepts
```
- Erasure Coding: Data split + redundancy
- Content-Addressed: Same content = Same blob ID
- Immutable: Can't edit blobs, create new ones
- Epochs: Storage duration (like rental periods)
- AuthorCap: Permission NFT
- Blob ID: Unique identifier (hash of content)
```

---

## 🎤 What to Say in Technical Round

### "Explain how your CMS works"

"We're building a decentralized CMS using a hybrid approach. The Sui blockchain stores metadata like titles, authors, and most importantly, blob IDs that point to content on Walrus storage. Walrus stores the actual content and media files using erasure coding.

When a user creates content, we first upload it to Walrus and get a blob ID. Then we create a Sui transaction that stores the metadata along with that blob ID. The transaction also verifies the user owns an AuthorCap NFT for permissions.

When reading content, we query Sui for the metadata, extract the blob ID, then fetch the actual content from Walrus. Everything is rendered client-side in the browser.

For updates, since Walrus blobs are immutable, we upload a new version and update the pointer on Sui. This gives us automatic version history."

### "Why Sui AND Walrus?"

"It's about cost and capabilities. Sui is expensive but offers smart contract logic, queryability, and fast lookups. Walrus is cheap but immutable. 

Storing a 10KB blog post on Sui costs ~$0.10. On Walrus it's ~$0.01 for 100 epochs. For a 1MB image, Sui would be $10+ while Walrus is ~$0.10.

We need Sui for metadata because we want to search by title, author, date, etc. But we put large content on Walrus because it's 10-100x cheaper. Together they provide the perfect balance."

### "How do permissions work?"

"We use NFT-based permissions called AuthorCap. When an admin wants to grant author rights, they call issue_author_cap() which creates an NFT and transfers it to the author's wallet.

When the author creates content, they must pass this AuthorCap to the smart contract. The contract verifies they own it and it's active. No passwords, no centralized auth database - just blockchain verification.

The admin can deactivate the NFT without destroying it, and it could even be transferred or sold if needed."

---

## ✅ Quick Reference

**3 Main Components:**
1. Sui = Metadata + Permissions (on-chain)
2. Walrus = Content + Media (off-chain)
3. React = User Interface (on Walrus Sites)

**3 Main Workflows:**
1. Create = Upload to Walrus → Store blob ID on Sui
2. Read = Query Sui → Fetch from Walrus
3. Update = New Walrus blob → Update Sui pointer

**3 Key Advantages:**
1. No servers (95% cost reduction)
2. No passwords (wallet-based auth)
3. Censorship resistant (fully decentralized)

---

**You're ready for the technical round!** 💪

Study this guide and you'll be able to explain every detail of how the system works, why design decisions were made, and how data flows through the system.
