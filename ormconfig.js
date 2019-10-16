module.exports = {
  type: 'mysql',
  host: process.env.CLEARDB_DATABASE_URL,
  port: process.env.CLEARDB_DATABASE_PORT,
  username: process.env.CLEARDB_DATABASE_USERNAME,
  password: process.env.CLEARDB_DATABASE_PASSWORD,
  database: process.env.CLEARDB_DATABASE_NAME,
  entities: [__dirname + '/src/entity/*.js'],
  logging: true,
  synchronize: true
};
