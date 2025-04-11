import { UserRequest } from '../interfaces/user-request.interface';
import { Response, Request } from 'express';
import { AppDataSource } from '../data-source';
import { Asset } from '../entity/Asset';
import { validate } from 'class-validator';
import { Organization } from '../entity/Organization';
import { status } from '../enums/status-enum';
import { encrypt } from '../utilities/crypto.utility';
import { Jira } from '../entity/Jira';
import { hasAssetReadAccess, hasOrgAccess } from '../utilities/role.utility';
import { Vulnerability } from '../entity/Vulnerability';
import { In } from 'typeorm';

/**
 * @description Get organization assets
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assets
 */
export const getOrgAssets = async (req: UserRequest, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json('Invalid Asset Request');
    }
    
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Organization ID');
    }
    
    if (!hasOrgAccess(req, +req.params.id)) {
      return res.status(404).json('Organization not found');
    }
    
    const assetRepository = AppDataSource.getRepository(Asset);
    
    // Build query based on database type
    const userAssetsPlaceholder = AppDataSource.options.type === 'sqlite' 
      ? req.userAssets 
      : [null, ...req.userAssets];
    
    const assets = await assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.jira', 'jira')
      .where('asset.organizationId = :orgId', {
        orgId: req.params.id,
      })
      .andWhere('asset.status = :status', {
        status: status.active,
      })
      .andWhere('asset.id IN (:...userAssets)', {
        userAssets: userAssetsPlaceholder,
      })
      .select(['asset.id', 'asset.name', 'asset.status', 'jira.id'])
      .getMany();
    
    if (!assets || assets.length === 0) {
      return res.status(200).json([]);
    }
    
    // Get open vulnerability counts for each asset
    for (const asset of assets) {
      asset['openVulnCount'] = await getOpenVulnCountByAsset(asset);
    }
    
    return res.status(200).json(assets);
  } catch (error) {
    console.error('Error fetching organization assets:', error);
    return res.status(500).json('An error occurred while fetching organization assets');
  }
};

/**
 * @description Get organization archived assets
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assets
 */
export const getArchivedOrgAssets = async (req: UserRequest, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json('Invalid Asset Request');
    }
    
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Organization ID');
    }
    
    if (!hasOrgAccess(req, +req.params.id)) {
      return res.status(404).json('Organization not found');
    }
    
    const assetRepository = AppDataSource.getRepository(Asset);
    
    // Build query based on database type
    const userAssetsPlaceholder = AppDataSource.options.type === 'sqlite' 
      ? req.userAssets 
      : [null, ...req.userAssets];
    
    const assets = await assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.jira', 'jira')
      .where('asset.organizationId = :orgId', {
        orgId: req.params.id,
      })
      .andWhere('asset.status = :status', {
        status: status.archived,
      })
      .andWhere('asset.id IN (:...userAssets)', {
        userAssets: userAssetsPlaceholder,
      })
      .select(['asset.id', 'asset.name', 'asset.status', 'jira.id'])
      .getMany();
    
    if (!assets || assets.length === 0) {
      return res.status(200).json([]);
    }
    
    // Get open vulnerability counts for each asset
    for (const asset of assets) {
      asset['openVulnCount'] = await getOpenVulnCountByAsset(asset);
    }
    
    return res.status(200).json(assets);
  } catch (error) {
    console.error('Error fetching archived assets:', error);
    return res.status(500).json('An error occurred while fetching archived assets');
  }
};

/**
 * @description Gets vulnerability count by asset ID
 * @param {Asset} asset
 * @returns integer
 */
export const getOpenVulnCountByAsset = async (asset: Asset): Promise<number> => {
  try {
    const vulnerabilityRepository = AppDataSource.getRepository(Vulnerability);
    
    const vulnCount = await vulnerabilityRepository
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
  } catch (error) {
    console.error(`Error getting vulnerability count for asset ${asset.id}:`, error);
    return 0;
  }
};

/**
 * @description Fetch open vulnerabilities by asset ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns array of vulnerabilities
 */
