import { UserRequest } from '../interfaces/user-request.interface';
import { Response } from 'express';
import { getConnection } from 'typeorm';
import { Organization } from '../entity/Organization';
import { status } from '../enums/status-enum';
import { validate } from 'class-validator';

/**
 * @description Get active organizations
 * @param {UserRequest} req
 * @param {Response} res
 * @returns active organizations
 */
export const getActiveOrgs = async (req: UserRequest, res: Response) => {
  const orgs = await getConnection()
    .getRepository(Organization)
    .find({
      where: { status: status.active }
    });
  if (!orgs) {
    return res.status(404).json('Organizations do not exist');
  }
  res.json(orgs);
};

/**
 * @description Get archived organizations
 * @param {UserRequest} req
 * @param {Response} res
 * @returns archived organizations
 */
export const getArchivedOrgs = async (req: UserRequest, res: Response) => {
  const orgs = await getConnection()
    .getRepository(Organization)
    .find({
      where: { status: status.archived }
    });
  if (!orgs) {
    return res.status(404).json('Organizations do not exist');
  }
  res.json(orgs);
};
/**
 * @description Get organization by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns organization
 */
export const getOrgById = async (req: UserRequest, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json('Invalid Organization UserRequest');
  }
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Invalid Organization iD');
  }
  const org = await getConnection().getRepository(Organization).findOne(req.params.id);
  if (!org) {
    return res.status(404).json('Organization does not exist');
  }
  const resObj = {
    name: org.name
  };
  res.json(resObj);
};
/**
 * @description Archive organization by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
export const archiveOrgById = async (req: UserRequest, res: Response) => {
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
};
/**
 * @description Activate organization by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error
 */
export const activateOrgById = async (req: UserRequest, res: Response) => {
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
 * @description Update organization by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
export const updateOrgById = async (req: UserRequest, res: Response) => {
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Organization ID is not valid');
  }
  const org = await getConnection().getRepository(Organization).findOne(req.params.id);
  if (!org) {
    return res.status(404).json('Organization does not exist');
  }
  org.name = req.body.name;
  const errors = await validate(org);
  if (errors.length > 0) {
    return res.status(400).send('Organization form validation failed');
  } else {
    await getConnection().getRepository(Organization).save(org);
    res.status(200).json('Organization patched successfully');
  }
};
/**
 * @description Create organization
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
export const createOrg = async (req: UserRequest, res: Response) => {
  const org = new Organization();
  org.name = req.body.name;
  org.status = status.active;
  const errors = await validate(org);
  if (errors.length > 0) {
    return res.status(400).send('Organization form validation failed');
  } else {
    await getConnection().getRepository(Organization).save(org);
    res.status(200).json('Organization saved successfully');
  }
};
