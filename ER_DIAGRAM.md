# Decentralized CMS - Entity Relationship Diagram

## System Architecture Overview

This decentralized CMS uses a **hybrid storage model**:
- **On-chain (Sui Blockchain)**: Metadata, permissions, relationships
- **Off-chain (Walrus Storage)**: Content blobs, media files

---

## ER Diagram - Sui Blockchain Layer

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUI BLOCKCHAIN ENTITIES                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   CMSPlatform        │ (Owned Object)
├──────────────────────┤
│ PK: id (UID)         │
│ admin (address)      │◄────────────┐
│ name (String)        │             │ Owns
│ total_content_count  │             │
└──────────────────────┘             │
                                     │
                    ┌────────────────┴────────────┐
                    │                             │
                    │                             │
        ┌───────────▼───────────┐    ┌───────────▼────────────┐
        │  ContentRegistry      │    │   User/Wallet          │
        │  (Shared Object)      │    │   (External)           │
        ├───────────────────────┤    ├────────────────────────┤
        │ PK: id (UID)          │    │ PK: address (0x...)    │
        │ platform_id (ID)      │───►│                        │
        │ contents (vector<ID>) │    │ Type: Blockchain Addr  │
        └───────┬───────────────┘    └────────┬───────────────┘
                │                              │
                │ Contains                     │ Owns
                │ (1:N)                        │ (1:1)
                │                              │
                ▼                              ▼
        ┌───────────────────────┐    ┌─────────────────────────┐
        │   ContentPage         │    │   AuthorCap (NFT)       │
        │   (Owned Object)      │    │   (Owned Object)        │
        ├───────────────────────┤    ├─────────────────────────┤
        │ PK: id (UID)          │    │ PK: id (UID)            │
        │ slug (String)         │    │ author_address (address)│───┐
        │ title (String)        │    │ is_active (bool)        │   │
        │ walrus_blob_id (Str)  │──┐ └─────────────────────────┘   │
        │ media_blob_ids (vec)  │  │                               │
        │ author (address) ─────┼──┼───────────────────────────────┘
        │ editors (vec<address>)│  │                         Grants
        │ is_published (bool)   │  │                         Permission
        │ created_at (u64)      │  │
        │ updated_at (u64)      │  │ Points to
        │ version (u64)         │  │ Walrus Blob
        └───────────────────────┘  │
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WALRUS STORAGE LAYER                                │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────────┐
                        │   Walrus Blob        │
                        │   (Off-chain)        │
                        ├──────────────────────┤
                        │ PK: blob_id (String) │
                        │ content (Binary)     │
                        │ size (bytes)         │
                        │ content_type (MIME)  │
                        │ epochs (u64)         │
                        │ replicas (multiple)  │
                        └──────────────────────┘
