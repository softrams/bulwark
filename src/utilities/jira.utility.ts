import { JiraIssue } from 'src/interfaces/jira/jira-issue.interface';
import { Vulnerability } from '../entity/Vulnerability';
import { JiraInit } from 'src/interfaces/jira/jira-init.interface';
import { decrypt } from './crypto.utility';
import { JiraResult } from 'src/interfaces/jira/jira-result.interface';
const j2m = require('jira2md');
const fetch = require('node-fetch');
import * as fs from 'fs';
import * as mime from 'mime-types';
import { IssueLink } from 'src/interfaces/jira/jira-issue-link.interface';
const JiraApi = require('jira-client');
let jira = null;
/**
 * @description Entry function to create or update a JIRA ticket associated to a vulnerability
 * @param {JiraInit} jiraInit
 * @param {Vulnerability} vulnerability
 * @returns success: return object errror: error message
 */
/* istanbul ignore next */
export const exportToJiraIssue = (vuln: Vulnerability, jiraInit: JiraInit): Promise<JiraResult> => {
  return new Promise(async (resolve, reject) => {
    initializeJira(jiraInit);
    const assessment = vuln.assessment;
    const parentKey = getIssueKey(assessment.jiraId);
    let assessmentIssue;
    try {
      assessmentIssue = await jira.getIssue(parentKey);
    } catch (err) {
      reject(
        `An error has occured. The JIRA issue ${getIssueKey(
          vuln.jiraId
        )} does not exist. Please update the JIRA URL and try again`
      );
      return;
    }
    const jiraIssue = await mapVulnToJiraIssue(vuln, assessmentIssue.fields.project.id);
    if (!vuln.jiraId) {
      try {
        const result = await addNewJiraIssue(jiraIssue, parentKey, vuln);
        resolve(result);
      } catch (err) {
        reject(err);
        return;
      }
    } else {
      try {
        const result = await updateExistingJiraIssue(
          jiraIssue,
          parentKey,
          vuln,
          assessmentIssue.fields.project.id,
          jiraInit
        );
        resolve(result);
      } catch (err) {
        reject(err);
        return;
      }
    }
  });
};
/**
 * @description Add new Jira issue
 * @param {any} jiraIssue
 * @param {string} parentUrl
 * @param {Vulnerability} vuln
 * @returns Jira result
 */
/* istanbul ignore next */
const addNewJiraIssue = (jiraIssue: any, parentKey: string, vuln: Vulnerability): Promise<JiraResult> => {
  return new Promise(async (resolve, reject) => {
    let saved: any;
    try {
      saved = await jira.addNewIssue(jiraIssue);
      if (parentKey) {
        await issueLink(parentKey, saved.key, (err, res) => {
          if (err) {
            console.error(err);
          }
        });
      }
    } catch (err) {
      console.error(err);
      reject('The JIRA export has failed.  If the issue continues, please contact an administrator');
      return;
    }
    const returnObj: JiraResult = {
      id: saved.id,
      key: saved.key,
      self: saved.self,
      message: `The vulnerability for "${vuln.name}" has been exported to JIRA.  Key: ${saved.key}`
    };
    if (vuln.screenshots) {
      attachImages(vuln, returnObj.id);
    }
    resolve(returnObj);
  });
};
/**
 * @description Update existing Jira issue
 * @param {any} jiraIssue
 * @param {string} parentUrl
 * @param {Vulnerability} vuln
 * @returns Jira result
 */
