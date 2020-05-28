const passwordUtility = require('../utilities/password.utility');
import { User } from '../entity/User';
import { createConnection } from 'typeorm';
import { passwordRequirement } from '../enums/message-enum';

/**
 * WARNING: THIS SHOULD ONLY BE USED TO SEED THE INITIAL USER
 * 1) Run the server in development mode: 'npm run start:dev'
 * 2) Update the `userConfig` object with the user information
 * 3) Save the file.  This will automatically compile to JS.
 * 4) Execute:  'node ./dist/temp/seed-user.js'
 * Password Requirements:
 *      Must be at least 12 characters,
 *      at least one uppercase characters,
 *      at least one lowercase characters,
 *      at least one digit,
 *      and at least one symbol.
 */

const userConfig = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  title: ''
};

const seedUser = async () => {
  if (!passwordUtility.passwordSchema.validate(userConfig.password)) {
    // tslint:disable-next-line:no-console
    console.error(passwordRequirement);
    return;
  }
  createConnection(/*...*/)
    .then(async (connection) => {
      try {
        const user = new User();
        user.email = userConfig.email;
        user.firstName = userConfig.firstName;
        user.lastName = userConfig.lastName;
        user.title = userConfig.title;
        user.password = await passwordUtility.generateHash(userConfig.password);
        user.active = true;
        const userRepository = connection.getRepository(User);
        const existUser = await userRepository.find({ where: { email: user.email } });
        if (existUser.length) {
          console.warn('A user with that email already exists');
          connection.close();
        } else {
          await userRepository.save(user);
          // tslint:disable-next-line:no-console
          console.info(`The user: ${user.email} has been created and may now be used to log into Bulwark!`);
          connection.close();
        }
      } catch (err) {
        console.error(err);
        connection.close();
      }
    })
    // tslint:disable-next-line:no-console
    .catch((error) => console.log(error));
};

seedUser();
