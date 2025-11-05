# Walrus Technical Assessment Call - Preparation Guide
## They Will Test YOUR Understanding

**Date**: Today
**Type**: Technical Assessment - They quiz YOU
**Goal**: Prove you understand Walrus well enough to build the decentralized CMS

---

## 🎯 What This Call Really Is

### The Reality:
- ❌ **NOT** a learning session where you ask questions
- ❌ **NOT** them explaining Walrus to you
- ✅ **YES** - They will test YOUR understanding of Walrus
- ✅ **YES** - They will assess if you CAN build this CMS
- ✅ **YES** - You need to PROVE you know how Walrus works
- ✅ **YES** - You need to explain HOW you'll use Walrus

### What They're Evaluating:
1. Do you understand Walrus architecture?
2. Do you know how to integrate Walrus with your app?
3. Can you articulate your technical approach?
4. Have you thought through the challenges?
5. Are you capable of delivering this project?

---

## 📚 What YOU Must Know About Walrus

### 1. Walrus Architecture Fundamentals

**What is Walrus?**
- Decentralized blob storage network by Mysten Labs (Sui team)
- Uses **erasure coding** to store data efficiently across nodes
- Content-addressed storage (like IPFS)
- Integrated with Sui blockchain
- No central server - fully decentralized

**Key Components:**

1. **Storage Nodes**
   - Decentralized network of nodes
   - Store encoded blob fragments
   - No single node has complete blob
   - Redundancy through erasure coding

2. **Publisher API**
   - Endpoint: `https://publisher.walrus-testnet.walrus.space`
   - Used to UPLOAD blobs
   - HTTP PUT requests
   - Returns blob ID

3. **Aggregator API**
   - Endpoint: `https://aggregator.walrus-testnet.walrus.space`
   - Used to DOWNLOAD/READ blobs
   - HTTP GET requests
   - Reconstructs blob from fragments

4. **Walrus Sites**
   - Static websites hosted entirely on Walrus
   - No traditional web hosting needed
   - Accessed via special URLs
   - Perfect for decentralized frontends

### 2. How Walrus Storage Works

**Erasure Coding Explained:**
```
Original File (1MB)
    ↓
Encode with erasure coding (splits + adds redundancy)
    ↓
Creates multiple fragments (e.g., 20 fragments)
    ↓
Distributed across storage nodes
    ↓
Only need X fragments to reconstruct (e.g., 10 out of 20)
    ↓
High availability + fault tolerance
```

**Key Benefits:**
- More efficient than full replication
- Lower storage costs
- Higher availability
- Tolerates node failures

### 3. Blob Upload Process

**Step-by-step:**

```javascript
// 1. Prepare your content
const content = "My blog post content";
const blob = new Blob([content], { type: 'text/plain' });

// 2. Upload to Walrus Publisher
const response = await fetch(
  'https://publisher.walrus-testnet.walrus.space/v1/store?epochs=100',
  {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': 'text/plain' }
  }
);

// 3. Get blob ID from response
const result = await response.json();
const blobId = result.newlyCreated.blobObject.blobId;
// Example: "abc123xyz..."

// 4. Store blob ID on Sui blockchain
// (in your smart contract as metadata)
```

**Response Types:**
- `newlyCreated`: New blob was stored
- `alreadyCertified`: Blob already exists (same content = same ID)

### 4. Blob Retrieval Process

**Step-by-step:**

```javascript
// 1. Get blob ID from Sui blockchain
const contentMetadata = await suiClient.getObject(contentId);
const blobId = contentMetadata.data.content.fields.walrus_blob_id;

// 2. Fetch from Walrus Aggregator
const response = await fetch(
  `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`
);

// 3. Get content
const content = await response.text();

// 4. Render in your app
document.getElementById('content').innerHTML = content;
```

**URL Pattern:**
```
https://aggregator.walrus-testnet.walrus.space/v1/{BLOB_ID}
```

### 5. Storage Epochs

**What are epochs?**
- Time periods for storage duration
- Pay for storage per epoch
- Like rental periods for your data

**Important Concepts:**
- **Minimum epochs**: Can't store for less than X epochs
- **Extension**: Can extend storage before expiration
- **Expiration**: Blob becomes unavailable after epochs end
- **Recommendation**: 100+ epochs for "permanent" storage

