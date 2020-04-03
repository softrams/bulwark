<p align="center">
  <img width="350" src="frontend/src/assets/logo.png">
</p>

Bulwark is an asset and vulnerability management tool utilized for building and generating application security reports.

## Note

Please keep in mind, this project is very early in the development phase.

## Installing

```
$ git clone (url)
$ cd bulwark
$ npm i
```

Run in development mode:

```
npm run start:dev
```

Run in production mode:

```
npm start
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

#### `FROM_EMAIL`

`FROM_EMAIL="foo@bar.com"`

Set this variable to sender email

#### `FROM_EMAIL_PASSWORD`

`FROM_EMAIL_PASSWORD="somePassword"`

Set this variable to sender email password or a [Gmail app passwords](https://support.google.com/mail/answer/185833?hl=en)

#### `COMPANY_NAME`

`COMPANY_NAME="United Nations Space Command"`

Set this variable to the application security company name to be published on the report

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
FROM_EMAIL=""
FROM_EMAIL_PASSWORD=""
COMPANY_NAME=""
```

## Authentication/Authorization

Most of the application routes are protected by middleware that validates JWT token with each request. Included in these routes is the `/api/user/create` route which creates users. Therefore, to create the initial user there are two options:

1. Remove the `jwtMiddleware.checkToken` middleware on the `/api/user/create` route
2. Manually insert a user into the database
   1. Use the Bcrypt library to generate a hash. Here's a [Gist](https://gist.github.com/Whamo12/e16fe650af4a04044768d216f39f0492) that will return a hash.
   2. Using the hash, manually insert the initial user into the database
      1. `` INSERT INTO `foobar`.`user` (`email`, `password`, `active`, `uuid`) VALUES ('foo@bar.com', 'changeMeHash', '1', ''); ``

## Built With

- [Typeorm](https://typeorm.io/#/) - The ORM used
- [Angular](https://angular.io/) - The Angular Framework
- [Express](https://expressjs.com/) - A minimal and flexible Node.js web application framework

## Lead Developer

[Alejandro Saenz](https://github.com/Whamo12)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
