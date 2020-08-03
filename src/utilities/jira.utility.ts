import * as JiraApi from 'jira-client';
import { JiraIssue } from 'src/interfaces/jira/jira-issue.interface';
import { JiraProject } from 'src/interfaces/jira/jira-project.interface';
import { IssueType } from 'src/interfaces/jira/jira-issue-type.interface';

// Initialize
const jira = new JiraApi({
  protocol: 'https',
  host: process.env.JIRA_HOST,
  username: process.env.JIRA_USERNAME,
  password: process.env.JIRA_API_KEY,
  apiVersion: '2',
  strictSSL: true
});

export const addNewIssue = async (issue) => {
  try {
    const saved = await jira.addNewIssue(issue);
    console.log(saved);
  } catch (err) {
    console.error(err.message);
  }
};

const jiraProject: JiraProject = {
  key: 'bul',
  id: 10000
};

const x = {
  project: {
    key: 'bul',
    id: '10000'
  },
  summary: 'REST ye merry gentlemen.',
  description: 'Creating of an issue using project keys and issue type names using the REST API',
  issuetype: {
    name: 'Bug'
  }
};

const jiraIssue: JiraIssue = {
  key: 'First Test',
  project: jiraProject,
  summary: 'REST ye merry gentlemen.',
  description: 'Creating of an issue using project keys and issue type names using the REST API',
  issueType: {
    name: 'Bug'
  } as IssueType
};

console.log(jiraIssue);

addNewIssue(jiraIssue);
