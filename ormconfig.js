module.exports = {
  type: process.env.DB_TYPE,
  host: process.env.DB_URL,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/dist/entity/*.js'],
  migrations: ['migration/*.ts'],
  cli: {
    migrationsDir: 'migration'
  },
  logging: true,
  synchronize: false
};
