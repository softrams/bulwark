<p align="center">
  <img width="350" src="frontend/src/assets/logo.png">
</p>

<p style="text-align: center;">An organizational asset and vulnerability management tool, with Jira integration, designed for generating application security reports.</p>

<p align="center">
<img src='https://github.com/softrams/bulwark/workflows/build/badge.svg'>
<img src='https://img.shields.io/badge/License-MIT-yellow.svg'>
<img src='https://img.shields.io/docker/pulls/softramsdocker/bulwark'>
</p>

![Bulwark Walkthrough Demo](https://github.com/Whamo12/media/blob/master/bulwark_report_demo.gif)

## Jira Integration

![Bulwark Jira Demo](https://github.com/Whamo12/media/blob/master/bulwark_jira_demo.gif)

## Note

Please keep in mind, this project is in early development.

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
PROD_URL="http://localhost:5000"
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

Bulwark will be available at [localhost:5000](http://localhost:5000)

## Local Installation

```
$ git clone (url)
$ cd bulwark
$ npm install
```

Run in development mode:

```
$ npm run start:dev
```

Run in production mode:

```
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

Only update if a different port is required

#### `PROD_URL="http://localhost:5000"`

Only update if a different port is required

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
PROD_URL="http://localhost:5000"
JWT_KEY=""
JWT_REFRESH_KEY=""
CRYPTO_SECRET=""
CRYPTO_SALT=""
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

## Built With

- [Typeorm](https://typeorm.io/#/) - The ORM used
- [Angular](https://angular.io/) - The Angular Framework
- [Express](https://expressjs.com/) - A minimal and flexible Node.js web application framework

## Team

The Softrams Bulwark core development team are:

- [Alejandro Saenz](https://github.com/whamo12) aka `Whamo12`
- [Bill Jones](https://github.com/skewled) aka `skewled`

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Read the [contribution guidelines](CONTRIBUTING.md) for more information.

## License

[MIT](https://choosealicense.com/licenses/mit/)
