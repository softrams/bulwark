module.exports = {
  type: process.env.DB_TYPE,
  host: process.env.CLEARDB_JADE_URL,
  port: process.env.CLEARDB_JADE_PORT,
  username: process.env.CLEARDB_JADE_USERNAME,
  password: process.env.CLEARDB_JADE_PASSWORD,
  database: process.env.CLEARDB_JADE_NAME,
  entities: [__dirname + '/dist/entity/*.js'],
  migrations: ['migration/*.ts'],
  cli: {
    migrationsDir: 'migration'
  },
  logging: true,
  synchronize: false
};
