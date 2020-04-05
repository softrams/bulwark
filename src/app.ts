import * as express from 'express';
import * as path from 'path';
const fs = require('fs');
const dotenv = require('dotenv');
// https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env')));
if (envConfig) {
  for (const key in envConfig) {
    if (envConfig.hasOwnProperty(key)) {
      process.env[key] = envConfig[key];
    }
  }
}
import { Response } from 'express';
import { UserRequest } from './interfaces/user-request.interface';
import * as bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
import { Organization } from './entity/Organization';
import { Asset } from './entity/Asset';
import { Assessment } from './entity/Assessment';
import { Vulnerability } from './entity/Vulnerability';
import { File } from './entity/File';
import { ProblemLocation } from './entity/ProblemLocation';
import { validate } from 'class-validator';
import { Resource } from './entity/Resource';
const authController = require('./routes/authentication.controller');
const orgController = require('./routes/organization.controller');
const userController = require('./routes/user.controller');
const fileUploadController = require('./routes/file-upload.controller');
const assetController = require('./routes/asset.controller');
const assessmentController = require('./routes/assessment.controller');
const jwtMiddleware = require('./middleware/jwt.middleware');
const puppeteerUtility = require('./utilities/puppeteer.utility');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
app.use(helmet());
app.use(cors());
app.use(
  express.static(path.join(__dirname, '../frontend/dist/frontend'), {
    etag: false
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const env = process.env.NODE_ENV || 'dev';
// start express server
const serverPort = process.env.PORT || 5000;
const serverIpAddress = process.env.IP || '127.0.0.1';
app.set('port', serverPort);
app.set('serverIpAddress', serverIpAddress);
// tslint:disable-next-line: no-console
app.listen(serverPort, () => console.info(`Server running on ${serverIpAddress}:${serverPort}`));
// create typeorm connection
createConnection().then((connection) => {
  // register respositories for database communication
  const orgRepository = connection.getRepository(Organization);
  const assetRepository = connection.getRepository(Asset);
  const assessmentRepository = connection.getRepository(Assessment);
  const vulnerabilityRepository = connection.getRepository(Vulnerability);
  const fileRepository = connection.getRepository(File);
  const probLocRepository = connection.getRepository(ProblemLocation);
  const resourceRepository = connection.getRepository(Resource);
  // register routes
  app.post('/api/user/create', jwtMiddleware.checkToken, userController.create);
  app.get('/api/user/verify/:uuid', userController.verify);
  app.patch('/api/forgot-password', authController.forgotPassword);
  app.patch('/api/user/password', jwtMiddleware.checkToken, userController.updatePassword);
  app.post('/api/login', authController.login);
  app.post('/api/upload', jwtMiddleware.checkToken, fileUploadController.uploadFile);
  app.get('/api/file/:id', jwtMiddleware.checkToken, fileUploadController.getFileById);
  app.get('/api/organization', jwtMiddleware.checkToken, orgController.getActiveOrgs);
  app.get('/api/organization/archive', jwtMiddleware.checkToken, orgController.getArchivedOrgs);
  app.get('/api/organization/:id', jwtMiddleware.checkToken, orgController.getOrgById);
  app.patch('/api/organization/:id/archive', jwtMiddleware.checkToken, orgController.archiveOrgById);
  app.patch('/api/organization/:id/activate', jwtMiddleware.checkToken, orgController.activateOrgById);
  app.patch('/api/organization/:id', jwtMiddleware.checkToken, orgController.updateOrgById);
  app.post('/api/organization', jwtMiddleware.checkToken, orgController.createOrg);
  app.get('/api/organization/asset/:id', jwtMiddleware.checkToken, assetController.getOrgAssets);
  app.post('/api/organization/:id/asset', jwtMiddleware.checkToken, assetController.createAsset);
  app.get('/api/organization/:id/asset/:assetId', jwtMiddleware.checkToken, assetController.getAssetById);
  app.patch('/api/organization/:id/asset/:assetId', jwtMiddleware.checkToken, assetController.updateAssetById);
  app.get('/api/assessment/:id', jwtMiddleware.checkToken, assessmentController.getAssessmentsByAssetId);
  app.get('/api/assessment/:id/vulnerability', jwtMiddleware.checkToken, assessmentController.getAssessmentVulns)
  app.post('/api/assessment', jwtMiddleware.checkToken, assessmentController.createAssessment);
  app.get('/api/asset/:assetId/assessment/:assessmentId', jwtMiddleware.checkToken,
    assessmentController.getAssessmentById)
  app.patch('/api/asset/:assetId/assessment/:assessmentId', jwtMiddleware.checkToken,
    assessmentController.updateAssessmentById);
  app.get('/api/assessment/:assessmentId/report', jwtMiddleware.checkToken,
    assessmentController.queryReportDataByAssessment);
  app.post('/api/report/generate', jwtMiddleware.checkToken, puppeteerUtility.generateReport);



  /**
   * @description API backend for requesting a vulnerability associated by ID
   * and updates archive status
   * @param {UserRequest} req
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get('/api/vulnerability/:vulnId', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (!req.params.vulnId) {
      return res.status(400).send('Invalid Vulnerability UserRequest');
    }
    if (isNaN(+req.params.vulnId)) {
      return res.status(400).send('Invalid Vulnerability ID');
    }
    // TODO: Utilize createQueryBuilder to only return screenshot IDs and not the full object
    const vuln = await vulnerabilityRepository.findOne(req.params.vulnId, {
      relations: ['screenshots', 'problemLocations', 'resources']
    });
    if (!vuln) {
      return res.status(404).send('Vulnerability does not exist.');
    }
    res.status(200).json(vuln);
  });
  /**
   * @description API backend for deleting a vulnerability associated by ID
   *
   * @param {UserRequest} req vulnID is required
   * @param {Response} res contains JSON object with the success/fail
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.delete('/api/vulnerability/:vulnId', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (!req.params.vulnId) {
      return res.status(400).send('Invalid vulnerability UserRequest');
    }
    if (isNaN(+req.params.vulnId)) {
      return res.status(400).send('Invalid vulnerability ID');
    }
    const vuln = await vulnerabilityRepository.findOne(req.params.vulnId);
    if (!vuln) {
      return res.status(404).send('Vulnerability does not exist.');
    } else {
      await vulnerabilityRepository.delete(vuln);
      res.status(200).json('Vulnerability successfully deleted');
    }
  });
  /**
   * @description API backend for updating a vulnerability associated by ID
   * and performs updates
   * @param {UserRequest} req vulnId is required
   * @param {Response} res contains JSON object with the status of the req
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch('/api/vulnerability/:vulnId', async (req: UserRequest, res: Response) => {
    req = await fileUploadController.uploadFileArray(req, res);
    if (isNaN(+req.body.assessment) || !req.body.assessment) {
      return res.status(400).json('Invalid Assessment ID');
    }
    const assessment = await assessmentRepository.findOne(req.body.assessment);
    if (!assessment) {
      return res.status(404).json('Assessment does not exist');
    }
    if (isNaN(+req.params.vulnId)) {
      return res.status(400).json('Vulnerability ID is invalid');
    }
    const vulnerability = await vulnerabilityRepository.findOne(req.params.vulnId);
    if (!vulnerability) {
      return res.status(404).json('Vulnerability does not exist');
    }
    vulnerability.id = +req.params.vulnId;
    vulnerability.impact = req.body.impact;
    vulnerability.likelihood = req.body.likelihood;
    vulnerability.risk = req.body.risk;
    vulnerability.status = req.body.status;
    vulnerability.description = req.body.description;
    vulnerability.remediation = req.body.remediation;
    vulnerability.jiraId = req.body.jiraId;
    vulnerability.cvssScore = req.body.cvssScore;
    vulnerability.cvssUrl = req.body.cvssUrl;
    vulnerability.detailedInfo = req.body.detailedInfo;
    vulnerability.assessment = assessment;
    vulnerability.name = req.body.name;
    vulnerability.systemic = req.body.systemic;
    const errors = await validate(vulnerability);
    if (errors.length > 0) {
      return res.status(400).send('Vulnerability form validation failed');
    } else {
      await vulnerabilityRepository.save(vulnerability);
      // Remove deleted files
      if (req.body.screenshotsToDelete) {
        const existingScreenshots = await fileRepository.find({ where: { vulnerability: vulnerability.id } });
        const existingScreenshotIds = existingScreenshots.map(screenshot => screenshot.id);
        let screenshotsToDelete = JSON.parse(req.body.screenshotsToDelete);
        // We only want to remove the files associated to the vulnerability
        screenshotsToDelete = existingScreenshotIds.filter(value => screenshotsToDelete.includes(value));
        for (const screenshotId of screenshotsToDelete) {
          fileRepository.delete(screenshotId);
        }
      }
      // Save new files added
      for (const screenshot of req.files) {
        let file = new File();
        file = screenshot;
        file.vulnerability = vulnerability;
        const fileErrors = await validate(file); // fixing shadowed variable
        if (fileErrors.length > 0) {
          return res.status(400).send('File validation failed');
        } else {
          await fileRepository.save(file);
        }
      }
      // Remove deleted problem locations
      if (req.body.problemLocations.length) {
        const clientProdLocs = JSON.parse(req.body.problemLocations);
        const clientProdLocsIds = clientProdLocs.map(value => value.id);
        const existingProbLocs = await probLocRepository.find({ where: { vulnerability: vulnerability.id } });
        const existingProbLocIds = existingProbLocs.map(probLoc => probLoc.id);
        const prodLocsToDelete = existingProbLocIds.filter(value => !clientProdLocsIds.includes(value));
        for (const probLoc of prodLocsToDelete) {
          probLocRepository.delete(probLoc);
        }
        // Update problem locations
        for (const probLoc of clientProdLocs) {
          if (probLoc && probLoc.location && probLoc.target) {
            let problemLocation = new ProblemLocation();
            problemLocation = probLoc;
            problemLocation.vulnerability = vulnerability;
            const plErrors = await validate(problemLocation);
            if (plErrors.length > 0) {
              return res.status(400).send('Problem Location validation failed');
            } else {
              await probLocRepository.save(problemLocation);
            }
          } else {
            return res.status(400).send('Invalid Problem Location');
          }
        }
      }
      // Remove deleted resources
      if (req.body.resources.length) {
        const clientResources = JSON.parse(req.body.resources);
        const clientResourceIds = clientResources.map(value => value.id);
        const existingResources = await resourceRepository.find({ where: { vulnerability: vulnerability.id } });
        const existingResourceIds = existingResources.map(resource => resource.id);
        const resourcesToDelete = existingResourceIds.filter(value => !clientResourceIds.includes(value));
        for (const resource of resourcesToDelete) {
          resourceRepository.delete(resource);
        }
        // Update resources
        for (const clientResource of clientResources) {
          if (clientResource.description && clientResource.url) {
            let resource = new Resource();
            resource = clientResource;
            resource.vulnerability = vulnerability;
            const resourceErrors = await validate(resource);
            if (resourceErrors.length > 0) {
              return res.status(400).send('Resource Location validation failed');
            } else {
              await resourceRepository.save(resource);
            }
          } else {
            return res.status(400).send('Resource Location Invalid');
          }
        }
      }
      return res.status(200).json('Vulnerability patched successfully');
    }
  });
  /**
   * @description API backend for creating a vulnerability with the
   * provided req data
   * @param {UserRequest} req array for files, vulnerability form data as JSON
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.post('/api/vulnerability', async (req: UserRequest, res: Response) => {
    req = await fileUploadController.uploadFileArray(req, res);
    if (isNaN(+req.body.assessment) || !req.body.assessment) {
      return res.status(400).json('Invalid Assessment ID');
    }
    const assessment = await assessmentRepository.findOne(req.body.assessment);
    if (!assessment) {
      return res.status(404).json('Assessment does not exist');
    }
    const vulnerability = new Vulnerability();
    vulnerability.impact = req.body.impact;
    vulnerability.likelihood = req.body.likelihood;
    vulnerability.risk = req.body.risk;
    vulnerability.status = req.body.status;
    vulnerability.description = req.body.description;
    vulnerability.remediation = req.body.remediation;
    vulnerability.jiraId = req.body.jiraId;
    vulnerability.cvssScore = req.body.cvssScore;
    vulnerability.cvssUrl = req.body.cvssUrl;
    vulnerability.detailedInfo = req.body.detailedInfo;
    vulnerability.assessment = assessment;
    vulnerability.name = req.body.name;
    vulnerability.systemic = req.body.systemic;
    const errors = await validate(vulnerability);
    if (errors.length > 0) {
      return res.status(400).send('Vulnerability form validation failed');
    } else {
      await vulnerabilityRepository.save(vulnerability);
      // Save screenshots
      for (const screenshot of req.files) {
        let file = new File();
        file = screenshot;
        file.vulnerability = vulnerability;
        const fileErrors = await validate(file);
        if (fileErrors.length > 0) {
          return res.status(400).send('File validation failed');
        } else {
          await fileRepository.save(file);
        }
      }
      // Save problem locations
      const problemLocations = JSON.parse(req.body.problemLocations);
      for (const probLoc of problemLocations) {
        if (probLoc && probLoc.location && probLoc.target) {
          let problemLocation = new ProblemLocation();
          problemLocation = probLoc;
          problemLocation.vulnerability = vulnerability;
          const plErrors = await validate(problemLocation);
          if (plErrors.length > 0) {
            return res.status(400).send('Problem Location validation failed');
          } else {
            await probLocRepository.save(problemLocation);
          }
        } else {
          return res.status(400).send('Invalid Problem Location');
        }
      }
      // Save Resource Locations
      const resources = JSON.parse(req.body.resources);
      for (const resource of resources) {
        if (resource.description && resource.url) {
          let newResource = new Resource();
          newResource = resource;
          newResource.vulnerability = vulnerability;
          const nrErrors = await validate(newResource);
          if (nrErrors.length > 0) {
            return res.status(400).send('Resource Location validation failed');
          } else {
            await resourceRepository.save(newResource);
          }
        } else {
          return res.status(400).send('Resource Location Invalid');
        }
      }
      res.status(200).json('Vulnerability saved successfully');
    }
  });
});
