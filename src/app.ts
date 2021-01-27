import * as express from 'express';
import * as path from 'path';
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.join(__dirname, '../.env'))) {
  const envPath = fs.readFileSync(path.join(__dirname, '../.env'));
  // tslint:disable-next-line: no-console
  console.log('A .env file has been found found and will now be parsed.');
  // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
  const envConfig = dotenv.parse(envPath);
  if (envConfig) {
    for (const key in envConfig) {
      if (envConfig.hasOwnProperty(key)) {
        process.env[key] = envConfig[key];
      }
    }
    // tslint:disable-next-line: no-console
    console.log('The provided .env file has been parsed successfully.');
  }
}
import * as bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
const authController = require('./routes/authentication.controller');
import * as userController from './routes/user.controller';
const fileUploadController = require('./routes/file-upload.controller');
import * as orgController from './routes/organization.controller';
import * as assetController from './routes/asset.controller';
import * as assessmentController from './routes/assessment.controller';
import * as vulnController from './routes/vulnerability.controller';
import * as jwtMiddleware from './middleware/jwt.middleware';
import { generateReport } from './utilities/puppeteer.utility';
import * as configController from './routes/config.controller';
const helmet = require('helmet');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(
  express.static(path.join(__dirname, '../frontend/dist/frontend'), {
    etag: false,
  })
);
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self' blob:", 'stackpath.bootstrapcdn.com'],
      scriptSrc: ["'self'", 'code.jquery.com', 'stackpath.bootstrapcdn.com'],
      styleSrc: ["'self'", 'stackpath.bootstrapcdn.com', "'unsafe-inline'"],
    },
  })
);
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
const serverPort = process.env.PORT || 5000;
const serverIpAddress = process.env.PROD_IP || '127.0.0.1';
app.set('port', serverPort);
app.set('serverIpAddress', serverIpAddress);
// tslint:disable-next-line: no-console
app.listen(serverPort, () =>
  console.info(`Server running on ${serverIpAddress}:${serverPort}`)
);
// create typeorm connection
createConnection().then((_) => {
  // tslint:disable-next-line: no-console
  console.info(`Database connection successful`);
  // Check for initial configuration and user
  // If none exist, insert
  configController.initialInsert();
  // register routes
  app.post('/api/user/register', userController.register);
  app.post('/api/user/invite', jwtMiddleware.checkToken, userController.invite);
  app.post(
    '/api/user/email',
    jwtMiddleware.checkToken,
    userController.updateUserEmail
  );
  app.post(
    '/api/user/email/revoke',
    jwtMiddleware.checkToken,
    userController.revokeEmailRequest
  );
  app.post('/api/user/email/validate', userController.validateEmailRequest);
  app.patch('/api/user', jwtMiddleware.checkToken, userController.patch);
  app.get('/api/user', jwtMiddleware.checkToken, userController.getUser);
  app.get('/api/users', jwtMiddleware.checkToken, userController.getUsers);
  app.get('/api/user/verify/:uuid', userController.verify);
  app.patch('/api/forgot-password', authController.forgotPassword);
  app.patch('/api/password-reset', authController.resetPassword);
  app.post(
    '/api/refresh',
    jwtMiddleware.checkRefreshToken,
    authController.refreshSession
  );
  app.patch('/api/user/password', userController.updateUserPassword);
  app.post('/api/login', authController.login);
  app.post(
    '/api/upload',
    jwtMiddleware.checkToken,
    fileUploadController.uploadFile
  );
  app.get(
    '/api/file/:id',
    jwtMiddleware.checkToken,
    fileUploadController.getFileById
  );
  app.get(
    '/api/organization',
    jwtMiddleware.checkToken,
    orgController.getActiveOrgs
  );
  app.get(
    '/api/organization/archive',
    jwtMiddleware.checkToken,
    orgController.getArchivedOrgs
  );
  app.get(
    '/api/organization/:id',
    jwtMiddleware.checkToken,
    orgController.getOrgById
  );
  app.patch(
    '/api/organization/:id/archive',
    jwtMiddleware.checkToken,
    orgController.archiveOrgById
  );
  app.patch(
    '/api/organization/:id/activate',
    jwtMiddleware.checkToken,
    orgController.activateOrgById
  );
  app.patch(
    '/api/organization/:id',
    jwtMiddleware.checkToken,
    orgController.updateOrgById
  );
  app.post(
    '/api/organization',
    jwtMiddleware.checkToken,
    orgController.createOrg
  );
  app.get(
    '/api/organization/asset/:id',
    jwtMiddleware.checkToken,
    assetController.getOrgAssets
  );
  app.get(
    '/api/organization/:id/asset/archive',
    jwtMiddleware.checkToken,
    assetController.getArchivedOrgAssets
  );
  app.post(
    '/api/organization/:id/asset',
    jwtMiddleware.checkToken,
    assetController.createAsset
  );
  app.get(
    '/api/organization/:id/asset/:assetId',
    jwtMiddleware.checkToken,
    assetController.getAssetById
  );
  app.patch(
    '/api/organization/:id/asset/:assetId',
    jwtMiddleware.checkToken,
    assetController.updateAssetById
  );
  app.patch(
    '/api/asset/archive/:assetId',
    jwtMiddleware.checkToken,
    assetController.archiveAssetById
  );
  app.patch(
    '/api/asset/activate/:assetId',
    jwtMiddleware.checkToken,
    assetController.activateAssetById
  );
  app.delete(
    '/api/asset/jira/:assetId',
    jwtMiddleware.checkToken,
    assetController.purgeJiraInfo
  );
  app.get(
    '/api/assessment/:id',
    jwtMiddleware.checkToken,
    assessmentController.getAssessmentsByAssetId
  );
  app.get(
    '/api/assessment/:id/vulnerability',
    jwtMiddleware.checkToken,
    assessmentController.getAssessmentVulns
  );
  app.post(
    '/api/assessment',
    jwtMiddleware.checkToken,
    assessmentController.createAssessment
  );
  app.delete(
    '/api/assessment/:assessmentId',
    jwtMiddleware.checkToken,
    assessmentController.deleteAssessmentById
  );
  app.get(
    '/api/asset/:assetId/assessment/:assessmentId',
    jwtMiddleware.checkToken,
    assessmentController.getAssessmentById
  );
  app.patch(
    '/api/asset/:assetId/assessment/:assessmentId',
    jwtMiddleware.checkToken,
    assessmentController.updateAssessmentById
  );
  app.get(
    '/api/assessment/:assessmentId/report',
    jwtMiddleware.checkToken,
    assessmentController.queryReportDataByAssessment
  );
  app.post('/api/report/generate', jwtMiddleware.checkToken, generateReport);
  app.get(
    '/api/vulnerability/:vulnId',
    jwtMiddleware.checkToken,
    vulnController.getVulnById
  );
  app.delete(
    '/api/vulnerability/:vulnId',
    jwtMiddleware.checkToken,
    vulnController.deleteVulnById
  );
  app.patch(
    '/api/vulnerability/:vulnId',
    jwtMiddleware.checkToken,
    vulnController.patchVulnById
  );
  app.post(
    '/api/vulnerability',
    jwtMiddleware.checkToken,
    vulnController.createVuln
  );
  app.get(
    '/api/vulnerability/jira/:vulnId',
    jwtMiddleware.checkToken,
    vulnController.exportToJira
  );
  app.post(
    '/api/config',
    jwtMiddleware.checkToken,
    configController.saveConfig
  );
  app.get('/api/config', jwtMiddleware.checkToken, configController.getConfig);
});
