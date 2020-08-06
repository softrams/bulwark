import { JiraProject } from 'src/interfaces/jira/jira-project.interface';
import { IssueType } from 'src/interfaces/jira/jira-issue-type.interface';
import { JiraIssue } from 'src/interfaces/jira/jira-issue.interface';
import { Vulnerability } from 'src/entity/Vulnerability';
import { JiraPriority } from 'src/interfaces/jira/jira-issue-priority.interface';
import { JiraInit } from 'src/interfaces/jira/jira-init.interface';
import { decrypt } from './crypto.utility';
import { JiraResult } from 'src/interfaces/jira/jira-result.interface';
import * as fs from 'fs';
import * as mime from 'mime-types';
const JiraApi = require('jira-client');
let jira = null;
export const addNewVulnIssue = (vuln: Vulnerability, jiraInit: JiraInit): Promise<JiraResult> => {
  return new Promise(async (resolve, reject) => {
    initializeJira(jiraInit);
    const jiraIssue = mapVulnToJiraIssue(vuln);
    if (!vuln.jiraId) {
      let saved: any;
      try {
        saved = await jira.addNewIssue(jiraIssue);
      } catch (err) {
        console.error(err);
        reject('The JIRA export has failed.  If the issue continues, please contact an administrator');
      }
      const returnObj: JiraResult = {
        id: saved.id,
        key: saved.key,
        self: saved.self,
        message: `The vulnerability for "${vuln.name}" has been exported to JIRA.  Key: ${saved.key}`
      };
      if (vuln.screenshots) {
        for await (const screenshot of vuln.screenshots) {
          // TODO: Figure out a way to create a stream from the buffer and pass that in
          // Instead of creating a temporary file on the file system
          const extension = mime.extension(screenshot.mimetype);
          const path = `./src/temp/${screenshot.originalname}.${extension}`;
          await fs.writeFileSync(path, screenshot.buffer);
          const stream = await fs.createReadStream(path);
          await fs.unlinkSync(path);
          try {
            jira.addAttachmentOnIssue(returnObj.id, stream);
          } catch (err) {
            console.error(err);
          }
        }
      }
      resolve(returnObj);
    } else {
      let issueKey: string;
      try {
        const ary: string[] = vuln.jiraId.split('/');
        issueKey = ary[ary.length - 1];
        const existingIssue = await jira.getIssue(issueKey);
        const returnObj: JiraResult = {
          id: existingIssue.id,
          key: existingIssue.key,
          self: existingIssue.self,
          message: `The vulnerability for "${vuln.name}" has been updated in JIRA.  Key: ${existingIssue.key}`
        };
        resolve(returnObj);
      } catch (err) {
        reject(
          `An error has occured. The JIRA issue ${issueKey} does not exist. Please update the JIRA URL and try again`
        );
      }
    }
  });
};

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
const mapVulnToJiraIssue = (vuln: Vulnerability): JiraIssue => {
  const project: JiraProject = {
    id: '10000'
  };
  const priority: JiraPriority = {
    key: mapRiskToSeverity(vuln.risk)
  };
  const issueType: IssueType = {
    id: '10000'
  };

  const jiraIssue: JiraIssue = {
    update: {},
    fields: {
      project,
      summary: vuln.name,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                text: vuln.description + vuln.detailedInfo,
                type: 'text'
              }
            ]
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

const mapRiskToSeverity = (risk: string) => {
  switch (risk) {
    case 'informational':
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

const bodyData = {
  update: {},
  fields: {
    summary: 'Main order flow broken',
    parent: {
      key: 'PROJ-123'
    },
    issuetype: {
      id: '10000'
    },
    components: [
      {
        id: '10000'
      }
    ],
    customfield_20000: '06/Jul/19 3:25 PM',
    customfield_40000: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              text: 'Occurs on all orders',
              type: 'text'
            }
          ]
        }
      ]
    },
    customfield_70000: ['jira-administrators', 'jira-software-users'],
    project: {
      id: '10000'
    },
    description: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              text: 'Order entry fails when selecting supplier.',
              type: 'text'
            }
          ]
        }
      ]
    },
    reporter: {
      id: '5b10a2844c20165700ede21g'
    },
    fixVersions: [
      {
        id: '10001'
      }
    ],
    customfield_10000: '09/Jun/19',
    priority: {
      id: '20000'
    },
    labels: ['bugfix', 'blitz_test'],
    timetracking: {
      remainingEstimate: '5',
      originalEstimate: '10'
    },
    customfield_30000: ['10000', '10002'],
    customfield_80000: {
      value: 'red'
    },
    security: {
      id: '10000'
    },
    environment: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              text: 'UAT',
              type: 'text'
            }
          ]
        }
      ]
    },
    versions: [
      {
        id: '10000'
      }
    ],
    duedate: '2019-05-11',
    customfield_60000: 'jira-software-users',
    customfield_50000: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              text: 'Could impact day-to-day work.',
              type: 'text'
            }
          ]
        }
      ]
    },
    assignee: {
      id: '5b109f2e9729b51b54dc274d'
    }
  }
};
