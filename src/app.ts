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
import { Report } from './classes/Report';
import { File } from './entity/File';
import { ProblemLocation } from './entity/ProblemLocation';
import { validate } from 'class-validator';
import { Resource } from './entity/Resource';
import puppeteer = require('puppeteer');
const authController = require('./routes/authentication.controller');
const orgController = require('./routes/organization.controller');
const userController = require('./routes/user.controller');
const fileUploadController = require('./routes/file-upload.controller');
const jwtMiddleware = require('./middleware/jwt.middleware');
const helmet = require('helmet');
const cors = require('cors');
// Setup middlware
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
// NODE ENV
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
  /**
   * @description API backend for UserRequesting an asset associated by ID
   * and returns it to the UI
   * @param {UserRequest} req
   * @param {Response} res contains JSON object with the asset data
   * @returns a JSON object with the asset data
   */
  app.get('/api/organization/asset/:id', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json('Invalid Asset UserRequest');
    }
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Organization ID');
    }
    const asset = await assetRepository.find({
      where: { organization: req.params.id }
    });
    if (!asset) {
      return res.status(404).json('Assets not found');
    }
    res.json(asset);
  });
  /**
   * @description API backend for UserRequesting an assessment associated by ID
   * and returns it to the UI
   * @param {UserRequest} req
   * @param {Response} res contains JSON object with the assessment data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get('/api/assessment/:id', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json('Invalid Assessment UserRequest');
    }
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Asset ID');
    }
    const assessment = await assessmentRepository.find({
      where: { asset: req.params.id }
    });
    if (!assessment) {
      return res.status(404).json('Assessments do not exist');
    }
    res.json(assessment);
  });
  /**
   * @description API backend for UserRequesting a vulnerability and returns it to the UI
   *
   * @param {UserRequest} req
   * @param {Response} res contains JSON object with the vulnerability data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get('/api/assessment/:id/vulnerability', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json('Invalid Vulnerability UserRequest');
    }
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Assessment ID');
    }
    const vulnerabilities = await vulnerabilityRepository.find({
      where: { assessment: req.params.id }
    });
    if (!vulnerabilities) {
      return res.status(404).json('Vulnerabilities do not exist');
    }
    res.json(vulnerabilities);
  });
  /**
   * @description API backend for UserRequesting a vulnerability associated by ID
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
  /**
   * @description API backend for creating an asset associated by org ID
   *
   * @param {UserRequest} req name, organization
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.post('/api/organization/:id/asset', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Organization ID is not valid');
    }
    const org = await orgRepository.findOne(req.params.id);
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    if (!req.body.name) {
      return res.status(400).send('Asset is not valid');
    }
    const asset = new Asset();
    asset.name = req.body.name;
    asset.organization = org;
    const errors = await validate(asset);
    if (errors.length > 0) {
      res.status(400).send('Asset form validation failed');
    } else {
      await assetRepository.save(asset);
      res.status(200).json('Asset saved successfully');
    }
  });
  /**
   * @description API backend for UserRequesting an organization asset associated by ID
   * and returns the data
   * @param {UserRequest} req assetId, orgId
   * @param {Response} res contains JSON object with the asset data tied to the org
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get('/api/organization/:id/asset/:assetId', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (isNaN(+req.params.assetId)) {
      return res.status(400).json('Invalid Asset ID');
    }
    if (!req.params.assetId) {
      return res.status(400).send('Invalid Asset UserRequest');
    }
    const asset = await assetRepository.findOne(req.params.assetId);
    if (!asset) {
      return res.status(404).send('Asset does not exist');
    }
    res.status(200).json(asset);
  });
  /**
   * @description API backend for updating an organization asset associated by ID
   * and updates the data
   * @param {UserRequest} req name, organization, assetId
   * @param {Response} res contains JSON object with the asset data tied to the org
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch(
    '/api/organization/:id/asset/:assetId',
    jwtMiddleware.checkToken,
    async (req: UserRequest, res: Response) => {
      if (isNaN(+req.params.assetId) || !req.params.assetId) {
        return res.status(400).json('Asset ID is not valid');
      }
      const asset = await assetRepository.findOne(req.params.assetId);
      if (!asset) {
        return res.status(404).json('Asset does not exist');
      }
      if (!req.body.name) {
        return res.status(400).json('Asset name is not valid');
      }
      asset.name = req.body.name;
      const errors = await validate(asset);
      if (errors.length > 0) {
        res.status(400).send('Asset form validation failed');
      } else {
        await assetRepository.save(asset);
        res.status(200).json('Asset patched successfully');
      }
    }
  );
  /**
   * @description API backend for creating an assessment
   *
   * @param {UserRequest} req assessment object data
   * @param {Response} res contains JSON object with the success/fail status
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.post('/api/assessment', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (isNaN(req.body.asset)) {
      return res.status(400).json('Asset ID is invalid');
    }
    const asset = await assetRepository.findOne(req.body.asset);
    if (!asset) {
      return res.status(404).json('Asset does not exist');
    }
    const assessment = new Assessment();
    assessment.asset = asset;
    assessment.name = req.body.name;
    assessment.executiveSummary = req.body.executiveSummary;
    assessment.jiraId = req.body.jiraId;
    assessment.testUrl = req.body.testUrl;
    assessment.prodUrl = req.body.prodUrl;
    assessment.scope = req.body.scope;
    assessment.tag = req.body.tag;
    assessment.startDate = new Date(req.body.startDate);
    assessment.endDate = new Date(req.body.endDate);
    const errors = await validate(assessment);
    if (errors.length > 0) {
      return res.status(400).send('Assessment form validation failed');
    } else {
      await assessmentRepository.save(assessment);
      res.status(200).json('Assessment created succesfully');
    }
  });
  /**
   * @description API backend for UserRequesting assessment by ID association
   * @param {UserRequest} req assetId, assessmentId
   * @param {Response} res contains JSON object with the assessment data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get(
    '/api/asset/:assetId/assessment/:assessmentId',
    jwtMiddleware.checkToken,
    async (req: UserRequest, res: Response) => {
      if (!req.params.assessmentId) {
        return res.status(400).send('Invalid assessment UserRequest');
      }
      if (isNaN(+req.params.assessmentId)) {
        return res.status(400).json('Invalid Assessment ID');
      }
      const assessment = await assessmentRepository.findOne(req.params.assessmentId);
      if (!assessment) {
        return res.status(404).json('Assessment does not exist');
      }
      res.status(200).json(assessment);
    }
  );
  /**
   * @description API backend for updating a assessment associated by ID
   * @param {UserRequest} req assessment JSON object with assessment data
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch(
    '/api/asset/:assetId/assessment/:assessmentId',
    jwtMiddleware.checkToken,
    async (req: UserRequest, res: Response) => {
      if (!req.params.assessmentId) {
        return res.status(400).send('Invalid assessment UserRequest');
      }
      if (isNaN(+req.params.assessmentId)) {
        return res.status(400).json('Invalid Assessment ID');
      }
      let assessment = await assessmentRepository.findOne(req.params.assessmentId);
      if (!assessment) {
        return res.status(404).json('Assessment does not exist');
      }
      const assessmentId = assessment.id;
      delete req.body.asset;
      assessment = req.body;
      assessment.id = assessmentId;
      if (assessment.startDate > assessment.endDate) {
        return res.status(400).send('The assessment start date can not be later than the end date');
      }
      const errors = await validate(assessment);
      if (errors.length > 0) {
        return res.status(400).send('Assessment form validation failed');
      } else {
        await assessmentRepository.save(assessment);
        res.status(200).json('Assessment patched successfully');
      }
    }
  );
  /**
   * @description API backend for UserRequesting a report associated by assessmentId
   * @param {UserRequest} req assessmentId
   * @param {Response} res contains JSON object with the report data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get('/api/assessment/:assessmentId/report', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (!req.params.assessmentId) {
      return res.status(400).send('Invalid report UserRequest');
    }
    if (isNaN(+req.params.assessmentId)) {
      return res.status(400).json('Invalid Assessment ID');
    }
    const assessment = await assessmentRepository.findOne(req.params.assessmentId, { relations: ['asset'] });
    const asset = await assetRepository.findOne(assessment.asset.id, {
      relations: ['organization']
    });
    const organization = await orgRepository.findOne(asset.organization.id);
    const vulnerabilities = await vulnerabilityRepository
      .createQueryBuilder('vuln')
      .leftJoinAndSelect('vuln.screenshots', 'screenshot')
      .leftJoinAndSelect('vuln.problemLocations', 'problemLocation')
      .leftJoinAndSelect('vuln.resources', 'resource')
      .where('vuln.assessmentId = :assessmentId', {
        assessmentId: assessment.id
      })
      .select([
        'vuln',
        'screenshot.id',
        'screenshot.originalname',
        'screenshot.mimetype',
        'problemLocation',
        'resource'
      ])
      .getMany();
    const report = new Report();
    report.org = organization;
    report.asset = asset;
    report.assessment = assessment;
    report.vulns = vulnerabilities;
    report.companyName = process.env.COMPANY_NAME;
    res.status(200).json(report);
  });
  /**
   * @description API backend for report generation with Puppeteer
   * @param {UserRequest} req orgId, assetId, assessmentId
   * @param {Response} res contains all data associated and generates a
   * new html page with PDF Report
   * @returns a new page generated by Puppeteer with a Report in PDF format
   */
  app.post('/api/report/generate', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (!req.body.orgId || !req.body.assetId || !req.body.assessmentId) {
      return res.status(400).send('Invalid report parameters');
    }
    const url =
      env === 'production'
        ? `${process.env.PROD_URL}/#/organization/${req.body.orgId}
        /asset/${req.body.assetId}/assessment/${req.body.assessmentId}/report/puppeteer`
        : `${process.env.DEV_URL}/#/organization/${req.body.orgId}
        /asset/${req.body.assetId}/assessment/${req.body.assessmentId}/report/puppeteer`;
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const filePath = path.join(__dirname, '../temp_report.pdf');
    const jwtToken = req.headers.authorization;
    await page.evaluateOnNewDocument(token => {
      localStorage.clear();
      localStorage.setItem('AUTH_TOKEN', token);
    }, jwtToken);
    await page.goto(url, { waitUntil: 'networkidle0' });

    await page.pdf({ path: filePath, format: 'A4' });
    await browser.close();
    const file = fs.createReadStream(filePath);
    const stat = fs.statSync(filePath);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    file.pipe(res);
    fs.unlink(filePath, (err, response) => {
      if (err) {
        // handle error here
      } else {
        // tslint:disable-next-line: no-console
        console.info('File removed');
      }
    });
  });
});
