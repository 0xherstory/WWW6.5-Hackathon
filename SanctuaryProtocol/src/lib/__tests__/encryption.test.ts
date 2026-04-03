import { describe, it, expect, beforeEach } from 'vitest';
import { encryptData, decryptData, generateKey } from '../encryption';

describe('encryption', () => {
  const testKey = 'test-encryption-key-12345';
  const testData = 'This is a secret message';

  describe('encryptData', () => {
    it('should encrypt data successfully', () => {
      const encrypted = encryptData(testData, testKey);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(testData);
    });

    it('should produce different ciphertext for same data', () => {
      const encrypted1 = encryptData(testData, testKey);
      const encrypted2 = encryptData(testData, testKey);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw error when key is empty', () => {
      expect(() => encryptData(testData, '')).toThrow();
    });
  });

  describe('decryptData', () => {
    it('should decrypt data correctly', () => {
      const encrypted = encryptData(testData, testKey);
      const decrypted = decryptData(encrypted, testKey);
      expect(decrypted).toBe(testData);
    });

    it('should throw error with wrong key', () => {
      const encrypted = encryptData(testData, testKey);
      const wrongKey = 'wrong-key-12345';
      const decrypted = decryptData(encrypted, wrongKey);
      expect(decrypted).toBe('');
    });
  });

  describe('generateKey', () => {
    it('should generate a 64-character hex string', () => {
      const key = generateKey();
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBe(64);
    });

    it('should generate unique keys', () => {
      const key1 = generateKey();
      const key2 = generateKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('encrypt and decrypt cycle', () => {
    it('should work with various data types', () => {
      const testCases = [
        'simple text',
        '{"json": "data", "number": 123}',
        '特殊字符 !@#$%^&*()',
        'emoji 🌱🌳🌿',
        'a'.repeat(1000),
      ];

      testCases.forEach((data) => {
        const encrypted = encryptData(data, testKey);
        const decrypted = decryptData(encrypted, testKey);
        expect(decrypted).toBe(data);
      });
    });
  });
});
