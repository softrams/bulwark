import * as express from 'express';
import * as path from 'path';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
import { Organization } from './entity/Organization';
import { Asset } from './entity/Asset';
import { Assessment } from './entity/Assessment';
import { Vulnerability } from './entity/Vulnerability';

import { File } from './entity/File';
const puppeteer = require('puppeteer');
const multer = require('multer');
var upload = multer();
const fs = require('fs');

const helmet = require('helmet');
const cors = require('cors');
import { validate } from 'class-validator';

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

  app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
    // TODO Virus scanning, file type validation, etc
    if (!req['file']) {
      return res.status(400).send('You must provide a file');
    } else {
      let file = new File();
      file.fieldName = req['file'].fieldname;
      file.name = req['file'].originalname;
      file.encoding = req['file'].encoding;
      file.mimetype = req['file'].mimetype;
      file.buffer = req['file'].buffer;
      file.size = req['file'].size;
      const newFile = await fileRepository.save(file);
      res.json(newFile.id);
    }
  });

  app.get('/api/organization', async function(req: Request, res: Response) {
    const orgs = await orgRepository.find({ relations: ['avatar'] });
    res.json(orgs);
  });

  app.get('/api/organization/:id', async function(req: Request, res: Response) {
    let org = await orgRepository.findOne({ where: { id: req.params.id }, relations: ['avatar'] });
    let resObj = {
      name: org.name,
      avatarData: org.avatar
    };
    res.json(resObj);
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
      res.json('Organization patched succesfully').status(200);
    }
  });

  app.post('/api/organization', async (req: Request, res: Response) => {
    let org = new Organization();
    org.name = req.body.name;
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

  app.get('/api/organization/file/:id', async function(req: Request, res: Response) {
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
    let vuln = await vulnerabilityRepository.findOne(req.params.vulnId, { relations: ['screenshots'] });
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

  app.patch('/api/vulnerability/:vulnId', upload.array('screenshots'), async (req, res) => {
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
        file.buffer = screenshot.buffer;
        file.fieldName = screenshot.fieldName;
        file.encoding = screenshot.encoding;
        file.mimetype = screenshot.mimetype;
        file.size = screenshot.size;
        file.name = screenshot.originalname;
        file.vulnerability = vulnerability;
        const errors = await validate(file);
        if (errors.length > 0) {
          return res.status(400).send('File validation failed');
        } else {
          await fileRepository.save(file);
        }
      }
      res.json('Vulnerability saved successfully').status(200);
    }
  });

  app.post('/api/vulnerability', upload.array('screenshots'), async (req, res) => {
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
      for (let screenshot of req['files']) {
        let file = new File();
        file.buffer = screenshot.buffer;
        file.fieldName = screenshot.fieldName;
        file.encoding = screenshot.encoding;
        file.mimetype = screenshot.mimetype;
        file.size = screenshot.size;
        file.name = screenshot.originalname;
        file.vulnerability = vulnerability;
        const errors = await validate(file);
        if (errors.length > 0) {
          return res.status(400).send('File validation failed');
        } else {
          await fileRepository.save(file);
        }
      }
      res.json('Vulnerability saved successfully').status(200);
    }
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
    let asset = await assetRepository.findOne({ where: { id: req.params.assetId, organization: req.params.id } });
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
      res.json('Asset patched successfully').status(200);
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
      res.json('Assessment created succesfully').status(200);
    }
  });

  app.get('/api/asset/:assetId/assessment/:assessmentId', async (req: Request, res: Response) => {
    if (!req.params.assetId || !req.params.assessmentId) {
      return res.status(400).send('Invalid assessment request');
    }
    let asset = await assessmentRepository.findOne({
      where: { id: req.params.assessmentId, asset: req.params.assetId }
    });
    res.status(200).json(asset);
  });

  app.patch('/api/asset/:assetId/assessment/:assessmentId', async function(req: Request, res: Response) {
    let assessment = await assessmentRepository.findOne({ where: { id: req.params.assessmentId } });
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
      res.json('Asset patched successfully').status(200);
    }
  });
  // puppeteer generate
  app.get('/api/report/generate', async (req: Request, res: Response) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const filePath = path.join(__dirname, '../temp_report.pdf');
    await page.goto('', { waitUntil: 'networkidle2' });
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
