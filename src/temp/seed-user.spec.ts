import { createConnection, getConnection } from 'typeorm';
import { User } from '../entity/user';
import { generateHash } from '../utilities/password.utility';
import { seedUser } from './seed-user';

describe('seed user', () => {
  beforeEach(() => {
    return createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [User],
      synchronize: true,
      logging: false
    });
  });
  afterEach(() => {
    const conn = getConnection();
    return conn.close();
  });
  test('seed user success', async () => {
    const user = new User();
    user.email = 'pentester@gmail.com';
    user.firstName = 'Master';
    user.lastName = 'Chief';
    user.title = 'Spartan117';
    user.password = '19rH@%6l13U1U5D!X2svsC3';
    const x = await seedUser(user);
    expect(x).toBeTruthy();
  });
  test('seed user failure password validation', async () => {
    const user = new User();
    user.email = 'pentester@gmail.com';
    user.firstName = 'Master';
    user.lastName = 'Chief';
    user.title = 'Spartan117';
    user.password = '123';
    const x = await seedUser(user);
    expect(x).toBeFalsy();
  });
  test('seed user failure user already exists', async () => {
    const existUser = new User();
    existUser.email = 'pentester@gmail.com';
    existUser.firstName = 'Master';
    existUser.lastName = 'Chief';
    existUser.title = 'Spartan117';
    existUser.password = await generateHash('19rH@%6l13U1U5D!X2svsC3');
    existUser.active = true;
    await getConnection().getRepository(User).insert(existUser);
    const user = new User();
    user.email = 'pentester@gmail.com';
    user.firstName = 'Master';
    user.lastName = 'Chief';
    user.title = 'Spartan117';
    user.password = '19rH@%6l13U1U5D!X2svsC3';
    user.active = true;
    const x = await seedUser(user);
    expect(x).toBeFalsy();
  });
});
