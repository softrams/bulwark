import { JiraIssue } from 'src/interfaces/jira/jira-issue.interface';
import { Vulnerability } from '../entity/Vulnerability';
import { JiraInit } from 'src/interfaces/jira/jira-init.interface';
import { decrypt } from './crypto.utility';
import { JiraResult } from 'src/interfaces/jira/jira-result.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { IssueLink } from 'src/interfaces/jira/jira-issue-link.interface';
// Use fetch-node version 2 with CommonJS compatibility
const fetch = require('node-fetch');
const j2m = require('jira2md');
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
    try {
      initializeJira(jiraInit);
      const assessment = vuln.assessment;
      const parentKey = getIssueKey(assessment.jiraId);
      let assessmentIssue;
      
      try {
        assessmentIssue = await jira.getIssue(parentKey);
      } catch (err) {
        console.error('Error fetching Jira issue:', err);
        reject(
          `An error has occurred. The JIRA issue ${getIssueKey(
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
          console.error('Error adding new Jira issue:', err);
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
          console.error('Error updating existing Jira issue:', err);
          reject(err);
          return;
        }
      }
    } catch (error) {
      console.error('Error in exportToJiraIssue:', error);
      reject('An error occurred while exporting to Jira');
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
    try {
      let saved: any;
      try {
        saved = await jira.addNewIssue(jiraIssue);
        if (parentKey) {
          await issueLink(parentKey, saved.key, (err, res) => {
            if (err) {
              console.error('Error linking issues:', err);
            }
          });
        }
      } catch (err) {
        console.error('Error creating Jira issue:', err);
        reject('The Jira export has failed.');
        return;
      }
      
      const returnObj: JiraResult = {
        id: saved.id,
        key: saved.key,
        self: saved.self,
        message: `The vulnerability for "${vuln.name}" has been exported to Jira. Key: ${saved.key}`
      };
      
      if (vuln.screenshots && vuln.screenshots.length > 0) {
        await attachImages(vuln, returnObj.id);
      }
      
      resolve(returnObj);
    } catch (error) {
      console.error('Error in addNewJiraIssue:', error);
      reject('An error occurred while adding a new Jira issue');
    }
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
    try {
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
              console.error('Error linking issues:', err);
            }
          });
        }
      } catch (err) {
        console.error('Error updating Jira issue:', err);
        reject(
          `An error has occurred. The JIRA issue ${issueKey} does not exist. Please update the Jira field with a valid URL and try again.`
        );
        return;
      }
      
      // Process attachments
      if (vuln.screenshots && vuln.screenshots.length > 0) {
        // Delete existing attachments
        if (existingIssue.fields.attachment && existingIssue.fields.attachment.length > 0) {
          for (const existScreenshot of existingIssue.fields.attachment) {
            await deleteIssueAttachment(existScreenshot.id, jiraInit);
          }
        }
        
        // Add new attachments
        await attachImages(vuln, existingIssue.id);
      }
      
      const returnObj: JiraResult = {
        id: existingIssue.id,
        key: existingIssue.key,
        self: existingIssue.self,
        message: `The vulnerability for "${vuln.name}" has been updated in JIRA. Key: ${existingIssue.key}`
      };
      
      resolve(returnObj);
    } catch (error) {
      console.error('Error in updateExistingJiraIssue:', error);
      reject('An error occurred while updating the Jira issue');
    }
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
  try {
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
      console.error('Error linking Jira issues:', err);
      callback(`The JIRA Project "${parentKey}" does not exist.`);
    }
  } catch (error) {
    console.error('Error in issueLink:', error);
    callback('An error occurred while linking issues');
  }
};

/**
 * @description Deletes Jira ticket attachment
 * @param {string} id
 * @param {JiraInit} jiraInit
 * @returns success: return object errror: error message
 */
/* istanbul ignore next */
const deleteIssueAttachment = async (id: string, jiraInit: JiraInit) => {
  try {
    const auth = `${jiraInit.username}:${decrypt(jiraInit.apiKey)}`;
    const response = await fetch(`https://${jiraInit.host}/rest/api/3/attachment/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${Buffer.from(auth).toString('base64')}`
      }
    });
    
    console.info(`Attachment deletion status: ${response.status} ${response.statusText}`);
  } catch (err) {
    console.error('Error deleting Jira attachment:', err);
  }
};

