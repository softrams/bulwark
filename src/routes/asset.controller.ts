import { UserRequest } from '../interfaces/user-request.interface';
import { Response, Request } from 'express';
import { getConnection } from 'typeorm';
import { Asset } from '../entity/Asset';
import { validate } from 'class-validator';
import { Organization } from '../entity/Organization';
import { status } from '../enums/status-enum';

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
  const asset = await getConnection().getRepository(Asset).findOne(req.params.assetId);
  if (!asset) {
    return res.status(404).send('Asset does not exist');
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
  asset.name = req.body.name;
  const errors = await validate(asset);
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
  const errors = await validate(asset);
  if (errors.length > 0) {
    res.status(400).send('Asset form validation failed');
  } else {
    await getConnection().getRepository(Asset).save(asset);
    res.status(200).json('Asset archived successfully');
  }
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
  const errors = await validate(asset);
  if (errors.length > 0) {
    res.status(400).send('Asset form validation failed');
  } else {
    await getConnection().getRepository(Asset).save(asset);
    res.status(200).json('Asset activated successfully');
  }
};