export const getOpenVulnsByAsset = async (req: UserRequest, res: Response) => {
  try {
    const assetAccess = await hasAssetReadAccess(req, +req.params.assetId);
    if (!assetAccess) {
      return res.status(404).json('Asset not found');
    }
    
    const vulnerabilityRepository = AppDataSource.getRepository(Vulnerability);
    
    const vulns = await vulnerabilityRepository
      .createQueryBuilder('vuln')
      .leftJoinAndSelect('vuln.assessment', 'assessment')
      .leftJoinAndSelect('assessment.asset', 'asset')
      .where('asset.id = :assetId', {
        assetId: req.params.assetId,
      })
      .andWhere('vuln.status = :status', {
        status: 'Open',
      })
      .select([
        'vuln.id',
        'vuln.name',
        'vuln.risk',
        'vuln.systemic',
        'vuln.cvssScore',
        'vuln.cvssUrl',
        'assessment.id',
        'vuln.jiraId',
      ])
      .getMany();
    
    return res.status(200).json(vulns);
  } catch (error) {
    console.error('Error fetching open vulnerabilities:', error);
    return res.status(500).json('An error occurred while fetching open vulnerabilities');
  }
};

/**
 * @description API backend for creating an asset associated by org ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
export const createAsset = async (req: UserRequest, res: Response) => {
  try {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Organization ID is not valid');
    }
    
    const organizationRepository = AppDataSource.getRepository(Organization);
    const assetRepository = AppDataSource.getRepository(Asset);
    
    const org = await organizationRepository.findOne({
      where: { id: +req.params.id }
    });
    
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
      console.error('Validation errors:', errors);
      return res.status(400).send('Asset form validation failed');
    }
    
    asset = await assetRepository.save(asset);
    
    // Handle Jira integration if provided
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
        return res.status(200).json('Asset saved successfully with Jira integration');
      } catch (err) {
        return res.status(400).json(err);
      }
    } else {
      return res
        .status(200)
        .json(
          'Asset saved successfully. Unable to integrate Jira. JIRA integration requires username, host, and API key.'
        );
    }
  } catch (error) {
    console.error('Error creating asset:', error);
    return res.status(500).json('An error occurred while creating the asset');
  }
};

/**
 * @description Purge JIRA by asset ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
export const purgeJiraInfo = async (req: Request, res: Response) => {
  try {
    if (!req.params.assetId) {
      return res.status(400).json('Asset ID is not valid');
    }
    
    if (isNaN(+req.params.assetId)) {
      return res.status(400).json('Asset ID is not valid');
    }
    
    const assetRepository = AppDataSource.getRepository(Asset);
    const jiraRepository = AppDataSource.getRepository(Jira);
    
    const asset = await assetRepository.findOne({
      where: { id: +req.params.assetId },
      relations: ['jira']
    });
    
    if (!asset || !asset.jira) {
      return res.status(404).json('Asset or Jira integration not found');
    }
    
    await jiraRepository.remove(asset.jira);
    return res.status(200).json('The API Key has been purged successfully');
  } catch (error) {
    console.error('Error purging Jira info:', error);
    return res.status(500).json('An error occurred while purging Jira info');
  }
};

/**
 * @description Associates Asset to JIRA integration
 * @param {string} username
 * @param {string} host
 * @param {string} apiKey
 * @param {Asset} asset
 * @returns Promise<Jira>
 */