**Cost Model:**
```
Cost = Data Size × Number of Epochs × Price per Epoch
```

### 6. Content Addressing & Blob IDs

**How Blob IDs Work:**
- Content-addressed (hash of content)
- Same content = Same blob ID (deduplication)
- Different content = Different blob ID
- Immutable - can't modify existing blobs

**Implications for CMS:**
- Every content update creates a NEW blob ID
- Old blob IDs remain (versioning!)
- Need to update Sui metadata with new blob ID
- Old blobs eventually expire (based on epochs)

---

## 🏗️ YOUR Proposed Architecture

### System Design You Will Explain:

```
┌─────────────────────────────────────────────────────┐
│                USER BROWSER                         │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │    React Frontend (Walrus Site)           │    │
│  │    • Content Editor                       │    │
│  │    • Sui Wallet Integration               │    │
│  │    • Walrus Client                        │    │
│  └───────┬─────────────────────┬─────────────┘    │
│          │                     │                   │
└──────────┼─────────────────────┼───────────────────┘
           │                     │
           │                     │
    ┌──────▼──────┐      ┌──────▼────────┐
    │     SUI     │      │    WALRUS     │
    │ BLOCKCHAIN  │      │    STORAGE    │
    │             │      │               │
    │ • Metadata  │      │ • Content     │
    │ • Blob IDs  │      │ • Media Files │
    │ • Permissions      │               │
    └─────────────┘      └───────────────┘
```

### Data Flow - Creating Content

**Step-by-step process you'll implement:**

1. **User writes content in browser**
   - Rich text editor (React Quill)
   - Markdown or HTML

2. **Upload to Walrus**
   ```javascript
   PUT https://publisher.walrus-testnet.walrus.space/v1/store?epochs=100
   Body: content blob
   → Returns: blob_id
   ```

3. **Create Sui transaction**
   ```move
   // Smart contract call
   create_content(
     author_cap,
     slug: "my-post",
     title: "My Blog Post",
     walrus_blob_id: "abc123...",
     ...
   )
   ```

4. **Store metadata on-chain**
   - Blob ID (pointer to Walrus)
   - Title, author, timestamps
   - Permissions, publish status

5. **User gets confirmation**
   - Transaction digest
   - Content is now decentralized!

### Data Flow - Reading Content

**Step-by-step process you'll implement:**

1. **User requests content**
   - Navigate to URL or search

2. **Query Sui blockchain**
   ```javascript
   const content = await suiClient.getObject(contentId);
   ```

3. **Extract blob ID**
   ```javascript
   const blobId = content.data.fields.walrus_blob_id;
   ```

4. **Fetch from Walrus**
   ```javascript
   GET https://aggregator.walrus-testnet.walrus.space/v1/{blobId}
   → Returns: content blob
   ```

5. **Render in browser**
   - Parse markdown/HTML
   - Display to user

---

## 🎯 How You'll Use Walrus for CMS

### Storage Strategy

**What Goes on Walrus:**

1. **Blog Post Content** (1-100KB each)
   - Markdown or HTML
   - One blob per post
   - New blob on each edit

2. **Images** (100KB - 5MB each)
   - JPEG, PNG, WebP
   - Uploaded separately
   - Array of blob IDs in metadata

3. **Videos** (1MB - 100MB each)
   - MP4, WebM
   - Chunked if needed
   - Reference by blob ID

4. **Documents** (PDF, etc.)
   - Uploaded as-is
   - Downloadable via blob ID

**What Goes on Sui:**
- Content metadata (title, slug, author)
- Walrus blob IDs (pointers)
- Permissions (AuthorCap NFTs)
- Publish status, timestamps
- Version numbers

### Content Update Strategy

**Problem**: Content needs to be editable

**Solution**:
1. Blog post is edited
2. Upload NEW version to Walrus → new blob_id
3. Update Sui metadata with new blob_id
4. Old blob_id still exists (versioning!)
5. Old blob expires after its epochs end

**Versioning Approach:**
```
Version 1: blob_id_v1, version=1, created=T1
Version 2: blob_id_v2, version=2, updated=T2
Version 3: blob_id_v3, version=3, updated=T3

Current version always stored in Sui metadata
Old versions accessible if needed (history)
```

### Media Handling Strategy

