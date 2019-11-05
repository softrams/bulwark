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
import { status } from './enums/status-enum';

const puppeteer = require('puppeteer');
const multer = require('multer');
var upload = multer({
  limits: { fileSize: 1048576 }, // 1 MB in Binary
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
  limits: { fileSize: 1048576 }, // 1 MB in Binary
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
createConnection().then((connection) => {
  // register routes
  const orgRepository = connection.getRepository(Organization);
  const assetRepository = connection.getRepository(Asset);
  const assessmentRepository = connection.getRepository(Assessment);
  const vulnerabilityRepository = connection.getRepository(Vulnerability);
  const fileRepository = connection.getRepository(File);
  const probLocRepository = connection.getRepository(ProblemLocation);
  const resourceRepository = connection.getRepository(Resource);

  app.post('/api/upload', async (req: Request, res: Response) => {
    // TODO Virus scanning
    upload(req, res, async (err) => {
      if (req['fileExtError']) {
        return res.status(400).send(req['fileExtError']);
      }
      if (err) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).send(err.message);
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

  app.get('/api/organization', async function(req: Request, res: Response) {
    const orgs = await orgRepository.find({ relations: ['avatar'], where: { status: status.active } });
    res.json(orgs);
  });

  app.get('/api/organization/archive', async function(req: Request, res: Response) {
    const orgs = await orgRepository.find({ relations: ['avatar'], where: { status: status.archived } });
    res.json(orgs);
  });

  app.get('/api/organization/:id', async function(req: Request, res: Response) {
    let org = await orgRepository.findOne(req.params.id, { relations: ['avatar'] });
    let resObj = {
      name: org.name,
      avatarData: org.avatar
    };
    res.json(resObj);
  });

  app.patch('/api/organization/:id/archive', async function(req: Request, res: Response) {
    let org = new Organization();
    org.id = +req.params.id;
    org.status = status.archived;
    const errors = await validate(org);
    if (errors.length > 0) {
      return res.status(400).send('Organization archive validation failed');
    } else {
      await orgRepository.save(org);
      res.status(200).json('Organization archived succesfully');
    }
  });

  app.patch('/api/organization/:id/activate', async function(req: Request, res: Response) {
    let org = new Organization();
    org.id = +req.params.id;
    org.status = status.active;
    const errors = await validate(org);
    if (errors.length > 0) {
      return res.status(400).send('Organization activation validation failed');
    } else {
      await orgRepository.save(org);
      res.status(200).json('Organization activated succesfully');
    }
  });

  app.patch('/api/organization/:id', async function(req: Request, res: Response) {
    let org = new Organization();
    org.name = req.body.name;
    org.id = +req.params.id;
    if (req.body.avatar) {
      org.avatar = req.body.avatar;
    }
    const errors = await validate(org);
    if (errors.length > 0) {
      return res.status(400).send('Organization form validation failed');
    } else {
      await orgRepository.save(org);
      res.status(200).json('Organization patched succesfully');
    }
  });

  app.post('/api/organization', async (req: Request, res: Response) => {
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
      const newOrg = await orgRepository.save(org);
      res.send(newOrg);
    }
  });

  app.get('/api/file/:id', async function(req: Request, res: Response) {
    const file = await fileRepository.findOne(req.params.id);
    res.send(file.buffer);
  });

  app.get('/api/organization/asset/:id', async function(req: Request, res: Response) {
    const asset = await assetRepository.find({
      where: { organization: req.params.id }
    });
    res.json(asset);
  });

  app.get('/api/assessment/:id', async function(req: Request, res: Response) {
    const assessment = await assessmentRepository.find({
      where: { asset: req.params.id }
    });
    res.json(assessment);
  });

  app.get('/api/assessment/:id/vulnerability', async function(req: Request, res: Response) {
    const vulnerabilities = await vulnerabilityRepository.find({
      where: { assessment: req.params.id }
    });
    res.json(vulnerabilities);
  });

  app.get('/api/vulnerability/:vulnId', async (req: Request, res: Response) => {
    if (!req.params.vulnId) {
      return res.status(400).send('Invalid Vulnerability request');
    }
    // TODO: Utilize createQueryBuilder to only return screenshot IDs and not the full object
    let vuln = await vulnerabilityRepository.findOne(req.params.vulnId, {
      relations: ['screenshots', 'problemLocations', 'resources']
    });
    res.status(200).json(vuln);
  });

  app.delete('/api/vulnerability/:vulnId', async (req: Request, res: Response) => {
    if (!req.params.vulnId) {
      return res.status(400).send('Vulnerability deletion failed.  Vulnerability does not exist.');
    }
    let vuln = await vulnerabilityRepository.findOne(req.params.vulnId);
    if (!vuln) {
      return res.status(400).send('Vulnerability deletion failed.  Vulnerability does not exist.');
    } else {
      await vulnerabilityRepository.delete(vuln);
      res.status(200).json('Vulnerability successfully deleted');
    }
  });

  app.patch('/api/vulnerability/:vulnId', (req, res) => {
    uploadArray(req, res, async (err) => {
      if (req['fileExtError']) {
        return res.status(400).send(req['fileExtError']);
      }
      if (err) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).send(err.message);
        }
      } else {
        let vulnerability = new Vulnerability();
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
        vulnerability.assessment = req.body.assessment;
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
            let existingScreenshotIds = existingScreenshots.map((screenshot) => screenshot.id);
            let screenshotsToDelete = JSON.parse(req.body.screenshotsToDelete);
            // We only want to remove the files associated to the vulnerability
            screenshotsToDelete = existingScreenshotIds.filter((value) => screenshotsToDelete.includes(value));
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
            let clientProdLocsIds = clientProdLocs.map((value) => value.id);
            let existingProbLocs = await probLocRepository.find({ where: { vulnerability: vulnerability.id } });
            let existingProbLocIds = existingProbLocs.map((probLoc) => probLoc.id);
            let prodLocsToDelete = existingProbLocIds.filter((value) => !clientProdLocsIds.includes(value));
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
            let clientResourceIds = clientResources.map((value) => value.id);
            let existingResources = await resourceRepository.find({ where: { vulnerability: vulnerability.id } });
            let existingResourceIds = existingResources.map((resource) => resource.id);
            let resourcesToDelete = existingResourceIds.filter((value) => !clientResourceIds.includes(value));
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
          return res.status(200).json('Vulnerability saved successfully');
        }
      }
    });
  });

  app.post('/api/vulnerability', async (req, res) => {
    uploadArray(req, res, async (err) => {
      if (req['fileExtError']) {
        return res.status(400).json(req['fileExtError']);
      }
      if (err) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).send(err.message);
        }
      } else {
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
        vulnerability.assessment = req.body.assessment;
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

  app.post('/api/organization/:id/asset', async (req: Request, res: Response) => {
    let asset = new Asset();
    if (isNaN(req.body.organization) || !req.body.name) {
      return res.status(400).send('Invalid Asset request');
    }
    asset.name = req.body.name;
    asset.organization = req.body.organization;
    const errors = await validate(asset);
    if (errors.length > 0) {
      res.status(400).send('Asset form validation failed');
    } else {
      const newAsset = await assetRepository.save(asset);
      res.json(newAsset);
    }
  });

  app.get('/api/organization/:id/asset/:assetId', async (req: Request, res: Response) => {
    if (!req.params.id || !req.params.assetId) {
      return res.status(400).send('Invalid Asset request');
    }
    let asset = await assetRepository.findOne(req.params.assetId);
    res.status(200).json(asset);
  });

  app.patch('/api/organization/:id/asset/:assetId', async function(req: Request, res: Response) {
    let asset = new Asset();
    asset.name = req.body.name;
    asset.organization = req.body.organization;
    asset.id = +req.params.assetId;
    const errors = await validate(asset);
    if (errors.length > 0) {
      return res.status(400).send('Asset form validation failed');
    } else {
      await assetRepository.save(asset);
      res.status(200).json('Asset patched successfully');
    }
  });

  app.post('/api/assessment', async (req: Request, res: Response) => {
    let assessment = new Assessment();
    assessment.name = req.body.name;
    assessment.asset = req.body.asset;
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

  app.get('/api/asset/:assetId/assessment/:assessmentId', async (req: Request, res: Response) => {
    if (!req.params.assetId || !req.params.assessmentId) {
      return res.status(400).send('Invalid assessment request');
    }
    let assessment = await assessmentRepository.findOne(req.params.assessmentId);
    res.status(200).json(assessment);
  });

  app.patch('/api/asset/:assetId/assessment/:assessmentId', async function(req: Request, res: Response) {
    let assessment = await assessmentRepository.findOne(req.params.assessmentId);
    assessment = req.body;
    assessment.id = +req.params.assessmentId;
    if (assessment.startDate > assessment.endDate) {
      return res.status(400).send('The assessment start date can not be later than the end date');
    }
    const errors = await validate(assessment);
    if (errors.length > 0) {
      return res.status(400).send('Assessment form validation failed');
    } else {
      await assessmentRepository.save(assessment);
      res.status(200).json('Asset patched successfully');
    }
  });

  app.get('/api/assessment/:assessmentId/report', async (req: Request, res: Response) => {
    if (!req.params.assessmentId) {
      return res.status(400).send('Invalid report request');
    }
    let report = new Report();
    let assessment = await assessmentRepository.findOne(req.params.assessmentId, { relations: ['asset'] });
    let asset = await assetRepository.findOne(assessment.asset.id, { relations: ['organization'] });
    let organization = await orgRepository.findOne(asset.organization.id);
    let vulnerabilities = await vulnerabilityRepository
      .createQueryBuilder('vuln')
      .leftJoinAndSelect('vuln.screenshots', 'screenshot')
      .leftJoinAndSelect('vuln.problemLocations', 'problemLocation')
      .leftJoinAndSelect('vuln.resources', 'resource')
      .where('vuln.assessmentId = :assessmentId', { assessmentId: assessment.id })
      .select([
        'vuln',
        'screenshot.id',
        'screenshot.originalname',
        'screenshot.mimetype',
        'problemLocation',
        'resource'
      ])
      .getMany();
    report.org = organization;
    report.asset = asset;
    report.assessment = assessment;
    report.vulns = vulnerabilities;
    res.status(200).json(report);
  });

  // Puppeteer report generation functionality
  app.post('/api/report/generate', async (req: Request, res: Response) => {
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
    await page.evaluate((sel) => {
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
