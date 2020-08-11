import { UserRequest } from '../interfaces/user-request.interface';
import { Response, Request, response } from 'express';
import { getConnection, AdvancedConsoleLogger } from 'typeorm';
import { Asset } from '../entity/Asset';
import { validate } from 'class-validator';
import { Organization } from '../entity/Organization';
import { status } from '../enums/status-enum';
import { encrypt } from '../utilities/crypto.utility';
import { Jira } from '../entity/Jira';
/**
 * @description Get organization assets
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assets
 */
export const getOrgAssets = async (req: UserRequest, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json('Invalid Asset UserRequest');
  }
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Invalid Organization ID');
  }
  const asset = await getConnection()
    .getRepository(Asset)
    .find({
      select: ['id', 'name', 'status'],
      where: { organization: req.params.id, status: status.active }
    });
  if (!asset) {
    return res.status(404).json('Assets not found');
  }
  res.json(asset);
};
/**
 * @description Get organization archived assets
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assets
 */
export const getArchivedOrgAssets = async (req: Request, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json('Invalid Asset Request');
  }
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Invalid Organization ID');
  }
  const asset = await getConnection()
    .getRepository(Asset)
    .find({
      select: ['id', 'name', 'status'],
      where: { organization: req.params.id, status: status.archived }
    });
  if (!asset) {
    return res.status(404).json('Assets not found');
  }
  return res.status(200).json(asset);
};
/**
 * @description API backend for creating an asset associated by org ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
export const createAsset = async (req: UserRequest, res: Response) => {
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Organization ID is not valid');
  }
  const org = await getConnection().getRepository(Organization).findOne(req.params.id);
  if (!org) {
    return res.status(404).json('Organization does not exist');
  }
  if (!req.body.name) {
    return res.status(400).send('Asset is not valid');
  }
  const asset = new Asset();
  try {
    await addJiraIntegration(req.body.jiraUsername, req.body.jiraHost, req.body.jiraApiKey, asset);
  } catch (err) {
    res.status(400).json('JIRA integration validation failed');
  }
  asset.name = req.body.name;
  asset.organization = org;
  asset.status = status.active;
  const errors = await validate(asset);
  if (errors.length > 0) {
    res.status(400).send('Asset form validation failed');
  } else {
    await getConnection().getRepository(Asset).save(asset);
    res.status(200).json('Asset saved successfully');
  }
};
/**
 * @description Purge JIRA by asset ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
export const purgeJiraInfo = async (req: Request, res: Response) => {
  if (!req.params.assetId) {
    res.status(400).json('Asset ID is not valid');
  }
  if (isNaN(+req.params.assetId)) {
    res.status(400).json('Asset ID is not valid');
  }
  const asset = await getConnection()
    .getRepository(Asset)
    .findOne(req.params.assetId, { relations: ['jira'] });
  await getConnection().getRepository(Jira).delete(asset.jira);
  res.status(200).json('The API Key has been purged successfully');
};
const addJiraIntegration = (username: string, host: string, apiKey: string, asset: Asset): Promise<Jira> => {
  return new Promise(async (resolve, reject) => {
    console.log(apiKey);
    apiKey = encrypt(apiKey);
    const jiraInit: Jira = {
      id: null,
      username,
      host,
      apiKey,
      asset
    };
    const errors = await validate(jiraInit);
    if (errors.length > 0) {
      reject('JIRA integration requires username, host, and API key.');
    } else {
      const jiraResult = await getConnection().getRepository(Jira).save(jiraInit);
      resolve(jiraResult);
    }
  });
};
/**
 * @description Get asset by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns asset
 */
export const getAssetById = async (req: UserRequest, res: Response) => {
  if (isNaN(+req.params.assetId)) {
    return res.status(400).json('Invalid Asset ID');
  }
  if (!req.params.assetId) {
    return res.status(400).send('Invalid Asset Request');
  }
  const asset = await getConnection()
    .getRepository(Asset)
    .findOne(req.params.assetId, { relations: ['jira'] });
  if (!asset) {
    return res.status(404).send('Asset does not exist');
  }
  if (asset.jira) {
    delete asset.jira.apiKey;
  }
  res.status(200).json(asset);
};

/**
 * @description Update asset by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @return success/error message
 */
export const updateAssetById = async (req: UserRequest, res: Response) => {
  if (isNaN(+req.params.assetId) || !req.params.assetId) {
    return res.status(400).json('Asset ID is not valid');
  }
  const asset = await getConnection().getRepository(Asset).findOne(req.params.assetId);
  if (!asset) {
    return res.status(404).json('Asset does not exist');
  }
  if (!req.body.name) {
    return res.status(400).json('Asset name is not valid');
  }
  try {
    await addJiraIntegration(req.body.jiraUsername, req.body.jiraHost, req.body.jiraApiKey, asset);
  } catch (err) {
    res.status(400).json('JIRA integration validation failed');
  }
  asset.name = req.body.name;
  const errors = await validate(asset, { skipMissingProperties: true });
  if (errors.length > 0) {
    res.status(400).send('Asset form validation failed');
  } else {
    await getConnection().getRepository(Asset).save(asset);
    res.status(200).json('Asset patched successfully');
  }
};
/**
 * @description Archive asset by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @return success/error message
 */
export const archiveAssetById = async (req: UserRequest, res: Response) => {
  if (isNaN(+req.params.assetId) || !req.params.assetId) {
    return res.status(400).json('Asset ID is not valid');
  }
  const asset = await getConnection().getRepository(Asset).findOne(req.params.assetId);
  if (!asset) {
    return res.status(404).json('Asset does not exist');
  }
  asset.status = status.archived;
  await getConnection().getRepository(Asset).save(asset);
  res.status(200).json('Asset archived successfully');
};
/**
 * @description Activate an asset by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @return success/error message
 */
export const activateAssetById = async (req: UserRequest, res: Response) => {
  if (isNaN(+req.params.assetId) || !req.params.assetId) {
    return res.status(400).json('Asset ID is not valid');
  }
  const asset = await getConnection().getRepository(Asset).findOne(req.params.assetId);
  if (!asset) {
    return res.status(404).json('Asset does not exist');
  }
  asset.status = status.active;
  await getConnection().getRepository(Asset).save(asset);
  res.status(200).json('Asset activated successfully');
};
