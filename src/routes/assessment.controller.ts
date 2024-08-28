import { UserRequest } from '../interfaces/user-request.interface';
import { Response } from 'express';
import { getConnection } from 'typeorm';
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
  if (!req.params.id) {
    return res.status(400).json('Invalid Asset request');
  }
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Invalid Asset ID');
  }
  const asset = await getConnection()
                  .getRepository(Asset)
                  .findOne({ where: { id: +req.params.id } });
  if (!asset) {
    return res.status(404).json('Asset does not exist');
  }
  const assetAccess = await hasAssetReadAccess(req, asset.id);
  if (!assetAccess) {
    return res.status(404).json('Asset not found');
  }
  const hasTesterAccess = await hasAssetWriteAccess(req, asset.id);
  const assessments = await getConnection()
    .getRepository(Assessment)
    .createQueryBuilder('assessment')
    .leftJoinAndSelect('assessment.testers', 'tester')
    .where('assessment.asset = :assetId', {
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
};
/**
 * @description Get all vulnerabilities by assessment
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assessment vulnerabilities
 */
export const getAssessmentVulns = async (req: UserRequest, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json('Invalid Assessment ID');
  }
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Invalid Assessment ID');
  }
  const assessment = await getConnection()
    .getRepository(Assessment)
    .createQueryBuilder('assessment')
    .leftJoinAndSelect('assessment.asset', 'asset')
    .leftJoinAndSelect('asset.organization', 'organization')
    .where('assessment.id = :assessmentId', { assessmentId: req.params.id })
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
  const vulnerabilities = await getConnection()
    .getRepository(Vulnerability)
    .find({
      where: { assessment: { id: +req.params.id } },
    });
  if (!vulnerabilities) {
    return res.status(404).json('Vulnerabilities do not exist');
  }
  return res.status(200).json({ vulnerabilities, readOnly: !hasTesterAccess });
};
/**
 * @description Create assessment
 * @param {UserRequest} req
 * @param {Response} res c
 * @returns success message
 */
export const createAssessment = async (req: UserRequest, res: Response) => {
  if (isNaN(req.body.asset)) {
    return res.status(400).json('Asset ID is invalid');
  }
  const asset = await getConnection()
                    .getRepository(Asset)
                    .findOne({ where: { id: req.body.asset }, relations: ['organization'] });
  if (!asset) {
    return res.status(404).json('Asset does not exist');
  }
  const hasAccess = await hasAssetWriteAccess(req, asset.id);
  if (!hasAccess) {
    return res.status(403).json('Authorization is required');
  }
  if (!req.body.testers) {
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
    return res.status(400).send('Assessment form validation failed');
  } else {
    await getConnection().getRepository(Assessment).save(assessment);
    res.status(200).json('Assessment created succesfully');
  }
};
/**
 * @description Get asset assessment by ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assessment
 */
export const getAssessmentById = async (req: UserRequest, res: Response) => {
  if (!req.params.assessmentId) {
    return res.status(400).send('Invalid assessment request');
  }
  if (isNaN(+req.params.assessmentId)) {
    return res.status(400).json('Invalid Assessment ID');
  }
  const assessment = await getConnection()
    .getRepository(Assessment)
    .createQueryBuilder('assessment')
    .leftJoinAndSelect('assessment.asset', 'asset')
    .leftJoinAndSelect('asset.organization', 'organization')
    .leftJoinAndSelect('assessment.testers', 'tester')
    .where('assessment.id = :assessmentId', {
      assessmentId: req.params.assessmentId,
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
};
/**
 * @description Update assessment
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
export const updateAssessmentById = async (req: UserRequest, res: Response) => {
  if (!req.params.assessmentId) {
    return res.status(400).send('Invalid assessment request');
  }
  if (isNaN(+req.params.assessmentId)) {
    return res.status(400).json('Invalid Assessment ID');
  }
  let assessment = await getConnection()
    .getRepository(Assessment)
    .findOneOrFail({ where: { id: +req.params.assessmentId }, relations: ['testers', 'asset'] });
  if (!assessment) {
    return res.status(404).json('Assessment does not exist');
  }
  const hasAccess = await hasAssetWriteAccess(req, assessment.asset.id);
  if (!hasAccess) {
    return res.status(403).json('Authorization is required');
  }
  if (!req.body.testers) {
    return res.status(400).json('No testers have been selected');
  }
  const assessmentId = assessment.id;
  delete req.body.asset;
  assessment = req.body;
  assessment.id = assessmentId;
  assessment.testers = await userController.getUsersById(req.body.testers);
  if (assessment.startDate > assessment.endDate) {
    return res
      .status(400)
      .send('The assessment start date can not be later than the end date');
  }
  const errors = await validate(assessment);
  if (errors.length > 0) {
    return res.status(400).send('Assessment form validation failed');
  } else {
    await getConnection().getRepository(Assessment).save(assessment);
    res.status(200).json('Assessment patched successfully');
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
  if (!req.params.assessmentId) {
    return res.status(400).send('Invalid report request');
  }
  if (isNaN(+req.params.assessmentId)) {
    return res.status(400).json('Invalid Assessment ID');
  }
  const assessment = await getConnection()
    .getRepository(Assessment)
    .createQueryBuilder('assessment')
    .leftJoinAndSelect('assessment.testers', 'tester')
    .where('assessment.id = :assessmentId', {
      assessmentId: req.params.assessmentId,
    })
    .leftJoinAndSelect('assessment.asset', 'asset')
    .select([
      'assessment',
      'tester.firstName',
      'tester.lastName',
      'tester.title',
    ])
    .getOne();
  const assessmentForId = await getConnection()
    .getRepository(Assessment)
    .findOne({ where: { id: +req.params.assessmentId }, relations: ['asset'] });
  const asset = await getConnection()
      .getRepository(Asset)
      .findOne({ where: { id: assessmentForId.asset.id }, relations: ['organization'] });
  const hasReadAccess = await hasAssetReadAccess(req, asset.id);
  if (!hasReadAccess) {
    return res.status(404).json('Assessment not found');
  }
  const organization = await getConnection()
    .getRepository(Organization)
    .findOne({ where: { id: asset.organization.id } });
  const vulnerabilities = await getConnection()
    .getRepository(Vulnerability)
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
  const config = await getConnection()
      .getRepository(Config)
      .findOne({ where: { id: 1 }, select: ['companyName'] });
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
};

/**
 * @description Delete assessment by ID
 * @param {UserRequest} req vulnID is required
 * @param {Response} res contains JSON object with the success/fail
 * @returns success/error message
 */
export const deleteAssessmentById = async (req: UserRequest, res: Response) => {
  if (!req.params.assessmentId) {
    return res.status(400).send('Invalid assessment ID');
  }
  if (isNaN(+req.params.assessmentId)) {
    return res.status(400).send('Invalid assessment ID');
  }
  const assessment = await getConnection()
      .getRepository(Assessment)
      .findOne({ where: { id: +req.params.assessmentId }, relations: ['asset'] });
  if (!assessment) {
    return res.status(404).send('Assessment does not exist.');
  } else {
    const hasAccess = await hasAssetWriteAccess(req, assessment.asset.id);
    if (!hasAccess) {
      return res.status(403).json('Authorization is required');
    }
    await getConnection().getRepository(Assessment).delete(assessment);
    return res
      .status(200)
      .json(
        `Assessment #${assessment.id}: "${assessment.name}" successfully deleted`
      );
  }
};
