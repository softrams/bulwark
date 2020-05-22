import { UserRequest } from '../interfaces/user-request.interface';
import { Response } from 'express';
import { getConnection } from 'typeorm';
import { Assessment } from '../entity/Assessment';
import { Asset } from '../entity/Asset';
import { validate } from 'class-validator';
import { Vulnerability } from '../entity/Vulnerability';
import { Organization } from '../entity/Organization';
import { Report } from '../classes/Report';
const userController = require('../routes/user.controller');

/**
 * @description Get assessments by asset ID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Asset assessments
 */
const getAssessmentsByAssetId = async (req: UserRequest, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json('Invalid Assessment request');
  }
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Invalid Asset ID');
  }
  const assessment = await getConnection()
    .getRepository(Assessment)
    .find({
      where: { asset: req.params.id }
    });
  if (!assessment) {
    return res.status(404).json('Assessments do not exist');
  }
  res.status(200).json(assessment);
};
/**
 * @description Get all vulnerabilities by assessment
 * @param {UserRequest} req
 * @param {Response} res
 * @returns assessment vulnerabilities
 */
const getAssessmentVulns = async (req: UserRequest, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json('Invalid Vulnerability request');
  }
  if (isNaN(+req.params.id)) {
    return res.status(400).json('Invalid Assessment ID');
  }
  const vulnerabilities = await getConnection()
    .getRepository(Vulnerability)
    .find({
      where: { assessment: req.params.id }
    });
  if (!vulnerabilities) {
    return res.status(404).json('Vulnerabilities do not exist');
  }
  res.status(200).json(vulnerabilities);
};
/**
 * @description Create assessment
 * @param {UserRequest} req
 * @param {Response} res c
 * @returns success message
 */
const createAssessment = async (req: UserRequest, res: Response) => {
  if (isNaN(req.body.asset)) {
    return res.status(400).json('Asset ID is invalid');
  }
  const asset = await getConnection().getRepository(Asset).findOne(req.body.asset);
  if (!asset) {
    return res.status(404).json('Asset does not exist');
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
const getAssessmentById = async (req: UserRequest, res: Response) => {
  if (!req.params.assessmentId) {
    return res.status(400).send('Invalid assessment request');
  }
  if (isNaN(+req.params.assessmentId)) {
    return res.status(400).json('Invalid Assessment ID');
  }
  const assessment = await getConnection()
    .getRepository(Assessment)
    .createQueryBuilder('assessment')
    .leftJoinAndSelect('assessment.testers', 'tester')
    .where('assessment.id = :assessmentId', {
      assessmentId: req.params.assessmentId
    })
    .select(['assessment', 'tester.firstName', 'tester.lastName', 'tester.title', 'tester.id'])
    .getOne();
  if (!assessment) {
    return res.status(404).json('Assessment does not exist');
  }
  res.status(200).json(assessment);
};
/**
 * @description Update assessment
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
const updateAssessmentById = async (req: UserRequest, res: Response) => {
  if (!req.params.assessmentId) {
    return res.status(400).send('Invalid assessment request');
  }
  if (isNaN(+req.params.assessmentId)) {
    return res.status(400).json('Invalid Assessment ID');
  }
  let assessment = await getConnection()
    .getRepository(Assessment)
    .findOne(req.params.assessmentId, { relations: ['testers'] });
  if (!assessment) {
    return res.status(404).json('Assessment does not exist');
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
    return res.status(400).send('The assessment start date can not be later than the end date');
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
const queryReportDataByAssessment = async (req: UserRequest, res: Response) => {
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
      assessmentId: req.params.assessmentId
    })
    .leftJoinAndSelect('assessment.asset', 'asset')
    .select(['assessment', 'tester.firstName', 'tester.lastName', 'tester.title'])
    .getOne();
  const assessmentForId = await getConnection()
    .getRepository(Assessment)
    .findOne(req.params.assessmentId, { relations: ['asset'] });
  const asset = await getConnection()
    .getRepository(Asset)
    .findOne(assessmentForId.asset.id, {
      relations: ['organization']
    });
  const organization = await getConnection().getRepository(Organization).findOne(asset.organization.id);
  const vulnerabilities = await getConnection()
    .getRepository(Vulnerability)
    .createQueryBuilder('vuln')
    .leftJoinAndSelect('vuln.screenshots', 'screenshot')
    .leftJoinAndSelect('vuln.problemLocations', 'problemLocation')
    .leftJoinAndSelect('vuln.resources', 'resource')
    .where('vuln.assessmentId = :assessmentId', {
      assessmentId: assessment.id
    })
    .select(['vuln', 'screenshot.id', 'screenshot.originalname', 'screenshot.mimetype', 'problemLocation', 'resource'])
    .getMany();
  const report = new Report();
  report.org = organization;
  report.asset = asset;
  report.assessment = assessment;
  report.vulns = vulnerabilities;
  report.companyName = process.env.COMPANY_NAME;
  res.status(200).json(report);
};

module.exports = {
  getAssessmentsByAssetId,
  getAssessmentVulns,
  createAssessment,
  getAssessmentById,
  updateAssessmentById,
  queryReportDataByAssessment
};
