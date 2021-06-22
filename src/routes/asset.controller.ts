import { UserRequest } from '../interfaces/user-request.interface';
import { Response, Request } from 'express';
import { getConnection } from 'typeorm';
import { Asset } from '../entity/Asset';
import { validate } from 'class-validator';
import { Organization } from '../entity/Organization';
import { status } from '../enums/status-enum';
import { encrypt } from '../utilities/crypto.utility';
import { Jira } from '../entity/Jira';
import { hasAssetReadAccess, hasOrgAccess } from '../utilities/role.utility';
import { Vulnerability } from '../entity/Vulnerability';
/**
 * @description Get organization assets
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assets  where: { status: status.archived, id: In(req.userOrgs) }
 */
export const getOrgAssets = async (req: UserRequest, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json('Invalid Asset UserRequest');
  }
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Invalid Organization ID');
  }
  if (!hasOrgAccess(req, +req.params.id)) {
    return res.status(404).json('Organization not found');
  }
  const assets = await getConnection()
    .getRepository(Asset)
    .createQueryBuilder('asset')
    .leftJoinAndSelect('asset.jira', 'jira')
    .where('asset.organization = :orgId', {
      orgId: req.params.id,
    })
    .andWhere('asset.status = :status', {
      status: status.active,
    })
    .andWhere('asset.id in(:userAssets)', {
      userAssets:
        getConnection().driver.options.type === 'sqlite'
          ? req.userAssets
          : [null, ...req.userAssets],
    })
    .select(['asset.id', 'asset.name', 'asset.status', 'jira.id'])
    .getMany();
  if (!assets) {
    return res.status(404).json('Assets not found');
  }
  for (const asset of assets) {
    asset['openVulnCount'] = await getOpenVulnCountByAsset(asset);
  }
  return res.status(200).json(assets);
};
/**
 * @description Get organization archived assets
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assets
 */
export const getArchivedOrgAssets = async (req: UserRequest, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json('Invalid Asset Request');
  }
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Invalid Organization ID');
  }
  if (!hasOrgAccess(req, +req.params.id)) {
    return res.status(404).json('Organization not found');
  }
  const assets = await getConnection()
    .getRepository(Asset)
    .createQueryBuilder('asset')
    .leftJoinAndSelect('asset.jira', 'jira')
    .where('asset.organization = :orgId', {
      orgId: req.params.id,
    })
    .andWhere('asset.status = :status', {
      status: status.archived,
    })
    .andWhere('asset.id in(:userAssets)', {
      userAssets:
        getConnection().driver.options.type === 'sqlite'
          ? req.userAssets
          : [null, ...req.userAssets],
    })
    .select(['asset.id', 'asset.name', 'asset.status', 'jira.id'])
    .getMany();
  if (!assets) {
    return res.status(404).json('Assets not found');
  }
  for (const asset of assets) {
    asset['openVulnCount'] = await getOpenVulnCountByAsset(asset);
  }
  return res.status(200).json(assets);
};
/**
 * @description Gets vulnerability count by asset ID
 * @param {Asset} asset
 * @returns integer
 */
