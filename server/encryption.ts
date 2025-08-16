import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

// Get encryption key from environment or generate one
const MASTER_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  : crypto.randomBytes(KEY_LENGTH);

if (!process.env.ENCRYPTION_KEY) {
  console.warn('⚠️  No ENCRYPTION_KEY environment variable found. Using temporary key. Data will not persist across restarts.');
  console.warn('🔑 Generated key:', MASTER_KEY.toString('hex'));
}

// Data classification levels
export enum DataSensitivity {
  PUBLIC = 'public',           // Non-sensitive data (username, age ranges)
  PERSONAL = 'personal',       // Personal but not highly sensitive (bio, interests)
  SENSITIVE = 'sensitive',     // Sensitive personal data (location, photos)
  CONFIDENTIAL = 'confidential' // Highly sensitive (messages, private details)
}

// Encryption utilities
export interface EncryptedData {
  data: string;           // Base64 encoded encrypted data
  iv: string;            // Base64 encoded initialization vector
  tag: string;           // Base64 encoded authentication tag
  salt?: string;         // Base64 encoded salt (for key derivation)
  sensitivity: DataSensitivity;
}

/**
 * Derive encryption key from master key and salt
 */
function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(MASTER_KEY, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data with AES-256-GCM
 */
export function encryptData(
  plaintext: string, 
  sensitivity: DataSensitivity = DataSensitivity.PERSONAL
): EncryptedData {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipher('aes-256-gcm', key);
    cipher.setAAD(Buffer.from(sensitivity)); // Additional authenticated data
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    return {
      data: encrypted,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      salt: salt.toString('base64'),
      sensitivity
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: EncryptedData): string {
  try {
    const { data, iv, tag, salt, sensitivity } = encryptedData;
    
    if (!salt) {
      throw new Error('Salt is required for decryption');
    }
    
    const key = deriveKey(Buffer.from(salt, 'base64'));
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    decipher.setAAD(Buffer.from(sensitivity));
    
    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way, for search/indexing)
 */
export function hashSensitiveData(data: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(data, salt, 10000, 32, 'sha256');
  return salt.toString('base64') + ':' + hash.toString('base64');
}

/**
 * Verify hashed sensitive data
 */
export function verifySensitiveData(data: string, hash: string): boolean {
  try {
    const [saltB64, hashB64] = hash.split(':');
    const salt = Buffer.from(saltB64, 'base64');
    const expectedHash = crypto.pbkdf2Sync(data, salt, 10000, 32, 'sha256');
    const actualHash = Buffer.from(hashB64, 'base64');
    
    return crypto.timingSafeEqual(expectedHash, actualHash);
  } catch {
    return false;
  }
}

/**
 * Secure random token generation
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate cryptographically secure UUID
 */
export function generateSecureUUID(): string {
  return crypto.randomUUID();
}

/**
 * Personal data encryption helper
 */
export class PersonalDataEncryption {
  /**
   * Encrypt user bio with personal sensitivity
   */
  static encryptBio(bio: string): EncryptedData {
    return encryptData(bio, DataSensitivity.PERSONAL);
  }

  /**
   * Encrypt location data with sensitive classification
   */
  static encryptLocation(location: string): EncryptedData {
    return encryptData(location, DataSensitivity.SENSITIVE);
  }

  /**
   * Encrypt message content with confidential classification
   */
  static encryptMessage(message: string): EncryptedData {
    return encryptData(message, DataSensitivity.CONFIDENTIAL);
  }

  /**
   * Decrypt any encrypted data
   */
  static decryptData(encryptedData: EncryptedData): string {
    return decryptData(encryptedData);
  }

  /**
   * Encrypt phone number with sensitive classification
   */
  static encryptPhoneNumber(phone: string): EncryptedData {
    return encryptData(phone, DataSensitivity.SENSITIVE);
  }

  /**
   * Encrypt device IDs with personal classification
   */
  static encryptDeviceId(deviceId: string): EncryptedData {
    return encryptData(deviceId, DataSensitivity.PERSONAL);
  }
}

/**
 * Field-level encryption for database storage
 */
export class FieldEncryption {
  /**
   * Encrypt a field if it contains sensitive data
   */
  static encryptField(value: any, fieldName: string): any {
    if (value === null || value === undefined) return value;
    
    const sensitiveFields = new Set([
      'bio', 'phoneNumber', 'lastIpAddress', 'deviceIds', 
      'privacySettings', 'loginHistory', 'location'
    ]);
    
    const confidentialFields = new Set([
      'content', 'voiceUrl' // message content
    ]);

    if (confidentialFields.has(fieldName)) {
      return encryptData(String(value), DataSensitivity.CONFIDENTIAL);
    } else if (sensitiveFields.has(fieldName)) {
      return encryptData(String(value), DataSensitivity.SENSITIVE);
    }
    
    return value;
  }

  /**
   * Decrypt a field if it's encrypted
   */
  static decryptField(value: any, fieldName: string): any {
    if (value === null || value === undefined) return value;
    
    // Check if the value looks like encrypted data
    if (typeof value === 'object' && value.data && value.iv && value.tag) {
      try {
        return decryptData(value as EncryptedData);
      } catch (error) {
        console.error(`Failed to decrypt field ${fieldName}:`, error);
        return null;
      }
    }
    
    return value;
  }
}

/**
 * Data anonymization utilities
 */
export class DataAnonymization {
  /**
   * Anonymize email for logging (keep domain)
   */
  static anonymizeEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***.***';
    
    const anonymizedLocal = local.length > 2 
      ? local.substring(0, 2) + '*'.repeat(local.length - 2)
      : '**';
    
    return `${anonymizedLocal}@${domain}`;
  }

  /**
   * Anonymize phone number
   */
  static anonymizePhone(phone: string): string {
    if (phone.length < 4) return '***';
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
  }

  /**
   * Anonymize IP address
   */
  static anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.XXX.XXX`;
    }
    return 'XXX.XXX.XXX.XXX';
  }
}

/**
 * Secure data deletion
 */
export class SecureDataDeletion {
  /**
   * Securely overwrite sensitive data in memory
   */
  static secureDelete(buffer: Buffer): void {
    if (buffer && buffer.length > 0) {
      // Overwrite with random data multiple times
      for (let i = 0; i < 3; i++) {
        crypto.randomFillSync(buffer);
      }
      // Final overwrite with zeros
      buffer.fill(0);
    }
  }

  /**
   * Create a secure deletion marker for database
   */
  static createDeletionMarker(): string {
    return `[DELETED:${Date.now()}:${crypto.randomBytes(8).toString('hex')}]`;
  }
}

/**
 * Initialize encryption system
 */
export function initializeEncryption(): void {
  console.log('🔐 Initializing encryption system...');
  
  // Test encryption/decryption
  try {
    const testData = 'test-encryption-data';
    const encrypted = encryptData(testData, DataSensitivity.PERSONAL);
    const decrypted = decryptData(encrypted);
    
    if (decrypted !== testData) {
      throw new Error('Encryption test failed');
    }
    
    console.log('✅ Encryption system initialized successfully');
  } catch (error) {
    console.error('❌ Encryption system initialization failed:', error);
    throw error;
  }
}