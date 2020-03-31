import { createConnection } from 'typeorm';
import { User } from './entity/User';
const bcryptUtility = require('./utilities/bcrypt.utility');
const uuidv4 = require('uuid/v4');

// This is only used for seeding the initial user.  Once a secondary user is created, delete the seed from the database.

createConnection().then(async connection => {
  const userRepository = connection.getRepository(User);
  const user = {
    password: String(await bcryptUtility.generateHash('admin')),
    active: true,
    uuid: uuidv4(),
    email: 'foo@bar.com'
  };
  const existUser = await userRepository.find({ where: { email: user.email } });
  if (existUser.length) {
    console.info(`Seed user already exists.`);
  } else {
    await userRepository.save(user);
    console.info(`Seed User Created: ${user.uuid}`);
  }
  await connection.close();
  process.exit();
});