const addJiraIntegration = (
  username: string,
  host: string,
  apiKey: string,
  asset: Asset
): Promise<Jira> => {
  return new Promise(async (resolve, reject) => {
    try {
      const assetRepository = AppDataSource.getRepository(Asset);
      const jiraRepository = AppDataSource.getRepository(Jira);
      
      const existingAsset = await assetRepository.findOne({
        where: { id: asset.id },
        relations: ['jira']
      });
      
      if (existingAsset.jira) {
        return reject(
          `The Asset: ${existingAsset.name} contains an existing Jira integration. Purge the existing Jira integration and try again.`
        );
      }
      
      const jiraInit: Jira = new Jira();
      jiraInit.username = username;
      jiraInit.host = host;
      jiraInit.asset = asset;
      
      try {
        jiraInit.apiKey = encrypt(apiKey);
      } catch (err) {
        return reject(err);
      }
      
      const errors = await validate(jiraInit);
      if (errors.length > 0) {
        console.error('Validation errors:', errors);
        return reject('Jira integration requires username, host, and API key.');
      }
      
      const jiraResult = await jiraRepository.save(jiraInit);
      resolve(jiraResult);
    } catch (error) {
      console.error('Error adding Jira integration:', error);
      reject('An error occurred while adding Jira integration');
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
  try {
    if (isNaN(+req.params.assetId)) {
      return res.status(400).json('Invalid Asset ID');
    }
    
    const assetRepository = AppDataSource.getRepository(Asset);
    
    const asset = await assetRepository.findOne({
      where: { id: +req.params.assetId },
      relations: ['jira']
    });
    
    if (!asset) {
      return res.status(404).send('Asset does not exist');
    }
    
    const hasAccess = await hasAssetReadAccess(req, asset.id);
    if (!hasAccess) {
      return res.status(404).json('Asset not found');
    }
    
    // Don't return the API key
    if (asset.jira) {
      delete asset.jira.apiKey;
    }
    
    return res.status(200).json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return res.status(500).json('An error occurred while fetching the asset');
  }
};

/**
 * @description Update asset by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @return success/error message
 */
export const updateAssetById = async (req: UserRequest, res: Response) => {
  try {
    if (isNaN(+req.params.assetId) || !req.params.assetId) {
      return res.status(400).json('Asset ID is not valid');
    }
    
    const assetRepository = AppDataSource.getRepository(Asset);
    
    const asset = await assetRepository.findOne({
      where: { id: +req.params.assetId }
    });
    
    if (!asset) {
      return res.status(404).json('Asset does not exist');
    }
    
    if (!req.body.name) {
      return res.status(400).json('Asset name is not valid');
    }
    
    // Handle Jira integration if provided
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
      console.error('Validation errors:', errors);
      return res.status(400).send('Asset form validation failed');
    }
    
    await assetRepository.save(asset);
    return res.status(200).json('Asset updated successfully');
  } catch (error) {
    console.error('Error updating asset:', error);
    return res.status(500).json('An error occurred while updating the asset');
  }
};

/**
 * @description Archive asset by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @return success/error message
 */
export const archiveAssetById = async (req: UserRequest, res: Response) => {
  try {
    if (isNaN(+req.params.assetId) || !req.params.assetId) {
      return res.status(400).json('Asset ID is not valid');
    }
    
    const assetRepository = AppDataSource.getRepository(Asset);
    
    const asset = await assetRepository.findOne({
      where: { id: +req.params.assetId }
    });
    
    if (!asset) {
      return res.status(404).json('Asset does not exist');
    }
    
    asset.status = status.archived;
    await assetRepository.save(asset);
    
    return res.status(200).json('Asset archived successfully');
  } catch (error) {
    console.error('Error archiving asset:', error);
    return res.status(500).json('An error occurred while archiving the asset');
  }
};

/**
 * @description Activate an asset by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @return success/error message
 */
export const activateAssetById = async (req: UserRequest, res: Response) => {
  try {
    if (isNaN(+req.params.assetId) || !req.params.assetId) {
      return res.status(400).json('Asset ID is not valid');
    }
    
    const assetRepository = AppDataSource.getRepository(Asset);
    
    const asset = await assetRepository.findOne({
      where: { id: +req.params.assetId }
    });
    
    if (!asset) {
      return res.status(404).json('Asset does not exist');
    }
    
    asset.status = status.active;
    await assetRepository.save(asset);
    
    return res.status(200).json('Asset activated successfully');
  } catch (error) {
    console.error('Error activating asset:', error);
    return res.status(500).json('An error occurred while activating the asset');
  }
};