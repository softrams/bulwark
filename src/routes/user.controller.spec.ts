import { createConnection, getConnection, Entity, getRepository } from 'typeorm';
const userController = require('./user.controller');
import { User } from '../entity/user';
import { v4 as uuidv4 } from 'uuid';
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
      entities: [User],
      synchronize: true,
      logging: false
    });
  });

  afterEach(() => {
    const conn = getConnection();
    return conn.close();
  });
  test('invite user success', async () => {
    const req = mockRequest();
    req.body = {
      email: 'testing@jest.com'
    };
    const res = mockResponse();
    await userController.invite(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test('invite user failure missing email', async () => {
    const req = mockRequest();
    req.body = {};
    const res = mockResponse();
    await userController.invite(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('invite user failure user already exists', async () => {
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
});
