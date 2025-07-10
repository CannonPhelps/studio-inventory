import crypto from 'crypto';

export class EncryptionService {
  private static algorithm = 'aes-256-cbc';
  private static keyLength = 32; // 256 bits
  private static ivLength = 16; // 128 bits
  private static saltLength = 64; // 512 bits

  /**
   * Generate a secure encryption key from a password
   */
  private static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha512');
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string, password: string): string {
    try {
      // Generate salt and IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);

      // Derive key from password
      const key = this.deriveKey(password, salt);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Combine all components: salt + iv + encrypted
      const result = Buffer.concat([salt, iv, Buffer.from(encrypted, 'hex')]);
      
      return result.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string, password: string): string {
    try {
      // Convert from base64
      const data = Buffer.from(encryptedData, 'base64');

      // Extract components
      const salt = data.subarray(0, this.saltLength);
      const iv = data.subarray(this.saltLength, this.saltLength + this.ivLength);
      const encrypted = data.subarray(this.saltLength + this.ivLength);

      // Derive key from password
      const key = this.deriveKey(password, salt);

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

      // Decrypt data
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data (one-way encryption)
   */
  static hash(data: string, salt?: string): { hash: string; salt: string } {
    const generatedSalt = salt || crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(data, generatedSalt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt: generatedSalt };
  }

  /**
   * Verify hashed data
   */
  static verifyHash(data: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hash(data, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  }

  /**
   * Generate a secure random string
   */
  static generateSecureString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Encrypt object data
   */
  static encryptObject(obj: Record<string, unknown>, password: string): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString, password);
  }

  /**
   * Decrypt object data
   */
  static decryptObject(encryptedData: string, password: string): Record<string, unknown> {
    const jsonString = this.decrypt(encryptedData, password);
    return JSON.parse(jsonString);
  }
} 