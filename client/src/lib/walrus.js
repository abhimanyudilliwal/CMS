/**
 * Walrus Storage Client
 * Handles blob storage and retrieval from Walrus decentralized storage
 */

// Walrus configuration
const WALRUS_PUBLISHER_URL = import.meta.env.VITE_WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space';
const WALRUS_AGGREGATOR_URL = import.meta.env.VITE_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';

/**
 * Upload content to Walrus storage
 * @param {Blob|File|string} content - Content to upload
 * @param {number} epochs - Number of epochs to store (default: 5)
 * @returns {Promise<{blobId: string, info: object}>} - Blob ID and storage info
 */
export async function uploadToWalrus(content, epochs = 5) {
  try {
    let blob;

    // Convert content to Blob if it's a string
    if (typeof content === 'string') {
      blob = new Blob([content], { type: 'text/plain' });
    } else {
      blob = content;
    }

    const response = await fetch(`${WALRUS_PUBLISHER_URL}/v1/store?epochs=${epochs}`, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': blob.type || 'application/octet-stream',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Walrus upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Walrus returns different response formats depending on if it's a new blob or existing
    if (result.newlyCreated) {
      return {
        blobId: result.newlyCreated.blobObject.blobId,
        info: result.newlyCreated,
      };
    } else if (result.alreadyCertified) {
      return {
        blobId: result.alreadyCertified.blobId,
        info: result.alreadyCertified,
      };
    } else {
      throw new Error('Unexpected Walrus response format');
    }
  } catch (error) {
    console.error('Error uploading to Walrus:', error);
    throw error;
  }
}

/**
 * Upload media file to Walrus
 * @param {File} file - Media file to upload
 * @param {number} epochs - Number of epochs to store
 * @returns {Promise<{blobId: string, fileName: string, fileType: string}>}
 */
export async function uploadMediaToWalrus(file, epochs = 5) {
  try {
    const result = await uploadToWalrus(file, epochs);
    return {
      blobId: result.blobId,
      fileName: file.name,
      fileType: file.type,
    };
  } catch (error) {
    console.error('Error uploading media to Walrus:', error);
    throw error;
  }
}

/**
 * Retrieve content from Walrus storage
 * @param {string} blobId - Blob ID to retrieve
 * @returns {Promise<string>} - Content as text
 */
export async function getFromWalrus(blobId) {
  try {
    const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/${blobId}`);

    if (!response.ok) {
      throw new Error(`Failed to retrieve from Walrus: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error retrieving from Walrus:', error);
    throw error;
  }
}

/**
 * Get Walrus blob URL for direct access (e.g., for images)
 * @param {string} blobId - Blob ID
 * @returns {string} - URL to access the blob
 */
export function getWalrusBlobUrl(blobId) {
  return `${WALRUS_AGGREGATOR_URL}/v1/${blobId}`;
}

/**
 * Upload JSON data to Walrus
 * @param {object} data - JSON data to upload
 * @param {number} epochs - Number of epochs to store
 * @returns {Promise<{blobId: string}>}
 */
export async function uploadJSONToWalrus(data, epochs = 5) {
  try {
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const result = await uploadToWalrus(blob, epochs);
    return { blobId: result.blobId };
  } catch (error) {
    console.error('Error uploading JSON to Walrus:', error);
    throw error;
  }
}

/**
 * Retrieve JSON data from Walrus
 * @param {string} blobId - Blob ID
 * @returns {Promise<object>} - Parsed JSON data
 */
export async function getJSONFromWalrus(blobId) {
  try {
    const text = await getFromWalrus(blobId);
    return JSON.parse(text);
  } catch (error) {
    console.error('Error retrieving JSON from Walrus:', error);
    throw error;
  }
}

/**
 * Check if a blob exists in Walrus
 * @param {string} blobId - Blob ID to check
 * @returns {Promise<boolean>}
 */
export async function blobExists(blobId) {
  try {
    const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/${blobId}`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export default {
  uploadToWalrus,
  uploadMediaToWalrus,
  getFromWalrus,
  getWalrusBlobUrl,
  uploadJSONToWalrus,
  getJSONFromWalrus,
  blobExists,
};
