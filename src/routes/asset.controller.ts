import { UserRequest } from '../interfaces/user-request.interface';
import { Response } from 'express';
import { getConnection } from 'typeorm'
import { Asset } from '../entity/Asset';
import { validate } from 'class-validator';
import { Organization } from '../entity/Organization';

/**
 * @description Get organization assets
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assets
 */
const getOrgAssets = async (req: UserRequest, res: Response) => {
    if (!req.params.id) {
        return res.status(400).json('Invalid Asset UserRequest');
    }
    if (isNaN(+req.params.id)) {
        return res.status(400).json('Invalid Organization ID');
    }
    const asset = await getConnection().getRepository(Asset).find({
        where: { organization: req.params.id }
    });
    if (!asset) {
        return res.status(404).json('Assets not found');
    }
    res.json(asset);
}
/**
 * @description API backend for creating an asset associated by org ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
const createAsset = async (req: UserRequest, res: Response) => {
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
    const errors = await validate(asset);
    if (errors.length > 0) {
        res.status(400).send('Asset form validation failed');
    } else {
        await getConnection().getRepository(Asset).save(asset);
        res.status(200).json('Asset saved successfully');
    }
}
/**
 * @description Get asset by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns asset
 */
const getAssetById = async (req: UserRequest, res: Response) => {
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
const updateAssetById = async (req: UserRequest, res: Response) => {
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
}

module.exports = {
    getOrgAssets,
    createAsset,
    getAssetById,
    updateAssetById
}