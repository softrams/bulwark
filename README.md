<p align="center">
  <img width="350" src="frontend/src/assets/logo.png">
</p>

<p style="text-align: center;">An organizational asset and vulnerability management tool, with Jira integration, designed for generating application security reports.</p>

<p align="center">
<img src='https://github.com/softrams/bulwark/workflows/Node.js%20CI/badge.svg'>
<img src='https://img.shields.io/badge/License-MIT-yellow.svg'>
</p>
![Running Bulwark](https://github.com/Whamo12/media/blob/master/bulwark_walkthrough.gif)

## Note

Please keep in mind, this project is in early development.

## Installing

```
$ git clone (url)
$ cd bulwark
$ npm i
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

Create a `.env` file which will be parsed with [dotenv](https://www.npmjs.com/package/dotenv).

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

#### `FROM_EMAIL`

`FROM_EMAIL="foo@bar.com"`

Set this variable to sender email

#### `FROM_EMAIL_PASSWORD`

`FROM_EMAIL_PASSWORD="somePassword"`

Set this variable to sender email password or a [Gmail app passwords](https://support.google.com/mail/answer/185833?hl=en)

#### `COMPANY_NAME`

`COMPANY_NAME="United Nations Space Command"`

Set this variable to the application security company name to be published on the report

#### `JIRA_API_KEY`

`JIRA_API_KEY="someApiKey"`

Set this variable to the Jira user's generated [API token](https://confluence.atlassian.com/cloud/api-tokens-938839638.html).

#### `JIRA_USERNAME`

`JIRA_USERNAME="foo@bar.com"`

Set this variable to the user's Jira email address.

#### `JIRA_HOST`

`JIRA_HOST="foo-bar.atlassian.net"`

Set this variable to the user's Jira host address.

#### `CRYPTO_SECRET`

`CRYPTO_SECRET="randomValue"`

Set this variable to the [Scrypt](https://nodejs.org/api/crypto.html#crypto_crypto_scryptsync_password_salt_keylen_options) password.

#### `CRYPTO_SALT`

`CRYPTO_SECRET="randomValue"`

Set this variable to the [Scrypt](https://nodejs.org/api/crypto.html#crypto_crypto_scryptsync_password_salt_keylen_options) salt.

### Empty .env example

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
FROM_EMAIL=""
FROM_EMAIL_PASSWORD=""
COMPANY_NAME=""
JIRA_API_KEY=""
JIRA_USERNAME=""
JIRA_HOST=""
CRYPTO_SECRET=""
CRYPTO_SALT=""
```

## Seed Initial User

On initial startup, Bulwark will not have any users. Therefore, it is necessary to seed the **first** user.

<!-- Afterwords, subsequent users should be invited. -->

1. `$ npm install`
2. Create the initial database migration `$ npm run migration:init`
3. Run the initial database migration `$ npm run migration:run`
4. `$ npm run start:dev`
5. Navigate to [seed-user.ts](https://github.com/softrams/bulwark/blob/develop/src/temp/seed-user.ts)
6. Update the `userConfig` object with user credentials, save, and wait for the JS to compile
7. `$ node ./dist/temp/seed-user.js`
8. Log into Bulwark with credentials used in step 4

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
