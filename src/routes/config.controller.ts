import { getConnection } from 'typeorm';
import { Response, Request } from 'express';
import { Config } from '../entity/Config';
import { encrypt } from '../utilities/crypto.utility';
import { validate } from 'class-validator';

export const initialInsert = async () => {
  const configAry = await getConnection().getRepository(Config).find({});
  if (!configAry.length) {
    const initialConfig = new Config();
    initialConfig.companyName = null;
    initialConfig.fromEmail = null;
    initialConfig.fromEmailPassword = null;
    await getConnection().getRepository(Config).save(initialConfig);
    return;
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
  const errors = await validate(existingConfig, { skipMissingProperties: true });
  if (errors.length > 0) {
    return res.status(400).json('Settings validation failed');
  } else {
    await getConnection().getRepository(Config).save(existingConfig);
    return res.status(200).json('Settings patched successfully');
  }
};
