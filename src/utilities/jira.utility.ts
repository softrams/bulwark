import { jira } from '../app';
import { JiraProject } from 'src/interfaces/jira/jira-project.interface';
import { IssueType } from 'src/interfaces/jira/jira-issue-type.interface';
import { JiraIssue } from 'src/interfaces/jira/jira-issue.interface';
import { Vulnerability } from 'src/entity/Vulnerability';
import { UserRequest } from 'src/interfaces/user-request.interface';
import { JiraUser } from 'src/interfaces/jira/jira-user.interface';
import { JiraPriority } from 'src/interfaces/jira/jira-issue-priority.interface';

export const addNewIssue = (vuln: Vulnerability) => {
  return new Promise(async (resolve, reject) => {
    const jiraIssue = mapVulnToJiraIssue(vuln);
    try {
      const saved = await jira.addNewIssue(jiraIssue);
      resolve(saved);
      return saved;
    } catch (err) {
      console.error(err.message);
      reject(err);
    }
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