export const getOpenVulnCountByAsset = async (asset: Asset) => {
  const vulnCount = await getConnection()
    .getRepository(Vulnerability)
    .createQueryBuilder('vuln')
    .leftJoinAndSelect('vuln.assessment', 'assessment')
    .leftJoinAndSelect('assessment.asset', 'asset')
    .where('asset.id = :assetId', {
      assetId: asset.id,
    })
    .andWhere('vuln.status = :status', {
      status: 'Open',
    })
    .select(['vuln.id', 'vuln.name', 'assessment.id', 'asset.id'])
    .getCount();
  return vulnCount;
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
  const org = await getConnection()
    .getRepository(Organization)
    .findOne(req.params.id);
  if (!org) {
    return res.status(404).json('Organization does not exist');
  }
  if (!req.body.name) {
    return res.status(400).send('Asset is not valid');
  }
  let asset = new Asset();
  asset.name = req.body.name;
  asset.organization = org;
  asset.status = status.active;
  const errors = await validate(asset);
  if (errors.length > 0) {
    return res.status(400).send('Asset form validation failed');
  } else {
    asset = await getConnection().getRepository(Asset).save(asset);
    if (
      req.body.jira &&
      req.body.jira.username &&
      req.body.jira.host &&
      req.body.jira.apiKey
    ) {
      try {
        await addJiraIntegration(
          req.body.jira.username,
          req.body.jira.host,
          req.body.jira.apiKey,
          asset
        );
      } catch (err) {
        return res.status(400).json(err);
      }
    } else {
      return res
        .status(200)
        .json(
          'Asset saved successfully.  Unable to integrate Jira.  JIRA integration requires username, host, and API key.'
        );
    }
    return res.status(200).json('Asset saved successfully');
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
    return res.status(400).json('Asset ID is not valid');
  }
  if (isNaN(+req.params.assetId)) {
    return res.status(400).json('Asset ID is not valid');
  }
  const asset = await getConnection()
    .getRepository(Asset)
    .findOne(req.params.assetId, { relations: ['jira'] });
  await getConnection().getRepository(Jira).delete(asset.jira);
  return res.status(200).json('The API Key has been purged successfully');
};
/**
 * @description Associates Asset to JIRA integration
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
const addJiraIntegration = (
  username: string,
  host: string,
  apiKey: string,
  asset: Asset
): Promise<Jira> => {
  return new Promise(async (resolve, reject) => {
    const existingAsset = await getConnection()
      .getRepository(Asset)
      .findOne(asset.id);
    if (existingAsset.jira) {
      reject(
        `The Asset: ${existingAsset.name} contains an existing Jira integration.  Purge the existing Jira integration and try again.`
      );
      return;
    }
    const jiraInit: Jira = {
      id: null,
      username,
      host,
      asset,
      apiKey,
    };
    try {
      jiraInit.apiKey = encrypt(apiKey);
    } catch (err) {
      reject(err);
      return;
    }
    const errors = await validate(jiraInit);
    if (errors.length > 0) {
      reject('Jira integration requires username, host, and API key.');
      return;
    } else {
      const jiraResult = await getConnection()
        .getRepository(Jira)
        .save(jiraInit);
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
  const asset = await getConnection()
    .getRepository(Asset)
    .findOne(req.params.assetId, { relations: ['jira'] });
  if (!asset) {
    return res.status(404).send('Asset does not exist');
  }
  const hasAccess = await hasAssetReadAccess(req, asset.id);
  if (!hasAccess) {
    return res.status(404).json('Asset not found');
  }
  if (asset.jira) {
    delete asset.jira.apiKey;
  }
  return res.status(200).json(asset);
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
  const asset = await getConnection()
    .getRepository(Asset)
    .findOne(req.params.assetId);
  if (!asset) {
    return res.status(404).json('Asset does not exist');
  }
  if (!req.body.name) {
    return res.status(400).json('Asset name is not valid');
  }
  try {
    if (
      req.body.jira &&
      req.body.jira.username &&
      req.body.jira.host &&
      req.body.jira.apiKey
    ) {
      await addJiraIntegration(
        req.body.jira.username,
        req.body.jira.host,
        req.body.jira.apiKey,
        asset
      );
    }
  } catch (err) {
    return res.status(400).json('JIRA integration validation failed');
  }
  asset.name = req.body.name;
  const errors = await validate(asset, { skipMissingProperties: true });
  if (errors.length > 0) {
    return res.status(400).send('Asset form validation failed');
  } else {
    await getConnection().getRepository(Asset).save(asset);
    return res.status(200).json('Asset patched successfully');
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
  const asset = await getConnection()
    .getRepository(Asset)
    .findOne(req.params.assetId);
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
  const asset = await getConnection()
    .getRepository(Asset)
    .findOne(req.params.assetId);
  if (!asset) {
    return res.status(404).json('Asset does not exist');
  }
  asset.status = status.active;
  await getConnection().getRepository(Asset).save(asset);
  res.status(200).json('Asset activated successfully');
};
