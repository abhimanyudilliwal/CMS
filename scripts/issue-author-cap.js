#!/usr/bin/env node

/**
 * Script to issue AuthorCap to a user
 * Usage: node issue-author-cap.js <recipient-address>
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/sui/utils';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '../client/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const PACKAGE_ID = env.VITE_CMS_PACKAGE_ID;
const PLATFORM_ID = env.VITE_CMS_PLATFORM_ID;

// Initialize Sui client
const client = new SuiClient({ url: getFullnodeUrl('testnet') });

async function getKeypairFromConfig() {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const configPath = path.join(homeDir, '.sui', 'sui_config', 'sui.keystore');

  if (!fs.existsSync(configPath)) {
    throw new Error('Sui keystore not found. Please run: sui client');
  }

  const keystore = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  // Get active address
  const clientConfigPath = path.join(homeDir, '.sui', 'sui_config', 'client.yaml');
  const clientConfig = fs.readFileSync(clientConfigPath, 'utf-8');
  const activeAddressMatch = clientConfig.match(/active_address:\s*"?([^"\s]+)"?/);

  if (!activeAddressMatch) {
    throw new Error('No active address found in client config');
  }

  const activeAddress = activeAddressMatch[1];
  console.log(`Active address: ${activeAddress}`);

  // Find the key for active address
  for (const key of keystore) {
    const keypair = Ed25519Keypair.fromSecretKey(fromBase64(key).slice(1));
    const address = keypair.getPublicKey().toSuiAddress();

    if (address === activeAddress) {
      return keypair;
    }
  }

  throw new Error(`Key not found for active address: ${activeAddress}`);
}

async function issueAuthorCap(recipientAddress) {
  try {
    console.log('Loading keypair...');
    const keypair = await getKeypairFromConfig();
    const sender = keypair.getPublicKey().toSuiAddress();

    console.log(`Sender: ${sender}`);
    console.log(`Recipient: ${recipientAddress}`);
    console.log(`Package ID: ${PACKAGE_ID}`);
    console.log(`Platform ID: ${PLATFORM_ID}`);

    // Create transaction
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::content_registry::issue_author_cap`,
      arguments: [
        tx.object(PLATFORM_ID),
        tx.pure.address(recipientAddress),
      ],
    });

    // Set gas budget
    tx.setGasBudget(10000000);

    console.log('\nSigning and executing transaction...');

    // Sign and execute
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });

    console.log('\n✅ Transaction successful!');
    console.log(`Digest: ${result.digest}`);

    if (result.objectChanges) {
      const authorCap = result.objectChanges.find(
        obj => obj.type === 'created' && obj.objectType.includes('AuthorCap')
      );

      if (authorCap) {
        console.log(`\n🎫 AuthorCap created!`);
        console.log(`Object ID: ${authorCap.objectId}`);
        console.log(`Owner: ${authorCap.owner.AddressOwner || recipientAddress}`);
      }
    }

    console.log(`\nView on explorer: https://suiscan.xyz/testnet/tx/${result.digest}`);

    return result;
  } catch (error) {
    console.error('\n❌ Error issuing author cap:', error.message);
    throw error;
  }
}

// Main execution
const recipientAddress = process.argv[2] || process.env.RECIPIENT_ADDRESS;

if (!recipientAddress) {
  console.error('Usage: node issue-author-cap.js <recipient-address>');
  console.error('Or set RECIPIENT_ADDRESS environment variable');
  process.exit(1);
}

issueAuthorCap(recipientAddress)
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
