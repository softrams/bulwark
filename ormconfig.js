module.exports = {
  type: 'mysql',
  host: '',
  port: '',
  username: '',
  password: '',
  database: '',
  entities: [__dirname + '/src/entity/*.js'],
  logging: true,
  synchronize: true
};