/* istanbul ignore next */
const updateExistingJiraIssue = (
  jiraIssue: any,
  parentKey: string,
  vuln: Vulnerability,
  projectId: string,
  jiraInit: JiraInit
): Promise<JiraResult> => {
  return new Promise(async (resolve, reject) => {
    let issueKey: string;
    let existingIssue: any;
    try {
      issueKey = getIssueKey(vuln.jiraId);
      existingIssue = await jira.getIssue(issueKey);
      const updatedJiraIssue = await mapVulnToJiraIssue(vuln, projectId);
      await jira.updateIssue(existingIssue.id, updatedJiraIssue);
      if (parentKey) {
        await issueLink(parentKey, existingIssue.key, (err, res) => {
          if (err) {
            console.error(err);
          }
        });
      }
    } catch (err) {
      reject(
        `An error has occured. The JIRA issue ${issueKey} does not exist. Please update the JIRA URL and try again`
      );
      return;
    }
    if (vuln.screenshots) {
      for await (const existScreenshot of existingIssue.fields.attachment) {
        deleteIssueAttachment(existScreenshot.id, jiraInit);
      }
      attachImages(vuln, existingIssue.id);
    }
    const returnObj: JiraResult = {
      id: existingIssue.id,
      key: existingIssue.key,
      self: existingIssue.self,
      message: `The vulnerability for "${vuln.name}" has been updated in JIRA.  Key: ${existingIssue.key}`
    };
    resolve(returnObj);
  });
};
/**
 * @description Links Jira ticket to parent ticket
 * @param callback
 * @param {string} issueKey
 * @param {string} parentUrl
 * @returns success: links jira issue to parent ticket
 */
/* istanbul ignore next */
const issueLink = async (parentUrl: string, issueKey: string, callback) => {
  const parentKey = getIssueKey(parentUrl);
  const link: IssueLink = {
    outwardIssue: {
      key: parentKey
    },
    inwardIssue: {
      key: issueKey
    },
    type: {
      name: 'Blocks'
    }
  };
  try {
    await jira.issueLink(link);
    return;
  } catch (err) {
    console.error(err);
    callback(`The JIRA Project "${parentKey}" does not exist.`);
  }
};
/**
 * @description Deletes Jira ticket attachment
 * @param {string} id
 * @param {JiraInit} jiraInit
 * @returns success: return object errror: error message
 */
/* istanbul ignore next */
const deleteIssueAttachment = (id: string, jiraInit: JiraInit) => {
  const auth = `${jiraInit.username}:${decrypt(jiraInit.apiKey)}`;
  fetch(`https://${jiraInit.host}/rest/api/3/attachment/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Basic ${Buffer.from(auth).toString('base64')}`
    }
  })
    .then((response) => {
      // tslint:disable-next-line: no-console
      console.info(`${response.status} ${response.statusText}`);
    })
    .catch((err) => {
      console.error(err);
    });
};
/**
 * @description Returns Jira issue key
 * @param {string} url
 * @returns string of key
 */
export const getIssueKey = (url: string): string => {
  const ary: string[] = url.split('/');
  return ary[ary.length - 1];
};
/**
 * @description Initializes Jira
 * @param {JiraInit} jiraInit
 * @returns nothing
 */
/* istanbul ignore next */
const initializeJira = (jiraInit: JiraInit) => {
  jira = new JiraApi({
    protocol: 'https',
    host: jiraInit.host,
    username: jiraInit.username,
    password: decrypt(jiraInit.apiKey),
    apiVersion: '3',
    strictSSL: true
  });
};
/**
 * @description Attaches one-to-many images to Jira ticket
 * @param {string} issueId
 * @param {Vulnerability} vulnerability
 * @returns nothing
 */
/* istanbul ignore next */
const attachImages = async (vuln: Vulnerability, issueId: string) => {
  for await (const screenshot of vuln.screenshots) {
    // TODO: Figure out a way to create a stream from the buffer and pass that in
    // Instead of creating a temporary file on the file system
    const extension = mime.extension(screenshot.mimetype);
    const path = `./src/temp/${screenshot.originalname}.${extension}`;
    await fs.writeFileSync(path, screenshot.buffer);
    const stream = await fs.createReadStream(path);
    await fs.unlinkSync(path);
    try {
      jira.addAttachmentOnIssue(issueId, stream);
    } catch (err) {
      console.error(err);
    }
  }
};
/**
 * @description Maps Vulnerability information to Jira ticket
 * @param {string} projectId
 * @param {Vulnerability} vulnerability
 * @returns JiraIssue object
 */