**Images:**
```javascript
// Upload image to Walrus
const imageBlob = new Blob([imageFile]);
const result = await uploadToWalrus(imageBlob);
const imageBlobId = result.blobId;

// Add to content's media array on Sui
await addMedia(contentId, imageBlobId);

// Display in content
<img src={`https://aggregator.walrus-testnet.walrus.space/v1/${imageBlobId}`} />
```

**Multiple Images Per Post:**
```move
// Sui smart contract
struct ContentPage {
  ...
  media_blob_ids: vector<String>, // Array of blob IDs
  ...
}
```

### Walrus Sites for Frontend

**Hosting Your React App:**

1. **Build production bundle**
   ```bash
   npm run build
   # Creates /dist folder
   ```

2. **Deploy to Walrus Sites**
   ```bash
   walrus site publish --path dist --epochs 100
   ```

3. **Get Walrus Site URL**
   ```
   https://{site-id}.walrus.site
   ```

4. **Access via custom domain** (optional)
   - Configure DNS
   - Point to Walrus Site

**Benefits:**
- No web hosting provider needed
- Censorship resistant
- High availability
- Decentralized

---

## 💡 Technical Challenges & Your Solutions

### Challenge 1: Content Updates Create New Blobs

**Problem:**
- Walrus blobs are immutable
- Each edit creates new blob ID
- Storage costs accumulate

**Your Solution:**
```
1. Only store current version on Walrus
2. Old blob IDs naturally expire (epochs)
3. Keep version history on-chain (blob IDs + metadata)
4. Optional: Archive old versions separately
```

### Challenge 2: Search & Discovery

**Problem:**
- Can't search inside Walrus blobs
- Need full-text search

**Your Solution:**
```
1. Store searchable metadata on Sui
   - Title, tags, description
   - Author, category
2. Build search index from on-chain data
3. Client-side search across metadata
4. Optional: Use Sui events for indexing
```

### Challenge 3: Image Thumbnails

**Problem:**
- Need different image sizes
- Walrus stores original only

**Your Solution:**
```
Option A: Client-side resizing
- Load full image
- Resize in browser (canvas API)
- Cache locally

