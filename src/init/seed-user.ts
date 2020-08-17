import { generateHash } from '../utilities/password.utility';
import { User } from '../entity/User';
import { createConnection } from 'typeorm';
import * as path from 'path';
const { argv } = require('yargs');
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });
export const userConfig = new User();
if (argv.email) {
  userConfig.email = argv.email;
} else {
  console.error('Email is required');
  process.exit();
}
if (argv.password) {
  userConfig.password = argv.password.toString();
} else {
  console.error('Password is required');
  process.exit();
}
if (argv.firstName) {
  userConfig.firstName = argv.firstName;
} else {
  console.error('First Name is required');
  process.exit();
}
if (argv.lastName) {
  userConfig.lastName = argv.lastName;
} else {
  console.error('Last Name is required');
  process.exit();
}
if (argv.title) {
  userConfig.title = argv.title;
} else {
  console.error('Title is required');
  process.exit();
}
/**
 * WARNING: THIS SHOULD ONLY BE USED TO SEED THE INITIAL USER
 */
export const seedUser = async (user: User) => {
  const connection = await createConnection();
  try {
    user.password = await generateHash(user.password);
    user.active = true;
    const existUser = await connection.getRepository(User).find({ where: { email: user.email } });
    if (existUser.length) {
      console.warn('A user with that email already exists');
      connection.close();
      process.exit();
    } else {
      await connection.getRepository(User).save(user);
      // tslint:disable-next-line:no-console
      console.info(`The user: ${user.email} has been created and may now be used to log into Bulwark!`);
      connection.close();
      process.exit();
    }
  } catch (err) {
    console.error(err);
    connection.close();
    process.exit();
  }
};
seedUser(userConfig);
