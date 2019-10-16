import * as express from 'express';
import * as path from 'path';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
const cors = require('cors');

// create typeorm connection
createConnection().then(connection => {
  // create and setup express app
});

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