Option B: Pre-upload multiple sizes
- Generate thumbnails before upload
- Upload small/medium/large versions
- Store multiple blob IDs
```

### Challenge 4: Cost Management

**Problem:**
- Storing everything costs SUI tokens

**Your Solution:**
```
1. Optimize blob sizes (compress before upload)
2. Use appropriate epochs (not too long)
3. Implement content expiration
4. Charge users for storage (optional)
5. Batch operations where possible
```

### Challenge 5: Performance

**Problem:**
- Need fast content loading

**Your Solution:**
```
1. Parallel fetching (Sui + Walrus simultaneously)
2. Client-side caching (localStorage/IndexedDB)
3. Lazy loading for media
4. CDN-like behavior from Aggregator
5. Progressive loading (metadata first, content second)
```

---

## 🎤 Questions They Might Ask YOU

### Category A: Architecture Questions

**Q1: "How will you integrate Walrus with your CMS?"**

**Your Answer:**
> "We'll use a hybrid architecture. Sui blockchain stores metadata and permissions, while Walrus stores the actual content and media. When a user creates content, we first upload to Walrus to get a blob ID, then create a Sui transaction that stores the metadata along with that blob ID. For reading, we query Sui for metadata, extract the blob ID, and fetch the content from Walrus Aggregator."

**Q2: "Where exactly does Walrus fit in your system?"**

**Your Answer:**
> "Walrus serves three purposes: First, storing blog post content (text/markdown), second, storing media files (images/videos), and third, hosting our entire React frontend as a Walrus Site. The Sui blockchain handles access control via NFT-based permissions and stores pointers (blob IDs) to the content on Walrus."

**Q3: "How will you handle content updates?"**

**Your Answer:**
> "Since Walrus blobs are immutable, each content update creates a new blob and new blob ID. We'll upload the new version to Walrus, get the new blob ID, then update the Sui metadata via a smart contract function. The old blob IDs remain for versioning but will naturally expire based on their epoch duration. This gives us built-in version history."

### Category B: Technical Implementation Questions

**Q4: "How will users upload content from the browser?"**

**Your Answer:**
> "We'll use the Walrus Publisher API directly from the browser. Users write content in our React editor, we convert it to a Blob object, then make a PUT request to `publisher.walrus-testnet.walrus.space/v1/store?epochs=100`. The response gives us a blob ID which we then use in our Sui smart contract call."

**Q5: "How do you ensure only authorized users can upload?"**

**Your Answer:**
> "We use Sui's capability pattern. Users must own an AuthorCap NFT to call our content creation functions. The smart contract verifies they have a valid AuthorCap before allowing them to register content. The Walrus upload itself is permissionless, but without registering the blob ID on-chain via our smart contract, the content isn't part of the CMS. So effectively, only authorized users can add content to the system."

**Q6: "What about large files like videos?"**

**Your Answer:**
> "For large files, we have two approaches: For videos under 100MB, we upload directly to Walrus. For larger files, we could implement chunking - split the file into smaller blobs, upload each chunk separately, and store an array of blob IDs on-chain. On retrieval, we fetch and reassemble the chunks. We'll also consider client-side compression before upload."

### Category C: Performance & Scale Questions

**Q7: "How will you ensure good performance for users?"**

**Your Answer:**
> "Several strategies: First, parallel fetching - we query Sui and Walrus simultaneously. Second, client-side caching using localStorage or IndexedDB for recently accessed content. Third, lazy loading for media - load text first, images second. Fourth, we leverage Walrus Aggregator's CDN-like behavior for fast retrieval. Finally, progressive loading - show metadata immediately, stream content as it arrives."

**Q8: "What if Walrus is slow or unavailable?"**

**Your Answer:**
> "Walrus is decentralized with multiple nodes, so it's inherently more available than centralized storage. If the Aggregator is slow, we could implement retry logic and timeout handling. We'll also add loading states and graceful degradation in the UI. For critical metadata, that's on Sui which has sub-second finality. We can show the metadata (title, author) even if Walrus content is still loading."

**Q9: "Can this scale to thousands of users and content pieces?"**

**Your Answer:**
> "Yes, because both Sui and Walrus are designed for scale. Sui can handle hundreds of thousands of TPS, and Walrus storage scales horizontally across nodes. Each content piece is independent - there's no bottleneck. The client does the work of fetching and rendering, so we're not limited by server capacity. The limiting factor might be user wallet transaction speed, but even that's fast enough for content creation."

### Category D: Cost & Economics Questions

**Q10: "What will the storage costs be?"**

**Your Answer:**
> "For testnet, we'll use the testnet endpoints which are free for development. For mainnet, costs depend on data size and epochs. A typical blog post (10KB) stored for 100 epochs might cost around 0.01 SUI (~$0.01). An image (1MB) for 100 epochs might be 1 SUI (~$1). This is dramatically cheaper than traditional hosting which costs $100-300/month. Users could even pay their own storage costs when creating content."

**Q11: "How will you manage storage costs long-term?"**

**Your Answer:**
> "A few strategies: First, compress content before uploading. Second, use appropriate epoch durations - not too long for ephemeral content. Third, implement automatic archival - move old content to shorter epochs or off-system. Fourth, potentially charge users a small fee for content creation (pay-to-publish model). Fifth, optimize media - store compressed/resized versions rather than huge originals."

### Category E: Walrus-Specific Questions

**Q12: "Do you understand erasure coding and how it works?"**

**Your Answer:**
> "Yes, erasure coding splits data into fragments and adds redundancy. So a 1MB file might become 20 fragments of 50KB each, where only 10 fragments are needed to reconstruct the original. This means Walrus can tolerate multiple node failures while using less storage than full replication. It's more efficient than storing complete copies on multiple nodes."

**Q13: "What happens when epochs expire?"**

**Your Answer:**
> "When epochs expire, the blob becomes unavailable - nodes will no longer serve it. So we need to either: extend epochs before expiration, re-upload the content if still needed, or accept that old content expires (which could be intentional for time-limited content). For 'permanent' content, we'll use 100+ epochs and potentially implement automatic renewal."

**Q14: "Have you considered blob ID collisions?"**

**Your Answer:**
> "Walrus uses content-addressing, so the blob ID is derived from the content itself. If two users upload identical content, they get the same blob ID - this is deduplication, not a collision. True collisions (different content, same ID) are cryptographically impossible with the hash functions used. So this actually saves storage when multiple people upload the same image or boilerplate content."

### Category F: Security & Edge Cases

**Q15: "What if someone uploads malicious content?"**

**Your Answer:**
> "The Walrus upload itself is permissionless, but our CMS only displays content that's registered on-chain via our smart contract. Since only holders of AuthorCap NFTs can register content, we have a permission layer. Admins can revoke AuthorCaps to prevent future uploads. For existing malicious content, we can unpublish it on-chain (change is_published flag) so it doesn't appear in the CMS, even though the blob still exists on Walrus."

**Q16: "How do you handle GDPR 'right to be forgotten'?"**

**Your Answer:**
> "This is challenging with immutable storage. Our approach: We can mark content as unpublished on-chain, remove it from our CMS interface, and delete metadata. The blob on Walrus will eventually expire based on epochs. For immediate removal, we could implement a 'tombstone' record on-chain that tells clients not to fetch that blob ID. While the data technically exists on Walrus until expiration, it's effectively inaccessible through our CMS."

---

## 🎯 Your Elevator Pitch (30 seconds)

**When they ask: "Tell us about your project"**

> "We're building a fully decentralized CMS where content creators authenticate with their Sui wallet instead of passwords. The Sui blockchain handles permissions via NFTs and stores metadata like titles and authors. The actual content - blog posts, images, videos - all goes to Walrus storage. When a user creates content, we upload to Walrus to get a blob ID, then create a Sui transaction that stores that blob ID alongside metadata. For reading, we query Sui for the blob ID, fetch content from Walrus Aggregator, and render it client-side. The entire frontend is also hosted as a Walrus Site, so there are zero centralized components. It's essentially WordPress or Medium, but completely decentralized."

---

## 🎯 Your Technical Approach Summary (1 minute)

**When they ask: "How will you technically implement this?"**

> "Three main components: First, smart contracts on Sui written in Move that manage permissions via AuthorCap NFTs and store content metadata including Walrus blob IDs. Second, a React frontend that integrates Sui wallet for authentication and provides a rich text editor. When users create content, we upload to Walrus Publisher API, get the blob ID, then call our smart contract to register it. Third, for reading content, we query Sui for metadata, extract the blob ID, fetch from Walrus Aggregator, and render. The entire frontend will be deployed as a Walrus Site. We'll use erasure-coded storage for efficiency, support versioning through new blob IDs, and handle media files as separate blobs referenced in an array on-chain."

---

## 📝 Key Facts to Memorize

### Testnet Endpoints:
```
Publisher:  https://publisher.walrus-testnet.walrus.space
Aggregator: https://aggregator.walrus-testnet.walrus.space
```

### API Methods:
```
Upload:   PUT  /v1/store?epochs=100
Download: GET  /v1/{blob_id}
Check:    HEAD /v1/{blob_id}
```

### Key Concepts:
- **Erasure Coding**: Splits data + adds redundancy
- **Content-Addressed**: Same content = Same blob ID
- **Immutable**: Can't change blobs, create new ones
- **Epochs**: Storage duration periods
- **Blob ID**: Unique identifier for content
- **Publisher**: For uploads
- **Aggregator**: For downloads
- **Walrus Sites**: Static sites hosted on Walrus

---

## ✅ Confidence Checklist

**Before the call, can you confidently explain:**

- [ ] What Walrus is and how it works
- [ ] Erasure coding concept
- [ ] How to upload a blob (API call)
- [ ] How to retrieve a blob (API call)
- [ ] What blob IDs are and how they're generated
- [ ] What epochs mean
- [ ] How Walrus Sites work
- [ ] Your hybrid Sui + Walrus architecture
- [ ] Data flow for creating content
- [ ] Data flow for reading content
- [ ] How you'll handle content updates
- [ ] How you'll handle media files
- [ ] Your approach to versioning
- [ ] Your strategy for search/discovery
- [ ] Performance optimization plans
- [ ] Cost management strategy
- [ ] Security and access control
- [ ] Edge cases (GDPR, malicious content)

**If you can't confidently explain all of these, STUDY MORE!**

---

## 🎓 Quick Study Guide

### Study Priority 1 (CRITICAL):
1. Walrus architecture basics
2. Upload/download API calls
3. Your specific architecture design
4. Content creation flow
5. Content retrieval flow

### Study Priority 2 (IMPORTANT):
6. Erasure coding explanation
7. Blob IDs and content addressing
8. Epochs and storage duration
9. Walrus Sites deployment
10. Version management strategy

### Study Priority 3 (GOOD TO KNOW):
11. Cost calculations
12. Performance optimization
13. Security considerations
14. Edge case handling
15. Scale and reliability

---

## 🎤 Practice Questions

**Practice explaining these OUT LOUD before the call:**

1. "Explain Walrus in 30 seconds"
2. "How does erasure coding work?"
3. "Walk me through your architecture"
4. "How do you upload content?"
5. "How do you retrieve content?"
6. "What happens when users edit content?"
7. "How do you handle permissions?"
8. "What if Walrus is unavailable?"
9. "How much will this cost?"
10. "Can this scale?"

**Pro tip**: Record yourself answering these and play it back. Do you sound confident and knowledgeable?

---

## 💼 Professional Presentation Tips

### Do's:
✅ Be confident but not arrogant
✅ Admit if you don't know something specific
✅ Show you've done research
✅ Explain your technical approach clearly
✅ Demonstrate understanding of trade-offs
✅ Have diagrams/architecture ready to share
✅ Know the APIs and endpoints
✅ Understand the limitations
✅ Have realistic expectations

### Don'ts:
❌ Don't fake knowledge
❌ Don't ramble or go off-topic
❌ Don't make promises you can't keep
❌ Don't blame tools for your uncertainties
❌ Don't act like you've built it already (unless you have)
❌ Don't be defensive about gaps in knowledge
❌ Don't oversell capabilities
❌ Don't ignore their concerns

---

## 🎯 Success Criteria

**You'll pass this assessment if you can:**

1. ✅ Explain Walrus architecture clearly
2. ✅ Demonstrate API understanding
3. ✅ Articulate your technical approach
4. ✅ Show you've thought through challenges
5. ✅ Prove you can deliver the project
6. ✅ Answer technical questions confidently
7. ✅ Acknowledge limitations appropriately
8. ✅ Display realistic planning

**Red flags that will concern them:**
- ❌ Can't explain basic Walrus concepts
- ❌ No clear architecture plan
- ❌ Unrealistic expectations
- ❌ Haven't considered challenges
- ❌ Don't understand APIs
- ❌ Can't articulate approach

---

## 📞 Call Structure

### 1. Introduction (5 min)
**They ask**: "Tell us about yourself and your project"

**You say**: [Elevator pitch from above]

### 2. Technical Assessment (30 min)
**They ask**: Series of technical questions

**You answer**: Using knowledge from this document

### 3. Deep Dive (15 min)
**They probe**: Specific challenging aspects

**You explain**: Your solutions and trade-offs

### 4. Wrap-up (10 min)
**They decide**: Can you do this project?

**Outcome**: Approval, concerns, or rejection

---

## 🚀 Final Preparation

### Night Before:
1. Read this ENTIRE document
2. Practice answering key questions out loud
3. Review Walrus documentation
4. Prepare architecture diagram to share
5. Get good sleep!

### Day Of:
1. Review your elevator pitch
2. Have this document open during call
3. Have Walrus docs open (just in case)
4. Be ready to share screen (diagrams)
5. Stay calm and confident

---

## 🎯 TL;DR - You MUST Know

**Walrus Basics:**
- Decentralized blob storage with erasure coding
- Publisher API for uploads, Aggregator for downloads
- Content-addressed, immutable blobs
- Epoch-based storage duration

**Your Architecture:**
- Sui = metadata + permissions
- Walrus = content + media
- Hybrid approach for efficiency

**Technical Approach:**
- Upload to Walrus → get blob ID → store on Sui
- Query Sui → get blob ID → fetch from Walrus
- New blob per update (versioning)
- Frontend hosted as Walrus Site

**Key Challenge Solutions:**
- Updates: New blobs + version tracking
- Search: On-chain metadata indexing
- Media: Separate blobs in array
- Cost: Compression + appropriate epochs
- Performance: Caching + parallel fetching

---

**Good luck! Show them you know your stuff! 💪**

Remember: They want to see that you've done your homework, understand Walrus deeply, and have a solid technical plan. Be confident in what you know, honest about what you're still learning, and demonstrate that you can deliver this project!
