import { generateHash, passwordSchema } from '../utilities/password.utility';
import { User } from '../entity/User';
import { getConnection } from 'typeorm';
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
const userConfig = new User();
userConfig.email = '';
userConfig.password = '';
userConfig.firstName = '';
userConfig.lastName = '';
userConfig.title = '';

export const seedUser = async (user: User) => {
  if (!passwordSchema.validate(user.password)) {
    // tslint:disable-next-line:no-console
    console.error(passwordRequirement);
    return false;
  }
  try {
    user.password = await generateHash(user.password);
    user.active = true;
    const existUser = await getConnection()
      .getRepository(User)
      .find({ where: { email: user.email } });
    if (existUser.length) {
      console.warn('A user with that email already exists');
      getConnection().close();
      return false;
    } else {
      await getConnection().getRepository(User).save(user);
      // tslint:disable-next-line:no-console
      console.info(`The user: ${user.email} has been created and may now be used to log into Bulwark!`);
      getConnection().close();
      return true;
    }
  } catch (err) {
    console.error(err);
    getConnection().close();
  }
};

seedUser(userConfig);
