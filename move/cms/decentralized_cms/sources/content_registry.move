/// Decentralized CMS Content Registry
/// Manages content metadata and permissions on-chain while content blobs live on Walrus
module decentralized_cms::content_registry {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::{Self, String};
    use std::vector;

    // ===== Errors =====
    const ENotAuthorized: u64 = 0;
    const ENotAdmin: u64 = 1;
    const EContentNotFound: u64 = 2;
    const EAlreadyEditor: u64 = 3;
    const ENotEditor: u64 = 4;

    // ===== Structs =====

    /// Main CMS platform object - stores global configuration
    public struct CMSPlatform has key {
        id: UID,
        admin: address,
        name: String,
        total_content_count: u64,
    }

    /// Author capability - NFT that grants authoring permissions
    public struct AuthorCap has key, store {
        id: UID,
        author_address: address,
        is_active: bool,
    }

    /// Content Page metadata stored on-chain
    public struct ContentPage has key, store {
        id: UID,
        slug: String,
        title: String,
        walrus_blob_id: String, // Walrus blob ID where actual content is stored
        media_blob_ids: vector<String>, // Array of Walrus blob IDs for media
        author: address,
        editors: vector<address>, // List of editors who can modify this content
        is_published: bool,
        created_at: u64,
        updated_at: u64,
        version: u64,
    }

    /// Shared object that maintains the content registry
    public struct ContentRegistry has key {
        id: UID,
        platform_id: ID,
        contents: vector<ID>, // List of all content page IDs
    }

    // ===== Events =====

    public struct ContentCreated has copy, drop {
        content_id: ID,
        slug: String,
        author: address,
        timestamp: u64,
    }

    public struct ContentUpdated has copy, drop {
        content_id: ID,
        updated_by: address,
        new_blob_id: String,
        version: u64,
        timestamp: u64,
    }

    public struct ContentPublished has copy, drop {
        content_id: ID,
        is_published: bool,
        timestamp: u64,
    }

    public struct EditorAdded has copy, drop {
        content_id: ID,
        editor: address,
        timestamp: u64,
    }

    public struct AuthorCapIssued has copy, drop {
        author: address,
        timestamp: u64,
    }

    // ===== Initialization =====

    /// Initialize the CMS platform (called once on deployment)
    fun init(ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);

        let platform = CMSPlatform {
            id: object::new(ctx),
            admin,
            name: string::utf8(b"Decentralized CMS"),
            total_content_count: 0,
        };

        let platform_id = object::id(&platform);

        let registry = ContentRegistry {
            id: object::new(ctx),
            platform_id,
            contents: vector::empty(),
        };

        // Transfer platform to admin
        transfer::transfer(platform, admin);

