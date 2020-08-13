import { encrypt, decrypt } from './crypto.utility';

describe('crypto utility', () => {
  test('decrypt', () => {
    const str = encrypt('password');
    expect(decrypt(str)).toBe('password');
  });
});
