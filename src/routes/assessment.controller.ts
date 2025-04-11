import { UserRequest } from '../interfaces/user-request.interface';
import { Response } from 'express';
import { AppDataSource } from '../data-source';
import { Assessment } from '../entity/Assessment';
import { Asset } from '../entity/Asset';
import { validate } from 'class-validator';
import { Vulnerability } from '../entity/Vulnerability';
import { Organization } from '../entity/Organization';
import { Report } from '../classes/Report';
import { Config } from '../entity/Config';
import {
  hasAssetReadAccess,
  hasAssetWriteAccess,
} from '../utilities/role.utility';
const userController = require('../routes/user.controller');

/**
 * @description Get assessments by asset ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Asset assessments
 */
export const getAssessmentsByAssetId = async (
  req: UserRequest,
  res: Response
) => {
  try {
    if (!req.params.id) {
      return res.status(400).json('Invalid Asset request');
    }
    
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Asset ID');
    }
    
    const assetRepository = AppDataSource.getRepository(Asset);
    const assessmentRepository = AppDataSource.getRepository(Assessment);
    
    const asset = await assetRepository.findOne({
      where: { id: +req.params.id },
      relations: ['organization']
    });
    
    if (!asset) {
      return res.status(404).json('Asset does not exist');
    }
    
    const assetAccess = await hasAssetReadAccess(req, asset.id);
    if (!assetAccess) {
      return res.status(404).json('Asset not found');
    }
    
    const hasTesterAccess = await hasAssetWriteAccess(req, asset.id);
    
    const assessments = await assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.testers', 'tester')
      .where('assessment.assetId = :assetId', {
        assetId: asset.id,
      })
      .select([
        'assessment.id',
        'assessment.name',
        'assessment.jiraId',
        'assessment.startDate',
        'assessment.endDate',
        'tester.firstName',
        'tester.lastName',
      ])
      .getMany();
    
    return res.status(200).json({ assessments, readOnly: !hasTesterAccess });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return res.status(500).json('An error occurred while fetching assessments');
  }
};

/**
 * @description Get all vulnerabilities by assessment
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assessment vulnerabilities
 */
export const getAssessmentVulns = async (req: UserRequest, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json('Invalid Assessment ID');
    }
    
    if (isNaN(+req.params.id)) {
      return res.status(400).json('Invalid Assessment ID');
    }
    
    const assessmentRepository = AppDataSource.getRepository(Assessment);
    const vulnerabilityRepository = AppDataSource.getRepository(Vulnerability);
    
    const assessment = await assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.asset', 'asset')
      .leftJoinAndSelect('asset.organization', 'organization')
      .where('assessment.id = :assessmentId', { assessmentId: +req.params.id })
      .select(['assessment', 'asset', 'organization'])
      .getOne();
    
    if (!assessment) {
      return res.status(404).json('Assessment does not exist');
    }
    
    const hasReadAccess = await hasAssetReadAccess(req, assessment.asset.id);
    if (!hasReadAccess) {
      return res.status(404).json('Assessment not found');
    }
    
    const hasTesterAccess = await hasAssetWriteAccess(req, assessment.asset.id);
    
    const vulnerabilities = await vulnerabilityRepository.find({
      where: { assessment: { id: +req.params.id } }
    });
    
    if (!vulnerabilities) {
      return res.status(404).json('Vulnerabilities do not exist');
    }
    
    return res.status(200).json({ vulnerabilities, readOnly: !hasTesterAccess });
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error);
    return res.status(500).json('An error occurred while fetching vulnerabilities');
  }
};

/**
 * @description Create assessment
 * @param {UserRequest} req
 * @param {Response} res c
 * @returns success message
 */
