import { generateHash, updatePassword, compare } from './password.utility';

describe('password utility', () => {
  test('generateHash to work', async () => {
    const password = 'qwerty';
    const hashedPassword = await generateHash(password);
    expect(hashedPassword).toBeDefined();
  });

  test('compare hash success', async (done) => {
    const oldPassword = await generateHash('qwerty');
    const currentPassword = 'qwerty';
    await expect(compare(currentPassword, oldPassword)).resolves.toBeTruthy();
    done();
  });

  test('compare hash failure', async (done) => {
    const oldPassword = await generateHash('qwerty');
    const currentPassword = 'qwerty2';
    await expect(compare(currentPassword, oldPassword)).resolves.toBeFalsy();
    done();
  });

  test('compare hash bcrypt failure', async (done) => {
    await expect(compare(null, 0)).rejects.toBe('Bcrypt comparison failure');
    done();
  });

  test('password updated successfully', async () => {
    const currentPassword = 'qwerty';
    const oldPassword = await generateHash(currentPassword);
    const newPassword = 'newQwerty';
    const result = await updatePassword(oldPassword, currentPassword, newPassword);
    expect(result).toEqual(expect.anything());
  });

  test('password updated failure', async (done) => {
    const currentPassword = 'qwerty2';
    const oldPassword = await generateHash('1234');
    const newPassword = 'newQwerty';
    await expect(updatePassword(oldPassword, currentPassword, newPassword)).rejects.toBe('Incorrect previous password');
    done();
  });
});
