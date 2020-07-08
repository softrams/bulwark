require('dotenv').config();
import jwt = require('jsonwebtoken');
const { checkToken, checkRefreshToken } = require('./jwt.middleware');

describe('jwt.middleware.ts', () => {
    // Mocks the Request Object that is returned
    const mockRequest = () => {
        const req = {
            headers: {
                authorization: 'FakeJWT'
            },
            body: {},
            user: Function,
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
    let token: string, refreshToken: string;
    beforeAll(() => {
        token = jwt.sign({ userId: '2222' }, process.env.JWT_KEY, { expiresIn: '15m' });
        refreshToken = jwt.sign({ userId: '2222' }, process.env.JWT_REFRESH_KEY, { expiresIn: '8h' });
    });

    test('running checkToken should return a 401 with Authorization', async () => {
        const req = mockRequest();
        const res = mockResponse();
        await checkToken(req, res, null);
        expect(res.status).toHaveBeenCalledWith(401);  
    });

    test('running checkToken should return a req.user', async () => {
        const req = mockRequest();
        const res = mockResponse();
        req.headers.authorization = token;
        await checkToken(req, res, jest.fn());
        expect(req.user).toBe('2222');  
    });

    test('running checkToken should return a 401 without Authorization', async () => {
        const req = mockRequest();
        delete(req.headers.authorization);
        const res = mockResponse();
        await checkToken(req, res, null);
        expect(res.status).toHaveBeenCalledWith(401);  
    });

    test('running checkRefreshToken should return a 401 with refreshToken', async () => {
        const req = mockRequest();
        const res = mockResponse();
        req.body = {
            'refreshToken': 'FakeJWT',
        };
        await checkRefreshToken(req, res, null);
        expect(res.status).toHaveBeenCalledWith(401);  
    });
    test('running checkRefreshToken should return a 401 without refreshToken', async () => {
        const req = mockRequest();
        const res = mockResponse();
        await checkRefreshToken(req, res, null);
        expect(res.status).toHaveBeenCalledWith(401);  
    });

    test('running checkRefreshToken should return a req.user', async () => {
        const req = mockRequest();
        const res = mockResponse();
        req.body = {
            'refreshToken': refreshToken,
        };
        await checkRefreshToken(req, res, jest.fn());
        expect(req.user).toBe('2222');  
    });
});
