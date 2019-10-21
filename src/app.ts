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
      file.originalName = req['file'].originalname;
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
      const newOrg = await orgRepository.save(org);
      res.send(newOrg);
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
    const file = await fileRepository.findOne({
      where: { id: req.params.id }
    });
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

  app.get('/api/vulnerability/:id', async function(req: Request, res: Response) {
    const vulnerabilities = await vulnerabilityRepository.find({
      where: { vulnerability: req.params.id }
    });
    res.json(vulnerabilities);
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
      res.send(newAsset);
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