        // Make registry a shared object so anyone can read
        transfer::share_object(registry);
    }

    // ===== Admin Functions =====

    /// Issue an author capability to a new author
    public entry fun issue_author_cap(
        platform: &mut CMSPlatform,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == platform.admin, ENotAdmin);

        let author_cap = AuthorCap {
            id: object::new(ctx),
            author_address: recipient,
            is_active: true,
        };

        event::emit(AuthorCapIssued {
            author: recipient,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        transfer::transfer(author_cap, recipient);
    }

    /// Deactivate an author capability
    public entry fun deactivate_author(
        platform: &CMSPlatform,
        author_cap: &mut AuthorCap,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == platform.admin, ENotAdmin);
        author_cap.is_active = false;
    }

    /// Activate an author capability
    public entry fun activate_author(
        platform: &CMSPlatform,
        author_cap: &mut AuthorCap,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == platform.admin, ENotAdmin);
        author_cap.is_active = true;
    }

    // ===== Author Functions =====

    /// Create a new content page (stores metadata on-chain, content on Walrus)
    public entry fun create_content(
        _author_cap: &AuthorCap,
        registry: &mut ContentRegistry,
        platform: &mut CMSPlatform,
        slug: vector<u8>,
        title: vector<u8>,
        walrus_blob_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(_author_cap.is_active, ENotAuthorized);

        let author = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);

        let content = ContentPage {
            id: object::new(ctx),
            slug: string::utf8(slug),
            title: string::utf8(title),
            walrus_blob_id: string::utf8(walrus_blob_id),
            media_blob_ids: vector::empty(),
            author,
            editors: vector::empty(),
            is_published: false,
            created_at: timestamp,
            updated_at: timestamp,
            version: 1,
        };

        let content_id = object::id(&content);

        event::emit(ContentCreated {
            content_id,
            slug: string::utf8(slug),
            author,
            timestamp,
        });

        // Add to registry
        vector::push_back(&mut registry.contents, content_id);
        platform.total_content_count = platform.total_content_count + 1;

        // Transfer content ownership to author
        transfer::transfer(content, author);
    }

    /// Update content (updates Walrus blob ID and increments version)
    public entry fun update_content(
        content: &mut ContentPage,
        _author_cap: &AuthorCap,
        new_walrus_blob_id: vector<u8>,
        new_title: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Check if sender is author or an editor
        assert!(
            sender == content.author || vector::contains(&content.editors, &sender),
            ENotAuthorized
        );
        assert!(_author_cap.is_active, ENotAuthorized);

        content.walrus_blob_id = string::utf8(new_walrus_blob_id);
        content.title = string::utf8(new_title);
        content.updated_at = tx_context::epoch_timestamp_ms(ctx);
        content.version = content.version + 1;

        event::emit(ContentUpdated {
            content_id: object::id(content),
            updated_by: sender,
            new_blob_id: string::utf8(new_walrus_blob_id),
            version: content.version,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Add media to content (Walrus blob IDs)
    public entry fun add_media(
        content: &mut ContentPage,
        _author_cap: &AuthorCap,
        media_blob_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(
            sender == content.author || vector::contains(&content.editors, &sender),
            ENotAuthorized
        );
        assert!(_author_cap.is_active, ENotAuthorized);

        vector::push_back(&mut content.media_blob_ids, string::utf8(media_blob_id));
        content.updated_at = tx_context::epoch_timestamp_ms(ctx);
    }

    /// Publish or unpublish content
    public entry fun set_publish_status(
        content: &mut ContentPage,
        _author_cap: &AuthorCap,
        is_published: bool,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == content.author, ENotAuthorized);
        assert!(_author_cap.is_active, ENotAuthorized);

        content.is_published = is_published;
        content.updated_at = tx_context::epoch_timestamp_ms(ctx);

        event::emit(ContentPublished {
            content_id: object::id(content),
            is_published,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Add an editor to content
    public entry fun add_editor(
        content: &mut ContentPage,
        _author_cap: &AuthorCap,
        editor: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == content.author, ENotAuthorized);
        assert!(_author_cap.is_active, ENotAuthorized);
        assert!(!vector::contains(&content.editors, &editor), EAlreadyEditor);

        vector::push_back(&mut content.editors, editor);

        event::emit(EditorAdded {
            content_id: object::id(content),
            editor,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Remove an editor from content
    public entry fun remove_editor(
        content: &mut ContentPage,
        _author_cap: &AuthorCap,
        editor: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == content.author, ENotAuthorized);
        assert!(_author_cap.is_active, ENotAuthorized);

        let (contains, idx) = vector::index_of(&content.editors, &editor);
        assert!(contains, ENotEditor);

        vector::remove(&mut content.editors, idx);
    }

    // ===== Public Getters =====

    /// Get content slug
    public fun get_slug(content: &ContentPage): String {
        content.slug
    }

    /// Get content title
    public fun get_title(content: &ContentPage): String {
        content.title
    }

    /// Get Walrus blob ID for content
    public fun get_blob_id(content: &ContentPage): String {
        content.walrus_blob_id
    }

    /// Get content author
    public fun get_author(content: &ContentPage): address {
        content.author
    }

    /// Check if content is published
    public fun is_published(content: &ContentPage): bool {
        content.is_published
    }

    /// Get content version
    public fun get_version(content: &ContentPage): u64 {
        content.version
    }

    // ===== Test Functions =====

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }
}