export const createAssessment = async (req: UserRequest, res: Response) => {
  try {
    if (isNaN(+req.body.asset)) {
      return res.status(400).json('Asset ID is invalid');
    }
    
    const assetRepository = AppDataSource.getRepository(Asset);
    const assessmentRepository = AppDataSource.getRepository(Assessment);
    
    const asset = await assetRepository.findOne({
      where: { id: +req.body.asset },
      relations: ['organization']
    });
    
    if (!asset) {
      return res.status(404).json('Asset does not exist');
    }
    
    const hasAccess = await hasAssetWriteAccess(req, asset.id);
    if (!hasAccess) {
      return res.status(403).json('Authorization is required');
    }
    
    if (!req.body.testers || !req.body.testers.length) {
      return res.status(400).json('No testers have been selected');
    }
    
    const testers = await userController.getUsersById(req.body.testers);
    
    const assessment = new Assessment();
    assessment.asset = asset;
    assessment.name = req.body.name;
    assessment.executiveSummary = req.body.executiveSummary;
    assessment.jiraId = req.body.jiraId;
    assessment.testUrl = req.body.testUrl;
    assessment.prodUrl = req.body.prodUrl;
    assessment.scope = req.body.scope;
    assessment.tag = req.body.tag;
    assessment.startDate = new Date(req.body.startDate);
    assessment.endDate = new Date(req.body.endDate);
    assessment.testers = testers;
    
    const errors = await validate(assessment);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).send('Assessment form validation failed');
    }
    
    await assessmentRepository.save(assessment);
    return res.status(200).json('Assessment created successfully');
  } catch (error) {
    console.error('Error creating assessment:', error);
    return res.status(500).json('An error occurred while creating the assessment');
  }
};

/**
 * @description Get asset assessment by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assessment
 */
export const getAssessmentById = async (req: UserRequest, res: Response) => {
  try {
    if (!req.params.assessmentId) {
      return res.status(400).send('Invalid assessment request');
    }
    
    if (isNaN(+req.params.assessmentId)) {
      return res.status(400).json('Invalid Assessment ID');
    }
    
    const assessmentRepository = AppDataSource.getRepository(Assessment);
    
    const assessment = await assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.asset', 'asset')
      .leftJoinAndSelect('asset.organization', 'organization')
      .leftJoinAndSelect('assessment.testers', 'tester')
      .where('assessment.id = :assessmentId', {
        assessmentId: +req.params.assessmentId,
      })
      .select([
        'assessment',
        'asset',
        'organization',
        'tester.firstName',
        'tester.lastName',
        'tester.title',
        'tester.id',
      ])
      .getOne();
    
    if (!assessment) {
      return res.status(404).json('Assessment does not exist');
    }
    
    const hasReadAccess = await hasAssetReadAccess(req, assessment.asset.id);
    if (!hasReadAccess) {
      return res.status(404).json('Assessment not found');
    }
    
    const hasTesterAccess = await hasAssetWriteAccess(req, assessment.asset.id);
    
    return res.status(200).json({ assessment, readOnly: !hasTesterAccess });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return res.status(500).json('An error occurred while fetching the assessment');
  }
};

/**
 * @description Update assessment
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
export const updateAssessmentById = async (req: UserRequest, res: Response) => {
  try {
    if (!req.params.assessmentId) {
      return res.status(400).send('Invalid assessment request');
    }
    
    if (isNaN(+req.params.assessmentId)) {
      return res.status(400).json('Invalid Assessment ID');
    }
    
    const assessmentRepository = AppDataSource.getRepository(Assessment);
    
    let assessment = await assessmentRepository.findOne({
      where: { id: +req.params.assessmentId },
      relations: ['testers', 'asset']
    });
    
    if (!assessment) {
      return res.status(404).json('Assessment does not exist');
    }
    
    const hasAccess = await hasAssetWriteAccess(req, assessment.asset.id);
    if (!hasAccess) {
      return res.status(403).json('Authorization is required');
    }
    
    if (!req.body.testers || !req.body.testers.length) {
      return res.status(400).json('No testers have been selected');
    }
    
    const assessmentId = assessment.id;
    const assetId = assessment.asset.id;
    
    // Create a new assessment object from the request body
    const updatedAssessment = {
      ...req.body,
      id: assessmentId,
      asset: { id: assetId },
      testers: await userController.getUsersById(req.body.testers)
    };
    
    // Skip asset update since we're keeping the original asset
    delete updatedAssessment.asset;
    
    // Validate dates
    if (new Date(updatedAssessment.startDate) > new Date(updatedAssessment.endDate)) {
      return res
        .status(400)
        .send('The assessment start date cannot be later than the end date');
    }
    
    // Create the updated assessment with all fields
    Object.assign(assessment, updatedAssessment);
    
    const errors = await validate(assessment);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).send('Assessment form validation failed');
    }
    
    await assessmentRepository.save(assessment);
    return res.status(200).json('Assessment updated successfully');
  } catch (error) {
    console.error('Error updating assessment:', error);
    return res.status(500).json('An error occurred while updating the assessment');
  }
};

/**
 * @description Query information for assessment report
 * @param {UserRequest} req
 * @param {Response} res
 * @returns report information
 */
