import { describe, it, expect } from 'vitest';
import { validateEmail, isGmail } from '../zkEmailSimulation';

describe('validateEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(validateEmail('test@gmail.com')).toBe(true);
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user @domain.com')).toBe(false);
  });
});

describe('isGmail', () => {
  it('should return true for Gmail addresses', () => {
    expect(isGmail('test@gmail.com')).toBe(true);
    expect(isGmail('TEST@GMAIL.COM')).toBe(true);
    expect(isGmail('user.name@gmail.com')).toBe(true);
  });

  it('should return false for non-Gmail addresses', () => {
    expect(isGmail('test@yahoo.com')).toBe(false);
    expect(isGmail('test@hotmail.com')).toBe(false);
    expect(isGmail('test@company.org')).toBe(false);
  });
});
