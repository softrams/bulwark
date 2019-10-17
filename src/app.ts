import * as express from 'express';
import * as path from 'path';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
import { Organization } from './entity/Organization';
import { Asset } from './entity/Asset';
import { Assessment } from './entity/Assessment';
import { Vulnerability } from './entity/Vulnerability';

const cors = require('cors');

// create typeorm connection
createConnection().then(connection => {
  const app = express();
  app.use(cors());
  app.use(
    express.static(path.join(__dirname, '../frontend/dist/frontend'), {
      etag: false
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

  // start express server
  const server_port = process.env.PORT || 5000;
  var server_ip_address = process.env.IP || '127.0.0.1';
  app.set('port', server_port);
  app.set('server_ip_address', server_ip_address);
  app.listen(server_port, () =>
    console.log(`Server running on ${server_ip_address}:${server_port}`)
  );
  // register routes
  const orgRepository = connection.getRepository(Organization);
  const assetRepository = connection.getRepository(Asset);
  const assessmentRepository = connection.getRepository(Assessment);
  const vulnerabilityRepository = connection.getRepository(Vulnerability);

  app.get('/api/organization', async function(req: Request, res: Response) {
    const orgs = await orgRepository.find();
    res.json(orgs);
  });

  app.get('/api/organization/asset/:id', async function(
    req: Request,
    res: Response
  ) {
    const asset = await assetRepository.find({
      where: { organization: req.params.id }
    });
    res.json(asset);
  });

  app.get('/api/assessment/:id', async function(
    req: Request,
    res: Response
  ) {
    const assessment = await assessmentRepository.find({
      where: { asset: req.params.id }
    });
    res.json(assessment);
  });

  app.get('/api/vulnerabilities/:id', async function(
    req: Request,
    res: Response
  ) {
    const vulnerabilities = await vulnerabilityRepository.find({
      where: { vulnerability: req.params.id }
    });
    res.json(vulnerabilities);
  });  
});
