import * as express from 'express';
import * as path from 'path';
import { Request, Response } from 'express';
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
import * as bcrypt from 'bcrypt';

const uuidv4 = require('uuid/v4');
const middleware = require('./middleware');
const jwt = require('jsonwebtoken');
const puppeteer = require('puppeteer');
const multer = require('multer');
var upload = multer({
  limits: { fileSize: '2mb' },
  fileFilter: (req, file, cb) => {
    // Ext validation
    if (!(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')) {
      req.fileExtError = 'Only JPEG and PNG file types allowed';
      cb(null, false);
    } else {
      cb(null, true);
    }
  }
}).single('file');
var uploadArray = multer({
  limits: { fileSize: '2mb' },
  fileFilter: (req, file, cb) => {
    // Ext validation
    if (!(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')) {
      req.fileExtError = 'Only JPEG and PNG file types allowed';
      cb(null, false);
    } else {
      cb(null, true);
    }
  }
}).array('screenshots');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const saltRounds = 10;
let passwordValidator = require('password-validator');
// Create a password schema
let passwordSchema = new passwordValidator();
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
const server_port = process.env.PORT || 5000;
var server_ip_address = process.env.IP || '127.0.0.1';
app.set('port', server_port);
app.set('server_ip_address', server_ip_address);
app.listen(server_port, () => console.log(`Server running on ${server_ip_address}:${server_port}`));

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
   * @param {Request} req
   * @param {Response} res
   * @returns success message
   */
  app.post('/api/user/create', middleware.checkToken, async (req: Request, res: Response) => {
    let user = new User();
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
    bcrypt.genSalt(saltRounds, async (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        user.password = hash;
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
    });
  });

  /**
   * @description Verifies user by comparing UUID
   * @param {Request} req
   * @param {Response} res
   * @returns Success message
   */
  app.get('/api/user/verify/:uuid', async (req: Request, res: Response) => {
    if (req.params.uuid) {
      const user = await userRepository.findOne({ where: { uuid: req.params.uuid } });
      if (user) {
        user.active = true;
        user.uuid = null;
        userRepository.save(user);
        return res.status(200).json(`Email verification successful`);
      } else {
        return res.status(400).json('Email verification failed.  User does not exist.');
      }
    } else {
      return res.status(400).json('UUID is undefined');
    }
  });

  /**
   * @description Verifies user by comparing UUID
   * @param {Request} req
   * @param {Response} res
   * @returns Success message
   */
  app.patch('/api/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json('Email is invalid');
    }
    // user query builder
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
      emailService.sendVerificationEmail(user.uuid, user.email);
      return res.status(200).json('A password reset request has been initiated.  Please check your email.');
    }
  });

  /**
   * @description Updates user password
   * @param {Request} req
   * @param {Response} res
   * @returns Success message
   */
  app.patch('/api/user/password', middleware.checkToken, async (req: Request, res: Response) => {
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
    const user = await userRepository.findOne(req['user']);
    if (user) {
      bcrypt.compare(oldPassword, user.password, (err, valid) => {
        if (valid) {
          bcrypt.genSalt(saltRounds, async (err, salt) => {
            bcrypt.hash(newPassword, salt, async (err, hash) => {
              user.password = hash;
              await userRepository.save(user);
              return res.status(200).json('Password updated successfully');
            });
          });
        } else {
          return res.status(400).json('Incorrect previous password');
        }
      });
    } else {
      return res
        .status(400)
        .json('Unable to update user password at this time.  Please contact an administrator for assistance.');
    }
  });

  /**
   * @description Login to the application
   * @param {Request} req
   * @param {Response} res
   * @returns valid JWT token
   */
  app.post('/api/login', async (req: Request, res: Response) => {
    const { password, email } = req.body;
    // use querybuilder
    //const user = await userRepository.findOne({ where: { email } });
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
      bcrypt.compare(password, user.password, (err, valid) => {
        if (valid) {
          // TODO: Generate secret key and store in env var
          let token = jwt.sign({ email: user.email, userId: user.id }, 'keyboardcat', { expiresIn: '.5h' });
          return res.status(200).json(token);
        } else {
          return res.status(400).json('Invalid email or password');
        }
      });
    } else {
      return res.status(400).json('Invalid email or password');
    }
  });

  /**
   * @description Upload a file
   * @param {Request} req
   * @param {Response} res
   * @returns file ID
   */
  app.post('/api/upload', middleware.checkToken, async (req: Request, res: Response) => {
    // TODO Virus scanning
    upload(req, res, async err => {
      if (req['fileExtError']) {
        return res.status(400).send(req['fileExtError']);
      }
      if (err) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).send('Only File size up to 500 KB allowed');
        }
      } else {
        if (!req['file']) {
          return res.status(400).send('You must provide a file');
        } else {
          let file = new File();
          file = req['file'];
          const newFile = await fileRepository.save(file);
          res.json(newFile.id);
        }
      }
    });
  });

  /**
   * @description API backend for getting organization data
   * returns all organizations when triggered
   * @param {Request} req
   * @param {Response} res contains JSON object with all organization data
   * @returns an array of organizations with avatar relations
   */
  app.get('/api/organization', middleware.checkToken, async function(req: Request, res: Response) {
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
   * @param {Request} req
   * @param {Response} res contains JSON object with archived organizations
   * @returns an array of organizations with avatar relations and archived status
   */
  app.get('/api/organization/archive', middleware.checkToken, async function(req: Request, res: Response) {
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
   * @param {Request} req
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the given organization referenced by ID
   */
  app.get('/api/organization/:id', middleware.checkToken, async function(req: Request, res: Response) {
    if (!req.params.id) {
      return res.status(400).json('Invalid Organization request');
    }
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Organization iD');
    }
    let org = await orgRepository.findOne(req.params.id, {
      relations: ['avatar']
    });
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    let resObj = {
      name: org.name,
      avatarData: org.avatar
    };
    res.json(resObj);
  });

  /**
   * @description API backend for updating an organization associated by ID
   * and updates archive status to archived
   * @param {Request} req
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch('/api/organization/:id/archive', middleware.checkToken, async function(req: Request, res: Response) {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Organization ID');
    }
    let org = await orgRepository.findOne(req.params.id);
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
   * @param {Request} req ID and Status of the organization
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch('/api/organization/:id/activate', middleware.checkToken, async function(req: Request, res: Response) {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Organization ID is not valid');
    }
    let org = await orgRepository.findOne(req.params.id);
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
   * @param {Request} req name and ID of the organization to alter
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch('/api/organization/:id', middleware.checkToken, async function(req: Request, res: Response) {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Organization ID is not valid');
    }
    let org = await orgRepository.findOne(req.params.id);
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
   * @param {Request} req Name, Status, and Avatar
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.post('/api/organization', middleware.checkToken, async (req: Request, res: Response) => {
    let org = new Organization();
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
   * @description API backend for requesting a file by ID
   * and returns the buffer back to the UI
   * @param {Request} req
   * @param {Response} res contains a buffer with the file data
   * @returns a buffer with the file data
   */
  app.get('/api/file/:id', middleware.checkToken, async function(req: Request, res: Response) {
    if (!req.params.id) {
      return res.status(400).json('Invalid File request');
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
   * @description API backend for requesting an asset associated by ID
   * and returns it to the UI
   * @param {Request} req
   * @param {Response} res contains JSON object with the asset data
   * @returns a JSON object with the asset data
   */
  app.get('/api/organization/asset/:id', middleware.checkToken, async function(req: Request, res: Response) {
    if (!req.params.id) {
      return res.status(400).json('Invalid Asset request');
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
   * @description API backend for requesting an assessment associated by ID
   * and returns it to the UI
   * @param {Request} req
   * @param {Response} res contains JSON object with the assessment data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get('/api/assessment/:id', middleware.checkToken, async function(req: Request, res: Response) {
    if (!req.params.id) {
      return res.status(400).json('Invalid Assessment request');
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
   * @description API backend for requesting a vulnerability and returns it to the UI
   *
   * @param {Request} req
   * @param {Response} res contains JSON object with the vulnerability data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get('/api/assessment/:id/vulnerability', middleware.checkToken, async function(req: Request, res: Response) {
    if (!req.params.id) {
      return res.status(400).json('Invalid Vulnerability request');
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
   * @description API backend for requesting a vulnerability associated by ID
   * and updates archive status
   * @param {Request} req
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get('/api/vulnerability/:vulnId', middleware.checkToken, async (req: Request, res: Response) => {
    if (!req.params.vulnId) {
      return res.status(400).send('Invalid Vulnerability request');
    }
    if (isNaN(+req.params.vulnId)) {
      return res.status(400).send('Invalid Vulnerability ID');
    }
    // TODO: Utilize createQueryBuilder to only return screenshot IDs and not the full object
    let vuln = await vulnerabilityRepository.findOne(req.params.vulnId, {
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
   * @param {Request} req vulnID is required
   * @param {Response} res contains JSON object with the success/fail
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.delete('/api/vulnerability/:vulnId', middleware.checkToken, async (req: Request, res: Response) => {
    if (!req.params.vulnId) {
      return res.status(400).send('Invalid vulnerability request');
    }
    if (isNaN(+req.params.vulnId)) {
      return res.status(400).send('Invalid vulnerability ID');
    }
    let vuln = await vulnerabilityRepository.findOne(req.params.vulnId);
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
   * @param {Request} req vulnId is required
   * @param {Response} res contains JSON object with the status of the req
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch('/api/vulnerability/:vulnId', (req, res) => {
    uploadArray(req, res, async err => {
      if (req['fileExtError']) {
        return res.status(400).send(req['fileExtError']);
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
        let vulnerability = await vulnerabilityRepository.findOne(req.params.vulnId);
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
            let existingScreenshots = await fileRepository.find({ where: { vulnerability: vulnerability.id } });
            let existingScreenshotIds = existingScreenshots.map(screenshot => screenshot.id);
            let screenshotsToDelete = JSON.parse(req.body.screenshotsToDelete);
            // We only want to remove the files associated to the vulnerability
            screenshotsToDelete = existingScreenshotIds.filter(value => screenshotsToDelete.includes(value));
            for (const screenshotId of screenshotsToDelete) {
              fileRepository.delete(screenshotId);
            }
          }
          // Save new files added
          for (let screenshot of req['files']) {
            let file = new File();
            file = screenshot;
            file.vulnerability = vulnerability;
            const errors = await validate(file);
            if (errors.length > 0) {
              return res.status(400).send('File validation failed');
            } else {
              await fileRepository.save(file);
            }
          }
          // Remove deleted problem locations
          if (req.body.problemLocations.length) {
            const clientProdLocs = JSON.parse(req.body.problemLocations);
            let clientProdLocsIds = clientProdLocs.map(value => value.id);
            let existingProbLocs = await probLocRepository.find({ where: { vulnerability: vulnerability.id } });
            let existingProbLocIds = existingProbLocs.map(probLoc => probLoc.id);
            let prodLocsToDelete = existingProbLocIds.filter(value => !clientProdLocsIds.includes(value));
            for (const probLoc of prodLocsToDelete) {
              probLocRepository.delete(probLoc);
            }
            // Update problem locations
            for (let probLoc of clientProdLocs) {
              if (probLoc && probLoc.location && probLoc.target) {
                let problemLocation = new ProblemLocation();
                problemLocation = probLoc;
                problemLocation.vulnerability = vulnerability;
                const errors = await validate(problemLocation);
                if (errors.length > 0) {
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
            let clientResourceIds = clientResources.map(value => value.id);
            let existingResources = await resourceRepository.find({ where: { vulnerability: vulnerability.id } });
            let existingResourceIds = existingResources.map(resource => resource.id);
            let resourcesToDelete = existingResourceIds.filter(value => !clientResourceIds.includes(value));
            for (const resource of resourcesToDelete) {
              resourceRepository.delete(resource);
            }
            // Update resources
            for (let clientResource of clientResources) {
              if (clientResource.description && clientResource.url) {
                let resource = new Resource();
                resource = clientResource;
                resource.vulnerability = vulnerability;
                const errors = await validate(resource);
                if (errors.length > 0) {
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
   * @param {Request} req array for files, vulnerability form data as JSON
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.post('/api/vulnerability', async (req, res) => {
    uploadArray(req, res, async err => {
      if (req['fileExtError']) {
        return res.status(400).json(req['fileExtError']);
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
        let assessment = await assessmentRepository.findOne(req.body.assessment);
        if (!assessment) {
          return res.status(404).json('Assessment does not exist');
        }
        let vulnerability = new Vulnerability();
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
          for (let screenshot of req['files']) {
            let file = new File();
            file = screenshot;
            file.vulnerability = vulnerability;
            const errors = await validate(file);
            if (errors.length > 0) {
              return res.status(400).send('File validation failed');
            } else {
              await fileRepository.save(file);
            }
          }
          // Save problem locations
          const problemLocations = JSON.parse(req.body.problemLocations);
          for (let probLoc of problemLocations) {
            if (probLoc && probLoc.location && probLoc.target) {
              let problemLocation = new ProblemLocation();
              problemLocation = probLoc;
              problemLocation.vulnerability = vulnerability;
              const errors = await validate(problemLocation);
              if (errors.length > 0) {
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
          for (let resource of resources) {
            if (resource.description && resource.url) {
              let newResource = new Resource();
              newResource = resource;
              newResource.vulnerability = vulnerability;
              const errors = await validate(newResource);
              if (errors.length > 0) {
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
   * @param {Request} req name, organization
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.post('/api/organization/:id/asset', middleware.checkToken, async (req: Request, res: Response) => {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Organization ID is not valid');
    }
    let org = await orgRepository.findOne(req.params.id);
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    if (!req.body.name) {
      return res.status(400).send('Asset is not valid');
    }
    let asset = new Asset();
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
   * @description API backend for requesting an organization asset associated by ID
   * and returns the data
   * @param {Request} req assetId, orgId
   * @param {Response} res contains JSON object with the asset data tied to the org
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get('/api/organization/:id/asset/:assetId', middleware.checkToken, async (req: Request, res: Response) => {
    if (isNaN(+req.params.assetId)) {
      return res.status(400).json('Invalid Asset ID');
    }
    if (!req.params.assetId) {
      return res.status(400).send('Invalid Asset request');
    }
    let asset = await assetRepository.findOne(req.params.assetId);
    if (!asset) {
      return res.status(404).send('Asset does not exist');
    }
    res.status(200).json(asset);
  });

  /**
   * @description API backend for updating an organization asset associated by ID
   * and updates the data
   * @param {Request} req name, organization, assetId
   * @param {Response} res contains JSON object with the asset data tied to the org
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch('/api/organization/:id/asset/:assetId', middleware.checkToken, async function(req: Request, res: Response) {
    if (isNaN(+req.params.assetId) || !req.params.assetId) {
      return res.status(400).json('Asset ID is not valid');
    }
    let asset = await assetRepository.findOne(req.params.assetId);
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
  });

  /**
   * @description API backend for creating an assessment
   *
   * @param {Request} req assessment object data
   * @param {Response} res contains JSON object with the success/fail status
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.post('/api/assessment', middleware.checkToken, async (req: Request, res: Response) => {
    if (isNaN(req.body.asset)) {
      return res.status(400).json('Asset ID is invalid');
    }
    let asset = await assetRepository.findOne(req.body.asset);
    if (!asset) {
      return res.status(404).json('Asset does not exist');
    }
    let assessment = new Assessment();
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
   * @description API backend for requesting assessment by ID association
   * @param {Request} req assetId, assessmentId
   * @param {Response} res contains JSON object with the assessment data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get(
    '/api/asset/:assetId/assessment/:assessmentId',
    middleware.checkToken,
    async (req: Request, res: Response) => {
      if (!req.params.assessmentId) {
        return res.status(400).send('Invalid assessment request');
      }
      if (isNaN(+req.params.assessmentId)) {
        return res.status(400).json('Invalid Assessment ID');
      }
      let assessment = await assessmentRepository.findOne(req.params.assessmentId);
      if (!assessment) {
        return res.status(404).json('Assessment does not exist');
      }
      res.status(200).json(assessment);
    }
  );

  /**
   * @description API backend for updating a assessment associated by ID
   * @param {Request} req assessment JSON object with assessment data
   * @param {Response} res contains JSON object with the organization data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.patch('/api/asset/:assetId/assessment/:assessmentId', middleware.checkToken, async function(
    req: Request,
    res: Response
  ) {
    if (!req.params.assessmentId) {
      return res.status(400).send('Invalid assessment request');
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
  });

  /**
   * @description API backend for requesting a report associated by assessmentId
   * @param {Request} req assessmentId
   * @param {Response} res contains JSON object with the report data
   * @returns a JSON object with the proper http response specifying success/fail
   */
  app.get('/api/assessment/:assessmentId/report', middleware.checkToken, async (req: Request, res: Response) => {
    if (!req.params.assessmentId) {
      return res.status(400).send('Invalid report request');
    }
    if (isNaN(+req.params.assessmentId)) {
      return res.status(400).json('Invalid Assessment ID');
    }
    let assessment = await assessmentRepository.findOne(req.params.assessmentId, { relations: ['asset'] });
    let asset = await assetRepository.findOne(assessment.asset.id, {
      relations: ['organization']
    });
    let organization = await orgRepository.findOne(asset.organization.id);
    let vulnerabilities = await vulnerabilityRepository
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
    let report = new Report();
    report.org = organization;
    report.asset = asset;
    report.assessment = assessment;
    report.vulns = vulnerabilities;
    res.status(200).json(report);
  });

  /**
   * @description API backend for report generation with Puppeteer
   * @param {Request} req orgId, assetId, assessmentId
   * @param {Response} res contains all data associated and generates a
   * new html page with PDF Report
   * @returns a new page generated by Puppeteer with a Report in PDF format
   */
  app.post('/api/report/generate', middleware.checkToken, async (req: Request, res: Response) => {
    if (!req.body.orgId || !req.body.assetId || !req.body.assessmentId) {
      return res.status(400).send('Invalid report parameters');
    }
    let url =
      env === 'production'
        ? `${process.env.PROD_URL}/#/organization/${req.body.orgId}/asset/${req.body.assetId}/assessment/${req.body.assessmentId}/report`
        : `${process.env.DEV_URL}/#/organization/${req.body.orgId}/asset/${req.body.assetId}/assessment/${req.body.assessmentId}/report`;
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const filePath = path.join(__dirname, '../temp_report.pdf');
    await page.goto(url, { waitUntil: 'networkidle0' });
    const div_selector_to_remove = '#buttons';
    await page.evaluate(sel => {
      var elements = document.querySelectorAll(sel);
      for (var i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    }, div_selector_to_remove);
    await page.pdf({ path: filePath, format: 'A4' });
    await browser.close();
    const file = fs.createReadStream(filePath);
    const stat = fs.statSync(filePath);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    file.pipe(res);
    fs.unlink(filePath, (err, res) => {
      if (err) {
        // handle error here
      } else {
        console.info('File removed');
      }
    });
  });
});
