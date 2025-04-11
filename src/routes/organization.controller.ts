import { UserRequest } from '../interfaces/user-request.interface';
import { Response } from 'express';
import { AppDataSource } from '../data-source';
import { Organization } from '../entity/Organization';
import { status } from '../enums/status-enum';
import { validate } from 'class-validator';
import { In } from 'typeorm';

/**
 * @description Get active organizations
 * @param {UserRequest} req
 * @param {Response} res
 * @returns active organizations
 */
export const getActiveOrgs = async (req: UserRequest, res: Response) => {
  try {
    const organizationRepository = AppDataSource.getRepository(Organization);
    
    const orgs = await organizationRepository.find({
      where: { 
        status: status.active, 
        id: In(req.userOrgs) 
      }
    });
    
    if (!orgs || orgs.length === 0) {
      return res.status(200).json([]);
    }
    
    return res.status(200).json(orgs);
  } catch (error) {
    console.error('Error fetching active organizations:', error);
    return res.status(500).json('An error occurred while fetching active organizations');
  }
};

/**
 * @description Get archived organizations
 * @param {UserRequest} req
 * @param {Response} res
 * @returns archived organizations
 */
export const getArchivedOrgs = async (req: UserRequest, res: Response) => {
  try {
    const organizationRepository = AppDataSource.getRepository(Organization);
    
    const orgs = await organizationRepository.find({
      where: { 
        status: status.archived, 
        id: In(req.userOrgs) 
      }
    });
    
    if (!orgs || orgs.length === 0) {
      return res.status(200).json([]);
    }
    
    return res.status(200).json(orgs);
  } catch (error) {
    console.error('Error fetching archived organizations:', error);
    return res.status(500).json('An error occurred while fetching archived organizations');
  }
};

/**
 * @description Get organization by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns organization
 */
export const getOrgById = async (req: UserRequest, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json('Invalid Organization Request');
    }
    
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Organization ID');
    }
    
    // Check if user has access to this organization
    if (!req.userOrgs.includes(+req.params.id)) {
      return res.status(404).json('Organization not found');
    }
    
    const organizationRepository = AppDataSource.getRepository(Organization);
    const org = await organizationRepository.findOne({
      where: { id: +req.params.id }
    });
    
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    
    return res.status(200).json({ name: org.name });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return res.status(500).json('An error occurred while fetching the organization');
  }
};

/**
 * @description Archive organization by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
export const archiveOrgById = async (req: UserRequest, res: Response) => {
  try {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Organization ID');
    }
    
    const organizationRepository = AppDataSource.getRepository(Organization);
    const org = await organizationRepository.findOne({
      where: { id: +req.params.id }
    });
    
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    
    org.status = status.archived;
    
    const errors = await validate(org);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).json('Organization archive validation failed');
    }
    
    await organizationRepository.save(org);
    return res.status(200).json('Organization archived successfully');
  } catch (error) {
    console.error('Error archiving organization:', error);
    return res.status(500).json('An error occurred while archiving the organization');
  }
};

/**
 * @description Activate organization by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error
 */
export const activateOrgById = async (req: UserRequest, res: Response) => {
  try {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Organization ID is not valid');
    }
    
    const organizationRepository = AppDataSource.getRepository(Organization);
    const org = await organizationRepository.findOne({
      where: { id: +req.params.id }
    });
    
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    
    org.status = status.active;
    
    const errors = await validate(org);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).json('Organization activation validation failed');
    }
    
    await organizationRepository.save(org);
    return res.status(200).json('Organization activated successfully');
  } catch (error) {
    console.error('Error activating organization:', error);
    return res.status(500).json('An error occurred while activating the organization');
  }
};

/**
 * @description Update organization by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
export const updateOrgById = async (req: UserRequest, res: Response) => {
  try {
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Organization ID is not valid');
    }
    
    const organizationRepository = AppDataSource.getRepository(Organization);
    const org = await organizationRepository.findOne({
      where: { id: +req.params.id }
    });
    
    if (!org) {
      return res.status(404).json('Organization does not exist');
    }
    
    org.name = req.body.name;
    
    const errors = await validate(org);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).send('Organization form validation failed');
    }
    
    await organizationRepository.save(org);
    return res.status(200).json('Organization updated successfully');
  } catch (error) {
    console.error('Error updating organization:', error);
    return res.status(500).json('An error occurred while updating the organization');
  }
};

/**
 * @description Create organization
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success/error message
 */
export const createOrg = async (req: UserRequest, res: Response) => {
  try {
    const organizationRepository = AppDataSource.getRepository(Organization);
    
    const org = new Organization();
    org.name = req.body.name;
    org.status = status.active;
    
    const errors = await validate(org);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).send('Organization form validation failed');
    }
    
    await organizationRepository.save(org);
    return res.status(200).json('Organization created successfully');
  } catch (error) {
    console.error('Error creating organization:', error);
    return res.status(500).json('An error occurred while creating the organization');
  }
};