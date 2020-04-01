// tslint:disable-next-line: no-var-requires
require('dotenv').config();
import * as express from 'express';
import * as path from 'path';
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
import { User } from './entity/User';
import { status } from './enums/status-enum';
import uuidv4 = require('uuid/v4');
import jwt = require('jsonwebtoken');
import puppeteer = require('puppeteer');
import multer = require('multer');
// tslint:disable-next-line: no-var-requires
const jwtMiddleware = require('./middleware/jwt.middleware');
// tslint:disable-next-line: no-var-requires
const emailService = require('./services/email.service');
// tslint:disable-next-line: no-var-requires
const bcryptUtility = require('./utilities/bcrypt.utility');
// tslint:disable-next-line: no-var-requires
const fs = require('fs');
// tslint:disable-next-line: no-var-requires
const helmet = require('helmet');
// tslint:disable-next-line: no-var-requires
const cors = require('cors');
// tslint:disable-next-line: no-var-requires
const passwordValidator = require('password-validator');
const upload = multer({
  fileFilter: (req, file, cb) => {
    // Ext validation
    if (!(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')) {
      req.fileExtError = 'Only JPEG and PNG file types allowed';
      cb(null, false);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: '2mb' }
}).single('file');
const uploadArray = multer({
  fileFilter: (req, file, cb) => {
    // Ext validation
    if (!(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')) {
      req.fileExtError = 'Only JPEG and PNG file types allowed';
      cb(null, false);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: '2mb' }
}).array('screenshots');
// Create a password schema
const passwordSchema = new passwordValidator();
passwordSchema
  .is()
  .min(12) // Minimum length 8
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits() // Must have digits
  .has()
  .symbols(); // Must have symbols

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
createConnection().then(connection => {
  // register respositories for database communication
  const orgRepository = connection.getRepository(Organization);
  const assetRepository = connection.getRepository(Asset);
  const assessmentRepository = connection.getRepository(Assessment);
  const vulnerabilityRepository = connection.getRepository(Vulnerability);
  const fileRepository = connection.getRepository(File);
  const probLocRepository = connection.getRepository(ProblemLocation);
  const resourceRepository = connection.getRepository(Resource);
  const userRepository = connection.getRepository(User);

  /**
   * @description Create user
   * @param {UserRequest} req
   * @param {Response} res
   * @returns success message
   */
  app.post('/api/user/create', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    const user = new User();
    const { password, confirmPassword, email } = req.body;
    if (!email) {
      return res.status(400).json('Email is invalid');
    }
    const existUser = await userRepository.find({ where: { email } });
    if (existUser.length) {
      return res.status(400).json('A user associated to that email already exists');
    }
    user.email = email;
    if (password !== confirmPassword) {
      return res.status(400).json('Passwords do not match');
    }
    if (!passwordSchema.validate(password)) {
      return res.status(400).json('Insecure password complexity');
    }
    user.password = await bcryptUtility.generateHash(password);
    user.active = false;
    user.uuid = uuidv4();
    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).json('User validation failed');
    } else {
      await userRepository.save(user);
      emailService.sendVerificationEmail(user.uuid, user.email);
      return res.status(200).json('User created successfully');
    }
  });

  /**
   * @description Verifies user by comparing UUID
   * @param {UserRequest} req
   * @param {Response} res
   * @returns Success message
   */
  app.get('/api/user/verify/:uuid', async (req: UserRequest, res: Response) => {
    if (req.params.uuid) {
      const user = await userRepository.findOne({ where: { uuid: req.params.uuid } });
      if (user) {
        user.active = true;
        user.uuid = null;
        userRepository.save(user);
        return res.status(200).json('Email verification successful');
      } else {
        return res.status(400).json('Email verification failed.  User does not exist.');
      }
    } else {
      return res.status(400).json('UUID is undefined');
    }
  });

  /**
   * @description Verifies user by comparing UUID
   * @param {UserRequest} req
   * @param {Response} res
   * @returns Success message
   */
  app.patch('/api/forgot-password', async (req: UserRequest, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json('Email is invalid');
    }
    const user = await userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', {
        email
      })
      .getOne();
    if (!user) {
      return res
        .status(400)
        .json('Unable to retrieve the user at this time.  Please contact an administrator for assistance.');
    }
    user.uuid = uuidv4();
    await userRepository.save(user);
    if (!user.active) {
      emailService.sendVerificationEmail(user.uuid, user.email);
      return res
        .status(400)
        .json('This account has not been activated.  Please check for email verification or contact an administrator.');
    } else {
      emailService.sendForgotPasswordEmail(user.uuid, user.email);
      return res.status(200).json('A password reset UserRequest has been initiated.  Please check your email.');
    }
  });

  /**
   * @description Updates user password
   * @param {UserRequest} req
   * @param {Response} res
   * @returns Success message
   */
  app.patch('/api/user/password', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json('Passwords do not match');
    }
    if (newPassword === oldPassword) {
      return res.status(400).json('New password can not be the same as the old password');
    }
    if (!passwordSchema.validate(newPassword)) {
      return res.status(400).json('Insecure password complexity');
    }
    const user = await userRepository.findOne(req.user);
    if (user) {
      const callback = (resStatus: number, message: any) => {
        res.status(resStatus).send(message);
      };
      user.password = await bcryptUtility.updatePassword(oldPassword, user.password, newPassword, callback);
      await userRepository.save(user);
      return res.status(200).json('Password updated successfully');
    } else {
      return res
        .status(400)
        .json('Unable to update user password at this time.  Please contact an administrator for assistance.');
    }
  });

  /**
   * @description Login to the application
   * @param {UserRequest} req
   * @param {Response} res
   * @returns valid JWT token
   */
  app.post('/api/login', async (req: UserRequest, res: Response) => {
    const { password, email } = req.body;
    const user = await userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', {
        email
      })
      .getOne();
    if (user) {
      if (!user.active) {
        // generate new UUID
        user.uuid = uuidv4();
        // No need to validate as validation happend with user creation
        await userRepository.save(user);
        emailService.sendVerificationEmail(user.uuid, user.email);
        return res
          .status(400)
          .json(
            'This account has not been activated.  Please check for email verification or contact an administrator.'
          );
      }
      const valid = await bcryptUtility.compare(password, user.password);
      if (valid) {
        // TODO: Generate secret key and store in env var
        const token = jwt.sign({ email: user.email, userId: user.id }, process.env.JWT_KEY, { expiresIn: '.5h' });
        return res.status(200).json(token);
      } else {
        return res.status(400).json('Invalid email or password');
      }
    } else {
      return res.status(400).json('Invalid email or password');
    }
  });

  /**
   * @description Upload a file
   * @param {UserRequest} req
   * @param {Response} res
   * @returns file ID
   */
  app.post('/api/upload', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    // TODO Virus scanning
    upload(req, res, async err => {
      if (req.fileExtError) {
        return res.status(400).send(req.fileExtError);
      }
      if (err) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).send('Only File size up to 500 KB allowed');
        }
      } else {
        if (!req.file) {
          return res.status(400).send('You must provide a file');
        } else {
          let file = new File();
          file = req.file;
          const newFile = await fileRepository.save(file);
          res.json(newFile.id);
        }
      }
    });
  });

  /**
   * @description API backend for getting organization data
   * returns all organizations when triggered
   * @param {UserRequest} req
   * @param {Response} res contains JSON object with all organization data
   * @returns an array of organizations with avatar relations
   */
  app.get('/api/organization', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    const orgs = await orgRepository.find({
      relations: ['avatar'],
      where: { status: status.active }
    });
    if (!orgs) {
      return res.status(404).json('Organizations do not exist');
    }
    res.json(orgs);
  });

  /**
   * @description API backend for getting the organizational status for
   * if the organization is archived or not
   * @param {UserRequest} req
   * @param {Response} res contains JSON object with archived organizations
   * @returns an array of organizations with avatar relations and archived status
   */
  app.get('/api/organization/archive', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    const orgs = await orgRepository.find({
      relations: ['avatar'],
      where: { status: status.archived }
    });
    if (!orgs) {
      return res.status(404).json('Organizations do not exist');
    }
    res.json(orgs);
  });

  /**
   * @description API backend for getting an organization associated by ID
   *
   * @param {UserRequest} req
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the given organization referenced by ID
   */
  app.get('/api/organization/:id', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json('Invalid Organization UserRequest');
    }
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Organization iD');
    }
    const org = await orgRepository.findOne(req.params.id, {
      relations: ['avatar']
    });
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    const resObj = {
      avatarData: org.avatar,
      name: org.name
    };
    res.json(resObj);
  });

  /**
   * @description API backend for updating an organization associated by ID
   * and updates archive status to archived
   * @param {UserRequest} req
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch('/api/organization/:id/archive', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Organization ID');
    }
    const org = await orgRepository.findOne(req.params.id);
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    org.status = status.archived;
    const errors = await validate(org);
    if (errors.length > 0) {
      return res.status(400).json('Organization archive validation failed');
    } else {
      await orgRepository.save(org);
      res.status(200).json('Organization archived successfully');
    }
  });

  /**
   * @description API backend for updating an organization associated by ID
   * and updates archive status to unarchived
   * @param {UserRequest} req ID and Status of the organization
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch('/api/organization/:id/activate', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Organization ID is not valid');
    }
    const org = await orgRepository.findOne(req.params.id);
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    org.status = status.active;
    const errors = await validate(org);
    if (errors.length > 0) {
      return res.status(400).json('Organization activation validation failed');
    } else {
      await orgRepository.save(org);
      res.status(200).json('Organization activated successfully');
    }
  });

  /**
   * @description API backend for updating an organization associated by ID
   * and updates with supplied data
   * @param {UserRequest} req name and ID of the organization to alter
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch('/api/organization/:id', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Organization ID is not valid');
    }
    const org = await orgRepository.findOne(req.params.id);
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    org.name = req.body.name;
    if (req.body.avatar) {
      if (isNaN(+req.body.avatar)) {
        return res.status(400).json('Avatar is not valid');
      }
      org.avatar = req.body.avatar;
    }
    const errors = await validate(org);
    if (errors.length > 0) {
      return res.status(400).send('Organization form validation failed');
    } else {
      await orgRepository.save(org);
      res.status(200).json('Organization patched successfully');
    }
  });

  /**
   * @description API backend for creating an organization
   *
   * @param {UserRequest} req Name, Status, and Avatar
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.post('/api/organization', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    const org = new Organization();
    org.name = req.body.name;
    org.status = status.active;
    if (req.body.avatar) {
      org.avatar = req.body.avatar;
    }
    const errors = await validate(org);
    if (errors.length > 0) {
      return res.status(400).send('Organization form validation failed');
    } else {
      await orgRepository.save(org);
      res.status(200).json('Organization saved successfully');
    }
  });

  /**
   * @description API backend for UserRequesting a file by ID
   * and returns the buffer back to the UI
   * @param {UserRequest} req
   * @param {Response} res contains a buffer with the file data
   * @returns a buffer with the file data
   */
  app.get('/api/file/:id', jwtMiddleware.checkToken, async (req: UserRequest, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json('Invalid File UserRequest');
    }
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid File ID');
    }
    const file = await fileRepository.findOne(req.params.id);
    if (!file) {
      return res.status(404).json('File not found');
    }
    res.send(file.buffer);
  });

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
  app.patch('/api/vulnerability/:vulnId', (req: UserRequest, res) => {
    uploadArray(req, res, async err => {
      if (req.fileExtError) {
        return res.status(400).send(req.fileExtError);
      }
      if (err) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).send('Only File size up to 500 KB allowed');
        }
      } else {
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
      }
    });
  });

  /**
   * @description API backend for creating a vulnerability with the
   * provided req data
   * @param {UserRequest} req array for files, vulnerability form data as JSON
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.post('/api/vulnerability', async (req: UserRequest, res: Response) => {
    uploadArray(req, res, async err => {
      if (req.fileExtError) {
        return res.status(400).json(req.fileExtError);
      }
      if (err) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).send('Only File size up to 500 KB allowed');
        }
      } else {
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
      }
    });
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
    const divSelectorToRemove = '#buttons';
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