```

---

## Detailed Entity Descriptions

### 1. CMSPlatform (Owned Object)

**Type**: Sui Object (Owned by Admin)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UID | Primary key, unique object identifier |
| `admin` | address | Blockchain address of the platform administrator |
| `name` | String | Platform name (e.g., "Decentralized CMS") |
| `total_content_count` | u64 | Counter for total content pieces created |

**Relationships**:
- 1:1 with Admin (User/Wallet) - The admin owns this object
- 1:1 with ContentRegistry - Created together during deployment

**Access Control**:
- Only admin can issue AuthorCap NFTs
- Only admin can activate/deactivate authors

---

### 2. ContentRegistry (Shared Object)

**Type**: Sui Shared Object (Accessible by all)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UID | Primary key, unique object identifier |
| `platform_id` | ID | Foreign key to CMSPlatform |
| `contents` | vector<ID> | Array of all ContentPage IDs |

**Relationships**:
- N:1 with CMSPlatform - Belongs to one platform
- 1:N with ContentPage - Contains many content pages

**Purpose**:
- Central registry of all content
- Allows querying all content without knowing individual IDs
- Shared object = anyone can read, but only contract can modify

---

### 3. User/Wallet (External Entity)

**Type**: Blockchain Address (Not stored, external)

| Field | Type | Description |
|-------|------|-------------|
| `address` | address | Sui blockchain address (0x...) |

**Relationships**:
- 1:1 with AuthorCap - Can own one AuthorCap NFT
- 1:N with ContentPage - Can own multiple content pages
- 1:N with ContentPage (as editor) - Can be editor on multiple pages

**Roles**:
- **Admin**: Owns CMSPlatform, issues AuthorCaps
- **Author**: Owns AuthorCap, creates content
- **Editor**: Added to ContentPage.editors array
- **Viewer**: No special permissions, just reads published content

---

### 4. AuthorCap (NFT - Owned Object)

**Type**: Sui Object (NFT - Owned by Author)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UID | Primary key, unique NFT identifier |
| `author_address` | address | Address of the author who owns this NFT |
| `is_active` | bool | Whether this author is currently active |

**Relationships**:
- 1:1 with User/Wallet - Owned by one author
- Grants permissions to create/edit content

**Purpose**:
- Acts as a permission token (NFT)
- Required to call author functions
- Transferable (can be sold/transferred)
- Revocable (admin can deactivate)

**Lifecycle**:
1. Admin issues AuthorCap to user address
2. User owns AuthorCap NFT in their wallet
3. User passes AuthorCap as parameter to create/edit content
4. Admin can deactivate (but not delete) AuthorCap

---

### 5. ContentPage (Owned Object)

**Type**: Sui Object (Owned by Author)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UID | Primary key, unique content identifier |
| `slug` | String | URL-friendly identifier (e.g., "my-first-post") |
| `title` | String | Content title |
| `walrus_blob_id` | String | **Foreign key** to Walrus blob (content) |
| `media_blob_ids` | vector<String> | Array of Walrus blob IDs (images/videos) |
| `author` | address | Author's blockchain address (owner) |
| `editors` | vector<address> | List of addresses who can edit |
| `is_published` | bool | Publication status |
| `created_at` | u64 | Timestamp (milliseconds) |
| `updated_at` | u64 | Last update timestamp |
| `version` | u64 | Version number (increments on update) |

**Relationships**:
- N:1 with User/Wallet (author) - Created and owned by one author
- N:1 with ContentRegistry - Listed in registry
- N:N with User/Wallet (editors) - Multiple editors can edit
- 1:1 with Walrus Blob (content) - Points to one main content blob
- 1:N with Walrus Blob (media) - Points to multiple media blobs

**Constraints**:
- `slug` should be unique (enforced by application logic)
- `author` is immutable (set at creation)
- `version` auto-increments on each update
- `walrus_blob_id` changes with each content update

---

### 6. Walrus Blob (Off-chain Storage)

**Type**: Decentralized Storage Object (Walrus)

| Field | Type | Description |
|-------|------|-------------|
| `blob_id` | String | Primary key, unique blob identifier (hash) |
| `content` | Binary | Actual file/content data |
| `size` | u64 | Size in bytes |
| `content_type` | String | MIME type (text/plain, image/jpeg, etc.) |
| `epochs` | u64 | Number of epochs to store |
| `replicas` | N/A | Multiple redundant copies (Walrus handles) |

**Relationships**:
- 1:1 with ContentPage (main content) - Referenced by `walrus_blob_id`
- 1:N with ContentPage (media) - Referenced by `media_blob_ids[]`

**Storage Types**:
1. **Content Blobs**: Blog posts, articles (text/markdown)
2. **Media Blobs**: Images, videos, documents

**Access**:
- Upload: Via Walrus Publisher API
- Download: Via Walrus Aggregator API
- URL: `https://aggregator.walrus-testnet.walrus.space/v1/{blob_id}`

---

## Relationship Cardinalities

```
CMSPlatform (1) ──owns──> (1) Admin Address
CMSPlatform (1) ──has──> (1) ContentRegistry
ContentRegistry (1) ──contains──> (N) ContentPage

Admin Address (1) ──issues──> (N) AuthorCap
Author Address (1) ──owns──> (1) AuthorCap
Author Address (1) ──creates──> (N) ContentPage

ContentPage (N) ──owned_by──> (1) Author Address
ContentPage (N) ──editable_by──> (N) Editor Addresses
ContentPage (1) ──points_to──> (1) Walrus Blob (content)
ContentPage (1) ──includes──> (N) Walrus Blob (media)
```

---

## Data Flow Diagrams

### Creating Content

```
┌─────────┐         ┌──────────┐         ┌─────────┐         ┌─────────────┐
│ Author  │────1───>│ Upload   │────2───>│ Walrus  │────3───>│ Returns     │
│         │  Write  │ Content  │  Store  │ Storage │ blob_id │ blob_id     │
└─────────┘  post   └──────────┘         └─────────┘         └──────┬──────┘
                                                                     │
                                                                     │
     ┌───────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────┐         ┌──────────┐         ┌─────────┐         ┌─────────────┐
│ Author  │────4───>│ Create   │────5───>│   Sui   │────6───>│ ContentPage │
│         │  Call   │ Content  │  Store  │Blockchain  Create  │   Object    │
└─────────┘  fn()   │  TX      │         └─────────┘         └─────────────┘
             with    └──────────┘
             blob_id   + AuthorCap
```

### Reading Content

