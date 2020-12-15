import { getConnection } from 'typeorm';
import { ReportAudit } from '../entity/ReportAudit';

/**
 * @description Insert report generation audit record
 * @param {UserRequest} req
 * @returns nothing
 */
export const insertReportAuditRecord = (userId: number, assessmentId: number): Promise<ReportAudit> => {
  return new Promise(async (resolve, reject) => {
    const reportAudit: ReportAudit = {
      id: null,
      generatedBy: userId,
      assessmentId,
      generatedDate: new Date()
    };
    try {
      const newAudit = await getConnection().getRepository(ReportAudit).save(reportAudit);
      // tslint:disable-next-line: no-console
      console.info(
        `Report generated by user ID: ${newAudit.id} for assessment ID: ${newAudit.assessmentId} on ${newAudit.generatedDate}`
      );
      resolve(newAudit);
    } catch (err) {
      console.error(err);
      reject();
    }
  });
};
