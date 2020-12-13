import { getConnection } from 'typeorm';
import { ReportAudit } from '../entity/ReportAudit';

/**
 * @description Insert report generation audit record
 * @param {UserRequest} req
 * @returns nothing
 */
 export const insertReportAuditRecord = (userId: number, assessmentId: number) => {
     return new Promise(async (resolve, reject) => {
         const reportAudit: ReportAudit = {
             id: null,
             generatedBy: userId,
             assessmentId,
             generatedDate: new Date()
         }
         await getConnection().getRepository(ReportAudit).save(reportAudit);
         const audits = await getConnection().getRepository(ReportAudit).find({});
         console.log(audits);
         resolve(null);
     })
 }