```
┌─────────┐         ┌──────────┐         ┌─────────┐         ┌─────────────┐
│ Viewer  │────1───>│ Query    │────2───>│   Sui   │────3───>│ ContentPage │
│         │  Get    │ Content  │  Read   │Blockchain  Return  │  Metadata   │
└─────────┘  by ID  └──────────┘         └─────────┘         └──────┬──────┘
                                                                     │
                                                                     │
     ┌───────────────────────────────────────────────────────────────┘
     │ Extract blob_id
     ▼
┌─────────┐         ┌──────────┐         ┌─────────┐         ┌─────────────┐
│ Viewer  │◄───6───│ Returns  │◄───5───│ Walrus  │◄───4───│ Fetch blob  │
│         │  Show  │ Content  │  Blob   │Aggregator  Get   │   content   │
└─────────┘  post  └──────────┘         └─────────┘         └─────────────┘
```

---

## Database Schema Comparison

### Traditional CMS (MongoDB)

```sql
Users
- _id (ObjectId)
- email (String)
- password (Hash)
- role (admin/author)
- active (Boolean)

Content
- _id (ObjectId)
- title (String)
- slug (String)
- content (Text)          ← Stored in DB
- author (ObjectId) → Users
- editors (Array<ObjectId>)
- published (Boolean)
- createdAt (Date)
- updatedAt (Date)

Media
- _id (ObjectId)
- filename (String)
- url (String)            ← Stored in S3/CDN
- contentId (ObjectId) → Content
```

### Decentralized CMS (Sui + Walrus)

```move
// On-chain (Sui)
CMSPlatform {
  id: UID,
  admin: address,
  name: String,
  total_content_count: u64
}

AuthorCap {                  ← NFT replaces Users table
  id: UID,
  author_address: address,
  is_active: bool
}

ContentPage {
  id: UID,
  title: String,
  slug: String,
  walrus_blob_id: String,   ← Points to Walrus
  media_blob_ids: vector<String>,
  author: address,
  editors: vector<address>,
  is_published: bool,
  version: u64
}

// Off-chain (Walrus)
Blob {
  blob_id: String,
  content: Binary           ← Actual content stored here
}
```

---

## Access Control Matrix

| Role | CMSPlatform | ContentRegistry | AuthorCap | ContentPage | Walrus Blob |
|------|-------------|-----------------|-----------|-------------|-------------|
| **Admin** | Own/Modify | Read | Issue/Revoke | Read | Read |
| **Author** | Read | Read | Own | Create/Own/Edit Own | Upload/Read |
| **Editor** | Read | Read | None | Edit Assigned | Upload/Read |
| **Viewer** | Read | Read | None | Read Published | Read |

---

## Event Schema

The smart contract emits events for tracking:

### ContentCreated
```
{
  content_id: ID,
  slug: String,
  author: address,
  timestamp: u64
}
```

### ContentUpdated
```
{
  content_id: ID,
  updated_by: address,
  new_blob_id: String,
  version: u64,
  timestamp: u64
}
```

### ContentPublished
```
{
  content_id: ID,
  is_published: bool,
  timestamp: u64
}
```

### EditorAdded
```
{
  content_id: ID,
  editor: address,
  timestamp: u64
}
```

### AuthorCapIssued
```
{
  author: address,
  timestamp: u64
}
```

---

## Storage Cost Comparison

### Traditional Database
```
Content Record (1KB) = Stored in DB
- Database storage cost: ~$0.10/GB/month
- CDN transfer cost: ~$0.08/GB
```

### Decentralized Storage
```
Content Metadata (200 bytes) = Stored on Sui
- Gas cost: ~0.01 SUI (~$0.01) one-time

Content Blob (1KB) = Stored on Walrus
- Storage cost: ~0.001 SUI/epoch (~$0.001)
- 100 epochs (1 year) = ~$0.10 total
- Retrieval: Free (decentralized CDN)
```

---

## Summary

### Entities (On-chain - Sui)
1. **CMSPlatform** - Platform configuration (1 per deployment)
2. **ContentRegistry** - Content index (1 per platform, shared)
3. **AuthorCap** - Permission NFT (N per author)
4. **ContentPage** - Content metadata (N per content)
5. **User/Wallet** - Blockchain addresses (external)

### Entities (Off-chain - Walrus)
6. **Walrus Blob** - Actual content/media (N per content)

### Key Relationships
- Admin **owns** CMSPlatform
- Admin **issues** AuthorCap to Authors
- Authors **create** ContentPage
- ContentPage **points to** Walrus Blobs
- Editors **can modify** ContentPage (if in editors list)

### Data Split
- **On-chain**: Identity, permissions, relationships, metadata
- **Off-chain**: Large content, media files, binary data

This hybrid model provides:
✅ Decentralization (no central server)
✅ Cost efficiency (large data off-chain)
✅ Security (permissions on blockchain)
✅ Immutability (blockchain audit trail)
✅ Performance (CDN-like Walrus delivery)

---

**Generated for**: Decentralized CMS v1.0
**Last Updated**: 2025-11-02
