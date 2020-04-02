# Bulwark

Bulwark is an asset and vulnerability management tool utilized for building and generating application security reports.

### Note

Project is the early stages of development!

### Installing

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

`DB_PASSWORD="qwerty"`

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

`JWT_KEY="changeMe`

Set this variable to the JWT secret

#### `FROM_EMAIL`

`FROM_EMAIL="foo@bar.com"`

Set this variable to sender email

#### `FROM_EMAIL_PASSWORD`

`FROM_EMAIL_PASSWORD`

Set this variable to sender email password or [gmail app passwords](https://support.google.com/mail/answer/185833?hl=en)

### Empty .env example

```
CLEARDB_JADE_PASSWORD=""
CLEARDB_JADE_URL=""
CLEARDB_JADE_USERNAME=""
CLEARDB_JADE_PORT=3306
CLEARDB_JADE_NAME=""
DB_TYPE=""
NODE_ENV=""
DEV_URL="http://localhost:4200"
PROD_URL="http://localhost:5000"
JWT_KEY=""
FROM_EMAIL=""
FROM_EMAIL_PASSWORD=""
```

## Built With

- [Typeorm](https://typeorm.io/#/) - The ORM used
- [Angular](https://angular.io/) - The Angular Framework
- [Express](https://expressjs.com/) - A minimal and flexible Node.js web application framework

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
