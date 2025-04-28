<p align="center">
  <img width="350" src="frontend/src/assets/logo.png">
</p>

<p style="text-align: center;">An organizational asset and vulnerability management tool, with Jira integration, designed for generating application security reports.</p>

<p align="center">
<img src='https://img.shields.io/badge/License-MIT-yellow.svg'>
<img src='https://github.com/softrams/bulwark/workflows/build/badge.svg'>
<img src='https://github.com/softrams/bulwark/workflows/CodeQL/badge.svg'>
<img src='https://img.shields.io/docker/cloud/build/softramsdocker/bulwark'>
<img src='https://img.shields.io/docker/pulls/softramsdocker/bulwark'>
</p>

## Features

- Multi-client Vulnerability Management
- Security Report Generation
- Jira Integration
- Team-based Roles Authorization
- API Key & Management
- Email Integration
- Markdown Support
- User Activation/Deactivation (Admin)

## Note

Please keep in mind, this project is in early development.

## Demo

![Bulwark Walkthrough Demo](https://github.com/softrams/media/blob/main/bulwark_report_demo.gif)

## Jira Integration

![Bulwark Jira Demo](https://github.com/softrams/media/blob/main/bulwark_jira_demo.gif)

## Launch with Docker

1. Install [Docker](https://www.docker.com/)
2. Create a `.env` file and supply the following properties:

```
MYSQL_DATABASE="bulwark"
MYSQL_PASSWORD="bulwark"
MYSQL_ROOT_PASSWORD="bulwark"
MYSQL_USER="root"
MYSQL_DB_CHECK="mysql"
DB_PASSWORD="bulwark"
DB_URL="172.16.16.3"
DB_ROOT="root"
DB_USERNAME="bulwark"
DB_PORT=3306
DB_NAME="bulwark"
DB_TYPE="mysql"
NODE_ENV="production"
DEV_URL="http://localhost:4200"
SERVER_ADDRESS="http://localhost"
PORT=4500
JWT_KEY="changeme"
JWT_REFRESH_KEY="changeme"
CRYPTO_SECRET="changeme"
CRYPTO_SALT="changeme"
```

Build and start Bulwark containers:

```
docker-compose up
```

Start/Stop Bulwark containers:

```
docker-compose start
docker-compose stop
```

Remove Bulwark containers:

```
docker-compose down
```

Bulwark will be available at [localhost:4500](http://localhost:4500)

## Local Installation

```
$ git clone (url)
$ cd bulwark
$ npm install
```

Running `npm install` will install both server-side and client-side modules. Furthermore, it will run the script `npm run config` which will dynamically set the environment variables in addition to updating the [Angular environment](https://angular.io/guide/build).

### Development Mode

Set `NODE_ENV="development"`

```
$ npm run config
$ npm run start:dev
```

### Production Mode

Set `NODE_ENV="production"`
_Please note: `npm install` will automatically build in production mode_

```
$ npm run config
$ npm run build:prod
$ npm start
```

### Environment variables

Create a `.env` file on the root directory. This will be parsed with [dotenv](https://www.npmjs.com/package/dotenv) by the application.

#### `DB_PASSWORD`

`DB_PASSWORD="somePassword"`

Set this variable to database password

#### `DB_USERNAME`

`DB_USERNAME="foobar"`

Set this variable to database user name

#### `DB_URL`

`DB_URL=something-foo-bar.dbnet`

Set this variable to database URL

#### `DB_PORT`

`DB_PORT=3306`

Set this variable to database port

#### `DB_NAME`

`DB_NAME="foobar"`

Set this variable to database connection name

#### `DB_TYPE`

`DB_TYPE="mysql"`

The application was developed using a MySQL database. See the [typeorm](https://github.com/typeorm/typeorm/blob/master/docs/connection-options.md#common-connection-options) documentation for more database options.

#### `NODE_ENV`

`NODE_ENV=production`

Set this variable to determine node environment

#### `DEV_URL="http://localhost:4200"`

Used by Angular to build and serve the application

#### `SERVER_ADDRESS="http://localhost"`

Update if a different server address is required

#### `PORT=4500`

Update if a different server port is required

#### `JWT_KEY`

`JWT_KEY="changeMe"`

Set this variable to the JWT secret

#### `JWT_REFRESH_KEY`

`JWT_REFRESH_KEY="changeMe"`

Set this variable to the refresh JWT secret

#### `CRYPTO_SECRET`

`CRYPTO_SECRET="randomValue"`

Set this variable to the [Scrypt](https://nodejs.org/api/crypto.html#crypto_crypto_scryptsync_password_salt_keylen_options) password.

#### `CRYPTO_SALT`

`CRYPTO_SECRET="randomValue"`

Set this variable to the [Scrypt](https://nodejs.org/api/crypto.html#crypto_crypto_scryptsync_password_salt_keylen_options) salt.

### Empty `.env` file template

```
DB_PASSWORD=""
DB_URL=""
DB_USERNAME=""
DB_PORT=3306
DB_NAME=""
DB_TYPE=""
NODE_ENV=""
DEV_URL="http://localhost:4200"
SERVER_ADDRESS="http://localhost"
PORT=4500
JWT_KEY=""
JWT_REFRESH_KEY=""
CRYPTO_SECRET=""
CRYPTO_SALT=""
```

### Note on M1/M2 Macs
```
Install sqlite3: 
brew install sqlite3

Export compiler related env variables: 
export LDFLAGS="-L/opt/homebrew/opt/sqlite/lib"
export CPPFLAGS="-I/opt/homebrew/opt/sqlite/include"
export PKG_CONFIG_PATH="/opt/homebrew/opt/sqlite/lib/pkgconfig"
export NODE_OPTIONS=--openssl-legacy-provider

Prepare for a fresh install:
rm -rf node_modules
npm cache verify
npm i --force
```

### Create Initial Database Migration

1. Create the initial database migration

```
$ npm run migration:init
```

2. Run the initial database migration

```
$ npm run migration:run
```

## Default credentials

A user account is created on initial startup with the following credentials:

- email: `admin@example.com`
- password: `changeMe`

Upon first login, update the default user password under the profile section.

## Roles

The application utilizes least privilege access with team-based authorization. Teams are assigned a role which determines the features available to that specific team. A user will inherit roles from team membership. Administrators have team management access and must assign users to teams. Initially, users are created with no team association and will not have access to any features in the application.

The three roles include:

1. Admin
2. Tester
3. Read-Only

A team can only be associated to a single organization. However, a team can be associated to multiple assets within the same organization. A user can be a member of multiple teams. If a user is assigned to multiple teams of the same organization, the system will choose the highest authorized team.

_Please note: The default user is automatically assigned to the `Administrators` team on initial startup_

### Role Matrix

<table>
  <tr>
    <td></td>
    <th scope="col">Admin</th>
    <th scope="col">Tester</th>
    <th scope="col">Read-Only</th>
  </tr>
  <tr>
    <th scope="row">User-Profile Management</th>
    <td>x</td>
    <td>x</td>
    <td>x</td>
  </tr>
  <tr>
    <th scope="row">Team Management</th>
    <td>x</td>
    <td></td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">User Management</th>
    <td>x</td>
    <td></td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">Invite User</th>
    <td>x</td>
    <td></td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">Create User</th>
    <td>x</td>
    <td></td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">Email Settings Management</th>
    <td>x</td>
    <td></td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">Jira Integration</th>
    <td>x</td>
    <td></td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">Organization: Read</th>
    <td>x</td>
    <td>x</td>
    <td>x</td>
  </tr> 
  <tr>
    <th scope="row">Organization: Full Write</th>
    <td>x</td>
    <td></td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">Asset: Read</th>
    <td>x</td>
    <td>x</td>
    <td>x</td>
  </tr> 
  <tr>
    <th scope="row">Asset: Full Write</th>
    <td>x</td>
    <td></td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">Assessment: Read</th>
    <td>x</td>
    <td>x</td>
    <td>x</td>
  </tr> 
  <tr>
    <th scope="row">Assessment: Full Write</th>
    <td>x</td>
    <td>x</td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">Vulnerability: Read</th>
    <td>x</td>
    <td>x</td>
    <td>x</td>
  </tr> 
  <tr>
    <th scope="row">Vulnerability: Full Write</th>
    <td>x</td>
    <td>x</td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">Export Vulnerability to Jira</th>
    <td>x</td>
    <td>x</td>
    <td></td>
  </tr> 
  <tr>
    <th scope="row">Report Generation</th>
    <td>x</td>
    <td>x</td>
    <td>x</td>
  </tr> 
</table>

<br>

## API Key & Management

A user may generate a single API key which can be used in place of their authorization token. This API key allows for all actions against the application that the user is authorized for.

### Generating an API key pair

1. Login to the application
2. Navigate to the `User Profile` section
3. Select `Generate API Key`

This action will generate a pair of keys:

1. `Bulwark-Api-Key`
   1. This is a generated plaintext value to identify the user.
2. `Bulwark-Secret-Key`
   1. This is a generated plaintext value to verify the user by comparing a [Bcrypt](https://www.npmjs.com/package/bcrypt) hash stored in the database.

<strong>Write down the generated keys in a safe place. You will not be able to retrieve the keys at a later time.</strong>

### How to use API keys

The API key pair values must be matched and appended to the following HTTP request headers:

- `Bulwark-Api-Key`
- `Bulwark-Secret-Key`

Example:

```
GET /api/assessment/1 HTTP/1.1
Host: localhost:4500
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Bulwark-Api-Key: {{changeMe}}
Bulwark-Secret-Key: {{changeMe}}
Origin: http://localhost:4200
Connection: close
Referer: http://localhost:4200/
Pragma: no-cache
Cache-Control: no-cache
```

## Built With

- [Typeorm](https://typeorm.io/#/) - The ORM used
- [Angular](https://angular.io/) - The Angular Framework
- [Express](https://expressjs.com/) - A minimal and flexible Node.js web application framework

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Read the [contribution guidelines](CONTRIBUTING.md) for more information.

## License

[MIT](https://choosealicense.com/licenses/mit/)
