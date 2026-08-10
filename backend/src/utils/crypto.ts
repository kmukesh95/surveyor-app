import crypto from 'crypto';
import { ENV } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommended for AES-GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts data object or text using AES-256-GCM
 */
export const encryptPayload = (payload: any): string => {
  try {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const key = Buffer.from(ENV.PAYLOAD_ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    
    // Package IV + AuthTag + Encrypted Text
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error: any) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypts AES-256-GCM encrypted payload back to original object
 */
export const decryptPayload = (encryptedText: string): any => {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format.');
    }

    const [ivHex, authTagHex, cipherHex] = parts;
    const key = Buffer.from(ENV.PAYLOAD_ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};
