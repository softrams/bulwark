import * as crypto from 'crypto';

// Check for required environment variables
if (!process.env.CRYPTO_SECRET || !process.env.CRYPTO_SALT) {
  console.error('CRYPTO_SECRET and CRYPTO_SALT environment variables must be set!');
}

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(
  process.env.CRYPTO_SECRET || 'default-secret-key-for-dev-only', 
  process.env.CRYPTO_SALT || 'default-salt-for-dev-only', 
  32
);

/**
 * @description Encrypt text using AES-256-CBC
 * @param {string} text - The text to encrypt
 * @returns {string} - JSON stringified object with IV and encrypted data
 */
export const encrypt = (text: string): string => {
  try {
    // Generate a random 16-byte initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return IV and encrypted data
    return JSON.stringify({ 
      iv: iv.toString('hex'), 
      encryptedData: encrypted.toString('hex') 
    });
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * @description Decrypt text that was encrypted with encrypt()
 * @param {string} text - JSON stringified object with IV and encrypted data
 * @returns {string} - The decrypted text
 */
export const decrypt = (text: string): string => {
  try {
    // Parse the JSON string
    const parsedText = JSON.parse(text);
    
    // Convert hex strings to buffers
    const iv = Buffer.from(parsedText.iv, 'hex');
    const encryptedText = Buffer.from(parsedText.encryptedData, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    
    // Decrypt the text
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};