/**
 * @description Returns Jira issue key
 * @param {string} url
 * @returns string of key
 */
export const getIssueKey = (url: string): string => {
  try {
    if (!url) {
      return '';
    }
    
    const ary: string[] = url.split('/');
    return ary[ary.length - 1];
  } catch (error) {
    console.error('Error getting issue key:', error);
    return '';
  }
};

/**
 * @description Initializes Jira
 * @param {JiraInit} jiraInit
 * @returns nothing
 */
/* istanbul ignore next */
const initializeJira = (jiraInit: JiraInit) => {
  try {
    jira = new JiraApi({
      protocol: 'https',
      host: jiraInit.host,
      username: jiraInit.username,
      password: decrypt(jiraInit.apiKey),
      apiVersion: '3',
      strictSSL: true
    });
  } catch (error) {
    console.error('Error initializing Jira:', error);
    throw new Error('Failed to initialize Jira client');
  }
};

/**
 * @description Attaches one-to-many images to Jira ticket
 * @param {string} issueId
 * @param {Vulnerability} vulnerability
 * @returns nothing
 */
/* istanbul ignore next */
const attachImages = async (vuln: Vulnerability, issueId: string) => {
  try {
    if (!vuln.screenshots || vuln.screenshots.length === 0) {
      return;
    }
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    for (const screenshot of vuln.screenshots) {
      try {
        // Get file extension from mimetype
        const extension = mime.extension(screenshot.mimetype) || 'jpg';
        const filename = screenshot.originalname || `screenshot_${Date.now()}.${extension}`;
        const filepath = path.join(tempDir, filename);
        
        // Write buffer to temporary file
        await fs.writeFileSync(filepath, screenshot.buffer);
        const stream = fs.createReadStream(filepath);
        
        // Add attachment to Jira issue
        await jira.addAttachmentOnIssue(issueId, stream);
        
        // Clean up temporary file
        await fs.unlinkSync(filepath);
      } catch (err) {
        console.error('Error attaching image to Jira issue:', err);
      }
    }
  } catch (error) {
    console.error('Error in attachImages:', error);
  }
};

/**
 * @description Maps Vulnerability information to Jira ticket
 * @param {string} projectId
 * @param {Vulnerability} vulnerability
 * @returns JiraIssue object
 */
export const mapVulnToJiraIssue = async (vuln: Vulnerability, projectId: string) => {
  try {
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
                  text: j2m.to_jira(vuln.description || ''),
                  type: 'text'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  text: j2m.to_jira(vuln.detailedInfo || ''),
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
                  text: j2m.to_jira(vuln.remediation || ''),
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
  } catch (error) {
    console.error('Error mapping vulnerability to Jira issue:', error);
    throw new Error('Failed to map vulnerability to Jira issue');
  }
};

/**
 * @description Dynamically creates Jira table for problem locations
 * @param {Vulnerability} vulnerability
 * @returns table rows
 */
const dynamicProbLocTableRows = async (vuln: Vulnerability) => {
  try {
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
      for (const probLoc of vuln.problemLocations) {
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
                      text: probLoc.location || ''
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
                      text: probLoc.target || ''
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
  } catch (error) {
    console.error('Error creating problem location table rows:', error);
    return [];
  }
};

/**
 * @description Dynamically creates Jira table for resources
 * @param {Vulnerability} vulnerability
 * @returns table rows
 */
const dynamicResourceTableRows = async (vuln: Vulnerability) => {
  try {
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
      for (const resource of vuln.resources) {
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
                      text: resource.description || ''
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
                      text: resource.url || '',
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
  } catch (error) {
    console.error('Error creating resource table rows:', error);
    return [];
  }
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