export const mapVulnToJiraIssue = async (vuln: Vulnerability, projectId: string) => {
  const probLocRows = await dynamicProbLocTableRows(vuln);
  const resourceRows = await dynamicResourceTableRows(vuln);
  const jiraIssue: JiraIssue = {
    update: {},
    fields: {
      project: {
        id: projectId.toString()
      },
      priority: {
        name: mapRiskToSeverity(vuln.risk)
      },
      summary: vuln.name,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `Impact: ${vuln.impact}`,
                marks: [
                  {
                    type: 'strong'
                  }
                ]
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `Likelihood: ${vuln.likelihood}`,
                marks: [
                  {
                    type: 'strong'
                  }
                ]
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `Overall Risk: ${vuln.risk}`,
                marks: [
                  {
                    type: 'strong'
                  }
                ]
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `Systemic: ${vuln.systemic}`,
                marks: [
                  {
                    type: 'strong'
                  }
                ]
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `CVSS Score: ${vuln.cvssScore}`,
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: vuln.cvssUrl
                    }
                  }
                ]
              }
            ]
          },
          {
            type: 'table',
            attrs: {
              isNumberColumnEnabled: false,
              layout: 'default'
            },
            content: probLocRows
          },
          {
            type: 'paragraph',
            content: [
              {
                text: j2m.to_jira(vuln.description),
                type: 'text'
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                text: j2m.to_jira(vuln.detailedInfo),
                type: 'text'
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Remediation',
                marks: [
                  {
                    type: 'strong'
                  }
                ]
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                text: j2m.to_jira(vuln.remediation),
                type: 'text'
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Resources',
                marks: [
                  {
                    type: 'strong'
                  }
                ]
              }
            ]
          },
          {
            type: 'table',
            attrs: {
              isNumberColumnEnabled: false,
              layout: 'default'
            },
            content: resourceRows
          }
        ]
      },
      issuetype: {
        name: 'Bug'
      }
    }
  };
  return jiraIssue;
};
/**
 * @description Dynamically creates Jira table for problem locations
 * @param {Vulnerability} vulnerability
 * @returns table rows
 */
const dynamicProbLocTableRows = async (vuln: Vulnerability) => {
  const rows = [];
  rows.push({
    type: 'tableRow',
    content: [
      {
        type: 'tableHeader',
        attrs: {},
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Problem Location'
              }
            ]
          }
        ]
      },
      {
        type: 'tableHeader',
        attrs: {},
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Target'
              }
            ]
          }
        ]
      }
    ]
  });
  if (vuln.problemLocations && vuln.problemLocations.length) {
    for await (const probLoc of vuln.problemLocations) {
      const row = {
        type: 'tableRow',
        content: [
          {
            type: 'tableCell',
            attrs: {},
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: probLoc.location
                  }
                ]
              }
            ]
          },
          {
            type: 'tableCell',
            attrs: {},
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: probLoc.target
                  }
                ]
              }
            ]
          }
        ]
      };
      rows.push(row);
    }
  }
  return rows;
};
/**
 * @description Dynamically creates Jira table for resources
 * @param {Vulnerability} vulnerability
 * @returns table rows
 */
const dynamicResourceTableRows = async (vuln: Vulnerability) => {
  const rows = [];
  rows.push({
    type: 'tableRow',
    content: [
      {
        type: 'tableHeader',
        attrs: {},
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Description'
              }
            ]
          }
        ]
      },
      {
        type: 'tableHeader',
        attrs: {},
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Resource URL'
              }
            ]
          }
        ]
      }
    ]
  });
  if (vuln.resources && vuln.resources.length) {
    for await (const resource of vuln.resources) {
      const row = {
        type: 'tableRow',
        content: [
          {
            type: 'tableCell',
            attrs: {},
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: resource.description
                  }
                ]
              }
            ]
          },
          {
            type: 'tableCell',
            attrs: {},
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: resource.url,
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: resource.url
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };
      rows.push(row);
    }
  }
  return rows;
};
/**
 * @description Maps overall risk severity to Jira priority
 * @param {Vulnerability} vulnerability
 * @returns jira priority string
 */
export const mapRiskToSeverity = (risk: string) => {
  switch (risk) {
    case 'Informational':
      return 'Lowest';
    case 'Low':
      return 'Low';
    case 'Medium':
      return 'Medium';
    case 'High':
      return 'High';
    case 'Critical':
      return 'Highest';
    default:
      return '';
  }
};
