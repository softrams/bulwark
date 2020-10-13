import { getConnection } from 'typeorm';
import { Response, Request } from 'express';
import { Config } from '../entity/Config';
import { User } from '../entity/User';
import { encrypt } from '../utilities/crypto.utility';
import { validate } from 'class-validator';
import { generateHash } from '../utilities/password.utility';

export const initialInsert = async () => {
  const configAry = await getConnection().getRepository(Config).find({});
  const usrAry = await getConnection().getRepository(User).find({});
  if (!configAry.length) {
    const initialConfig = new Config();
    initialConfig.companyName = null;
    initialConfig.fromEmail = null;
    initialConfig.fromEmailPassword = null;
    await getConnection().getRepository(Config).save(initialConfig);
  }
  if (!usrAry.length) {
    const initialUser = new User();
    initialUser.active = true;
    initialUser.email = 'admin@example.com';
    initialUser.firstName = 'Master';
    initialUser.lastName = 'Chief';
    initialUser.title = 'Spartan 117';
    initialUser.password = await generateHash('changeMe');
    await getConnection().getRepository(User).save(initialUser);
  }
};

export const getConfig = async (req: Request, res: Response) => {
  const existingConfig = await getConnection().getRepository(Config).findOne(1);
  delete existingConfig.fromEmailPassword;
  return res.status(200).json(existingConfig);
};

export const saveConfig = async (req: Request, res: Response) => {
  const fromEmail = req.body.fromEmail;
  const fromEmailPassword = req.body.fromEmailPassword;
  const companyName = req.body.companyName;
  const existingConfig = await getConnection().getRepository(Config).findOne(1);
  existingConfig.companyName = companyName;
  existingConfig.fromEmail = fromEmail;
  if (fromEmailPassword) {
    const encryptedPassword = encrypt(fromEmailPassword);
    existingConfig.fromEmailPassword = encryptedPassword;
  }
  const errors = await validate(existingConfig, {
    skipMissingProperties: true,
  });
  if (errors.length > 0) {
    return res.status(400).json('Settings validation failed');
  } else {
    await getConnection().getRepository(Config).save(existingConfig);
    return res.status(200).json('Settings patched successfully');
  }
};
