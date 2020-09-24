import { createConnection, getConnection, Entity, getRepository } from 'typeorm';
const userController = require('./user.controller');
import { User } from '../entity/user';
import { v4 as uuidv4 } from 'uuid';
import { generateHash } from '../utilities/password.utility';
import { Config } from '../entity/Config';
describe('User Controller', () => {
  // Mocks the Request Object that is returned
  const mockRequest = () => {
    const req = {
      body: {},
      user: Function
    };
    req.user = jest.fn().mockReturnValue(req);
    return req;
  };
  // Mocks the Response Object that is returned
  const mockResponse = () => {
    const res = {
      status: Function,
      json: Function
    };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  beforeEach(() => {
    return createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [User, Config],
      synchronize: true,
      logging: false
    });
  });

  afterEach(() => {
    const conn = getConnection();
    return conn.close();
  });
  test('invite user fail', async () => {
    const config = new Config();
    config.fromEmail = 'testingDude@jest.com';
    config.companyName = 'Test';
    config.fromEmailPassword = null;
    config.id = 1;
    await getConnection().getRepository(Config).insert(config);
    const req = mockRequest();
    req.body = {
      email: 'testing@jest.com'
    };
    const res = mockResponse();
    await userController.invite(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('invite user failure missing email', async () => {
    const config = new Config();
    config.fromEmail = 'testingDude@jest.com';
    config.companyName = 'Test';
    config.fromEmailPassword = null;
    config.id = 1;
    await getConnection().getRepository(Config).insert(config);
    const req = mockRequest();
    req.body = {};
    const res = mockResponse();
    await userController.invite(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('invite user failure user already exists', async () => {
    const config = new Config();
    config.fromEmail = 'testingDude@jest.com';
    config.companyName = 'Test';
    config.fromEmailPassword = null;
    config.id = 1;
    await getConnection().getRepository(Config).insert(config);
    const req = mockRequest();
    req.body = {
      email: 'testing@jest.com'
    };
    const res = mockResponse();
    const existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = true;
    await getConnection().getRepository(User).insert(existUser);
    await userController.invite(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('register user failure missing first name', async () => {
    const req = mockRequest();
    req.body = {
      email: 'testing@jest.com',
      title: 'Spartan 117',
      lastName: 'Chief',
      password: 'notSecure123'
    };
    const res = mockResponse();
    await userController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('register user failure missing last name', async () => {
    const req = mockRequest();
    req.body = {
      email: 'testing@jest.com',
      title: 'Spartan 117',
      firstName: 'Master',
      password: 'notSecure123'
    };
    const res = mockResponse();
    await userController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('register user failure missing title', async () => {
    const req = mockRequest();
    req.body = {
      email: 'testing@jest.com',
      lastName: 'Chief',
      firstName: 'Master',
      password: 'notSecure123'
    };
    const res = mockResponse();
    await userController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('register user failure passwords do not match', async () => {
    const req = mockRequest();
    req.body = {
      email: 'testing@jest.com',
      lastName: 'Chief',
      firstName: 'Master',
      password: 'notSecure123',
      confirmPassword: 'notSecureAbc',
      title: 'Spartan 117'
    };
    const res = mockResponse();
    await userController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('register user failure password validation', async () => {
    const req = mockRequest();
    req.body = {
      email: 'testing@jest.com',
      lastName: 'Chief',
      firstName: 'Master',
      password: '123',
      confirmPassword: '123',
      title: 'Spartan 117'
    };
    const res = mockResponse();
    await userController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('register user success', async () => {
    const config = new Config();
    config.fromEmail = 'testingDude@jest.com';
    config.companyName = 'Test';
    config.fromEmailPassword = null;
    config.id = 1;
    const user = new User();
    user.active = false;
    user.uuid = uuidv4();
    user.email = 'testing@jest.com';
    await getConnection().getRepository(User).save(user);
    await getConnection().getRepository(Config).insert(config);
    const req = mockRequest();
    const invReq = mockRequest();
    invReq.body = {
      email: 'testing@jest.com'
    };
    const res = mockResponse();
    await userController.invite(invReq, res);
    const invUser = await getConnection()
      .getRepository(User)
      .find({ where: { email: 'testing@jest.com' } });
    req.body = {
      email: invUser[0].email,
      lastName: 'Chief',
      firstName: 'Master',
      password: '&3x1GqpeFO61*HJ',
      confirmPassword: '&3x1GqpeFO61*HJ',
      title: 'Spartan 117',
      uuid: invUser[0].uuid
    };
    await userController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test('verify user failure no uuid', async () => {
    const mRequest = () => {
      const req = {
        params: {},
        user: Function
      };
      req.user = jest.fn().mockReturnValue(req);
      return req;
    };
    const vReq = mRequest();
    const res = mockResponse();
    vReq.params = {};
    await userController.verify(vReq, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('verify user success', async () => {
    const res = mockResponse();
    const mRequest = () => {
      const r = {
        params: {},
        user: Function
      };
      r.user = jest.fn().mockReturnValue(r);
      return r;
    };
    const existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = false;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    await getConnection().getRepository(User).insert(existUser);
    const verifyReq = mRequest();
    verifyReq.params = {
      uuid
    };
    await userController.verify(verifyReq, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test('verify user failure user does not exist', async () => {
    const res = mockResponse();
    const mRequest = () => {
      const r = {
        params: {},
        user: Function
      };
      r.user = jest.fn().mockReturnValue(r);
      return r;
    };
    const existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = false;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    await getConnection().getRepository(User).insert(existUser);
    const verifyReq = mRequest();
    const uuid2 = uuidv4();
    verifyReq.params = {
      uuid: uuid2
    };
    await userController.verify(verifyReq, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('Update user password failure passwords do not match', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = {
      oldPassword: 'fakePassword',
      newPassword: 'fakePassword2',
      confirmNewPassword: 'fakePasswordDifferent'
    };
    await userController.updateUserPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('Update user password failure same password', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = {
      oldPassword: 'fakePassword',
      newPassword: 'fakePassword',
      confirmNewPassword: 'fakePassword'
    };
    await userController.updateUserPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('Update user password failure password validation', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = {
      oldPassword: '123',
      newPassword: '234',
      confirmNewPassword: '234'
    };
    await userController.updateUserPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('Update user password success', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = {
      oldPassword: 'TangoDown123!!!',
      newPassword: '9z4O4^HSvHkt3iU',
      confirmNewPassword: '9z4O4^HSvHkt3iU'
    };
    const existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = true;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    existUser.password = await generateHash('TangoDown123!!!');
    const userr = await getConnection().getRepository(User).insert(existUser);
    req.user = userr.identifiers[0].id;
    await userController.updateUserPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test('Update user failure user does not exist', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = {
      oldPassword: 'TangoDown123!!!',
      newPassword: '9z4O4^HSvHkt3iU',
      confirmNewPassword: '9z4O4^HSvHkt3iU'
    };
    const existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = true;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    existUser.password = await generateHash('TangoDown123!!!');
    const userr = await getConnection().getRepository(User).insert(existUser);
    userr.identifiers[0].id = 117;
    const x: any = 2;
    req.user = x;
    await userController.updateUserPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('patch user success', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = {
      firstName: 'Master',
      lastName: 'Chief',
      title: 'Spartan 117'
    };
    const existUser = new User();
    existUser.firstName = 'Cortana';
    existUser.lastName = 'AI';
    existUser.email = 'testing@jest.com';
    existUser.title = 'A.I.';
    existUser.active = true;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    existUser.password = await generateHash('TangoDown123!!!');
    const userr = await getConnection().getRepository(User).insert(existUser);
    req.user = userr.identifiers[0].id;
    await userController.patch(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test('get user failure user does not exist', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const existUser = new User();
    existUser.firstName = 'Cortana';
    existUser.lastName = 'AI';
    existUser.email = 'testing@jest.com';
    existUser.title = 'A.I.';
    existUser.active = true;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    existUser.password = await generateHash('TangoDown123!!!');
    await getConnection().getRepository(User).insert(existUser);
    const x: any = 2;
    req.user = x;
    await userController.getUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test('get user success', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const existUser = new User();
    existUser.firstName = 'Cortana';
    existUser.lastName = 'AI';
    existUser.email = 'testing@jest.com';
    existUser.title = 'A.I.';
    existUser.active = true;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    existUser.password = await generateHash('TangoDown123!!!');
    const userr = await getConnection().getRepository(User).insert(existUser);
    req.user = userr.identifiers[0].id;
    await userController.getUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test('get users success', async () => {
    const req = mockRequest();
    const res = mockResponse();
    await userController.getUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test('get users by id success', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const user1 = new User();
    user1.firstName = 'Cortana';
    user1.lastName = 'AI';
    user1.email = 'testing1@jest.com';
    user1.title = 'A.I.';
    user1.active = true;
    const uuid = uuidv4();
    user1.uuid = uuid;
    user1.password = await generateHash('TangoDown123!!!');
    const user2 = new User();
    user2.firstName = 'Cortana';
    user2.lastName = 'AI';
    user2.email = 'testing2@jest.com';
    user2.title = 'A.I.';
    user2.active = true;
    const uuid2 = uuidv4();
    user2.uuid = uuid2;
    user2.password = await generateHash('TangoDown123!!!');
    const usrIdAry: number[] = [];
    const insUser1 = await getConnection().getRepository(User).insert(user1);
    usrIdAry.push(insUser1.identifiers[0].id);
    const insUser2 = await getConnection().getRepository(User).insert(user2);
    usrIdAry.push(insUser2.identifiers[0].id);
    const retUserAry = await userController.getUsersById(usrIdAry);
    expect(retUserAry).toHaveLength(2);
  });
});
