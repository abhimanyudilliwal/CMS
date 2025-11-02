/**
 * Sui CMS SDK
 * TypeScript/JavaScript SDK for interacting with the Decentralized CMS smart contracts
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// Network configuration
const NETWORK = import.meta.env.VITE_SUI_NETWORK || 'testnet';
const RPC_URL = import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

// Package ID (will be set after deployment)
const PACKAGE_ID = import.meta.env.VITE_CMS_PACKAGE_ID || '0x0';

/**
 * CMS SDK Class
 */
export class CMSClient {
  constructor(suiClient = null) {
    this.client = suiClient || new SuiClient({ url: RPC_URL });
    this.packageId = PACKAGE_ID;
  }

  /**
   * Set the package ID after deployment
   */
  setPackageId(packageId) {
    this.packageId = packageId;
  }

  /**
   * Get all content pages from the registry
   */
  async getContentRegistry(registryId) {
    try {
      const registry = await this.client.getObject({
        id: registryId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });
      return registry;
    } catch (error) {
      console.error('Error fetching content registry:', error);
      throw error;
    }
  }

  /**
   * Get content page details
   */
  async getContentPage(contentId) {
    try {
      const content = await this.client.getObject({
        id: contentId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });
      return content;
    } catch (error) {
      console.error('Error fetching content page:', error);
      throw error;
    }
  }

  /**
   * Get all content pages owned by an address
   */
  async getContentByOwner(ownerAddress) {
    try {
      const objects = await this.client.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${this.packageId}::content_registry::ContentPage`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });
      return objects.data;
    } catch (error) {
      console.error('Error fetching content by owner:', error);
      throw error;
    }
  }

  /**
   * Get author capabilities for an address
   */
  async getAuthorCap(ownerAddress) {
    try {
      const objects = await this.client.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${this.packageId}::content_registry::AuthorCap`,
        },
        options: {
          showContent: true,
        },
      });
      return objects.data.length > 0 ? objects.data[0] : null;
    } catch (error) {
      console.error('Error fetching author capability:', error);
      throw error;
    }
  }

  /**
   * Create a transaction to issue author capability
   */
  createIssueAuthorCapTx(platformId, recipientAddress) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::content_registry::issue_author_cap`,
      arguments: [
        tx.object(platformId),
        tx.pure.address(recipientAddress),
      ],
    });
    return tx;
  }

  /**
   * Create a transaction to create content
   */
  createContentTx(authorCapId, registryId, platformId, slug, title, walrusBlobId) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::content_registry::create_content`,
      arguments: [
        tx.object(authorCapId),
        tx.object(registryId),
        tx.object(platformId),
        tx.pure.string(slug),
        tx.pure.string(title),
        tx.pure.string(walrusBlobId),
      ],
    });
    return tx;
  }

  /**
   * Create a transaction to update content
   */
  updateContentTx(contentId, authorCapId, newWalrusBlobId, newTitle) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::content_registry::update_content`,
      arguments: [
        tx.object(contentId),
        tx.object(authorCapId),
        tx.pure.string(newWalrusBlobId),
        tx.pure.string(newTitle),
      ],
    });
    return tx;
  }

  /**
   * Create a transaction to add media
   */
  addMediaTx(contentId, authorCapId, mediaBlobId) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::content_registry::add_media`,
      arguments: [
        tx.object(contentId),
        tx.object(authorCapId),
        tx.pure.string(mediaBlobId),
      ],
    });
    return tx;
  }

  /**
   * Create a transaction to publish/unpublish content
   */
  setPublishStatusTx(contentId, authorCapId, isPublished) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::content_registry::set_publish_status`,
      arguments: [
        tx.object(contentId),
        tx.object(authorCapId),
        tx.pure.bool(isPublished),
      ],
    });
    return tx;
  }

  /**
   * Create a transaction to add an editor
   */
  addEditorTx(contentId, authorCapId, editorAddress) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::content_registry::add_editor`,
      arguments: [
        tx.object(contentId),
        tx.object(authorCapId),
        tx.pure.address(editorAddress),
      ],
    });
    return tx;
  }

  /**
   * Create a transaction to remove an editor
   */
  removeEditorTx(contentId, authorCapId, editorAddress) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::content_registry::remove_editor`,
      arguments: [
        tx.object(contentId),
        tx.object(authorCapId),
        tx.pure.address(editorAddress),
      ],
    });
    return tx;
  }

  /**
   * Query events for a specific content page
   */
  async getContentEvents(contentId) {
    try {
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${this.packageId}::content_registry::ContentUpdated`,
        },
        limit: 50,
      });
      return events.data.filter(e => e.parsedJson.content_id === contentId);
    } catch (error) {
      console.error('Error fetching content events:', error);
      throw error;
    }
  }

  /**
   * Get all published content (query via events)
   */
  async getPublishedContent() {
    try {
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${this.packageId}::content_registry::ContentCreated`,
        },
        limit: 100,
      });
      return events.data;
    } catch (error) {
      console.error('Error fetching published content:', error);
      throw error;
    }
  }
}

/**
 * Create a singleton instance
 */
export const cmsClient = new CMSClient();

export default CMSClient;