export const queryReportDataByAssessment = async (
  req: UserRequest,
  res: Response
) => {
  try {
    if (!req.params.assessmentId) {
      return res.status(400).send('Invalid report request');
    }
    
    if (isNaN(+req.params.assessmentId)) {
      return res.status(400).json('Invalid Assessment ID');
    }
    
    const assessmentRepository = AppDataSource.getRepository(Assessment);
    const assetRepository = AppDataSource.getRepository(Asset);
    const organizationRepository = AppDataSource.getRepository(Organization);
    const vulnerabilityRepository = AppDataSource.getRepository(Vulnerability);
    const configRepository = AppDataSource.getRepository(Config);
    
    // Get assessment with testers
    const assessment = await assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.testers', 'tester')
      .where('assessment.id = :assessmentId', {
        assessmentId: +req.params.assessmentId,
      })
      .leftJoinAndSelect('assessment.asset', 'asset')
      .select([
        'assessment',
        'asset.id',
        'tester.firstName',
        'tester.lastName',
        'tester.title',
      ])
      .getOne();
    
    if (!assessment) {
      return res.status(404).json('Assessment not found');
    }
    
    // Get assessment for asset
    const assessmentForId = await assessmentRepository.findOne({
      where: { id: +req.params.assessmentId },
      relations: ['asset']
    });
    
    const asset = await assetRepository.findOne({
      where: { id: assessmentForId.asset.id },
      relations: ['organization']
    });
    
    const hasReadAccess = await hasAssetReadAccess(req, asset.id);
    if (!hasReadAccess) {
      return res.status(404).json('Assessment not found');
    }
    
    const organization = await organizationRepository.findOne({
      where: { id: asset.organization.id }
    });
    
    // Get vulnerabilities with relations
    const vulnerabilities = await vulnerabilityRepository
      .createQueryBuilder('vuln')
      .leftJoinAndSelect('vuln.screenshots', 'screenshot')
      .leftJoinAndSelect('vuln.problemLocations', 'problemLocation')
      .leftJoinAndSelect('vuln.resources', 'resource')
      .where('vuln.assessmentId = :assessmentId', {
        assessmentId: assessment.id,
      })
      .select([
        'vuln',
        'screenshot.id',
        'screenshot.originalname',
        'screenshot.mimetype',
        'problemLocation',
        'resource',
      ])
      .getMany();
    
    // Get company name from config
    const config = await configRepository.findOne({
      where: { id: 1 },
      select: ['companyName']
    });
    
    // Create report object
    const report = new Report();
    report.org = organization;
    report.asset = asset;
    report.assessment = assessment;
    report.vulns = vulnerabilities;
    
    if (config && config.companyName) {
      report.companyName = config.companyName;
    } else {
      report.companyName = null;
    }
    
    return res.status(200).json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json('An error occurred while generating the report');
  }
};

/**
 * @description Delete assessment by ID
 * @param {UserRequest} req vulnID is required
 * @param {Response} res contains JSON object with the success/fail
 * @returns success/error message
 */
export const deleteAssessmentById = async (req: UserRequest, res: Response) => {
  try {
    if (!req.params.assessmentId) {
      return res.status(400).send('Invalid assessment ID');
    }
    
    if (isNaN(+req.params.assessmentId)) {
      return res.status(400).send('Invalid assessment ID');
    }
    
    const assessmentRepository = AppDataSource.getRepository(Assessment);
    
    const assessment = await assessmentRepository.findOne({
      where: { id: +req.params.assessmentId },
      relations: ['asset']
    });
    
    if (!assessment) {
      return res.status(404).send('Assessment does not exist.');
    }
    
    const hasAccess = await hasAssetWriteAccess(req, assessment.asset.id);
    if (!hasAccess) {
      return res.status(403).json('Authorization is required');
    }
    
    await assessmentRepository.remove(assessment);
    
    return res
      .status(200)
      .json(
        `Assessment #${assessment.id}: "${assessment.name}" successfully deleted`
      );
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return res.status(500).json('An error occurred while deleting the assessment');
  }
};