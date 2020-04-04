import { UserRequest } from '../interfaces/user-request.interface';
import { Response } from 'express';
import { getConnection } from 'typeorm'
import { Organization } from '../entity/Organization';
import { status } from '../enums/status-enum';
import { validate } from 'class-validator';

/**
 * @description API backend for getting organization data
 * returns all organizations when triggered
 * @param {UserRequest} req
 * @param {Response} res contains JSON object with all organization data
 * @returns an array of organizations with avatar relations
 */
const getActiveOrgs = async (req: UserRequest, res: Response) => {
    const orgs = await getConnection().getRepository(Organization).find({
        relations: ['avatar'],
        where: { status: status.active }
    });
    if (!orgs) {
        return res.status(404).json('Organizations do not exist');
    }
    res.json(orgs);
}

/**
 * @description API backend for getting the organizational status for
 * if the organization is archived or not
 * @param {UserRequest} req
 * @param {Response} res contains JSON object with archived organizations
 * @returns an array of organizations with avatar relations and archived status
 */
const getArchivedOrgs = async (req: UserRequest, res: Response) => {
    const orgs = await getConnection().getRepository(Organization).find({
        relations: ['avatar'],
        where: { status: status.archived }
    });
    if (!orgs) {
        return res.status(404).json('Organizations do not exist');
    }
    res.json(orgs);
}
/**
 * @description API backend for getting an organization associated by ID
 *
 * @param {UserRequest} req
 * @param {Response} res contains JSON object with the organization data
 * @returns a JSON object with the given organization referenced by ID
 */
const getOrgById = async (req: UserRequest, res: Response) => {
    if (!req.params.id) {
        return res.status(400).json('Invalid Organization UserRequest');
    }
    if (isNaN(+req.params.id)) {
        return res.status(400).json('Invalid Organization iD');
    }
    const org = await getConnection().getRepository(Organization).findOne(req.params.id, {
        relations: ['avatar']
    });
    if (!org) {
        return res.status(404).json('Organization does not exist');
    }
    const resObj = {
        avatarData: org.avatar,
        name: org.name
    };
    res.json(resObj);
}
/**
 * @description API backend for updating an organization associated by ID
 * and updates archive status to archived
 * @param {UserRequest} req
 * @param {Response} res contains JSON object with the organization data
 * @returns a JSON object with the proper http response specifying success/fail
 */
const archiveOrgById = async (req: UserRequest, res: Response) => {
    if (isNaN(+req.params.id)) {
        return res.status(400).json('Invalid Organization ID');
    }
    const org = await getConnection().getRepository(Organization).findOne(req.params.id);
    if (!org) {
        return res.status(404).json('Organization does not exist');
    }
    org.status = status.archived;
    const errors = await validate(org);
    if (errors.length > 0) {
        return res.status(400).json('Organization archive validation failed');
    } else {
        await getConnection().getRepository(Organization).save(org);
        res.status(200).json('Organization archived successfully');
    }
}
/**
 * @description API backend for updating an organization associated by ID
 * and updates archive status to unarchived
 * @param {UserRequest} req ID and Status of the organization
 * @param {Response} res contains JSON object with the organization data
 * @returns a JSON object with the proper http response specifying success/fail
 */
const activateOrgById = async (req: UserRequest, res: Response) => {
    if (isNaN(+req.params.id)) {
        return res.status(400).json('Organization ID is not valid');
    }
    const org = await getConnection().getRepository(Organization).findOne(req.params.id);
    if (!org) {
        return res.status(404).json('Organization does not exist');
    }
    org.status = status.active;
    const errors = await validate(org);
    if (errors.length > 0) {
        return res.status(400).json('Organization activation validation failed');
    } else {
        await getConnection().getRepository(Organization).save(org);
        res.status(200).json('Organization activated successfully');
    }
};
/**
 * @description API backend for updating an organization associated by ID
 * and updates with supplied data
 * @param {UserRequest} req name and ID of the organization to alter
 * @param {Response} res contains JSON object with the organization data
 * @returns a JSON object with the proper http response specifying success/fail
 */
const updateOrgById = async (req: UserRequest, res: Response) => {
    if (isNaN(+req.params.id)) {
        return res.status(400).json('Organization ID is not valid');
    }
    const org = await getConnection().getRepository(Organization).findOne(req.params.id);
    if (!org) {
        return res.status(404).json('Organization does not exist');
    }
    org.name = req.body.name;
    if (req.body.avatar) {
        if (isNaN(+req.body.avatar)) {
            return res.status(400).json('Avatar is not valid');
        }
        org.avatar = req.body.avatar;
    }
    const errors = await validate(org);
    if (errors.length > 0) {
        return res.status(400).send('Organization form validation failed');
    } else {
        await getConnection().getRepository(Organization).save(org);
        res.status(200).json('Organization patched successfully');
    }
}
/**
 * @description API backend for creating an organization
 *
 * @param {UserRequest} req Name, Status, and Avatar
 * @param {Response} res contains JSON object with the organization data
 * @returns a JSON object with the proper http response specifying success/fail
 */
const createOrg = async (req: UserRequest, res: Response) => {
    const org = new Organization();
    org.name = req.body.name;
    org.status = status.active;
    if (req.body.avatar) {
        org.avatar = req.body.avatar;
    }
    const errors = await validate(org);
    if (errors.length > 0) {
        return res.status(400).send('Organization form validation failed');
    } else {
        await getConnection().getRepository(Organization).save(org);
        res.status(200).json('Organization saved successfully');
    }
};

module.exports = {
    getArchivedOrgs,
    getActiveOrgs,
    getOrgById,
    archiveOrgById,
    activateOrgById,
    updateOrgById,
    createOrg
}