export type IssueType = 'Story' | 'Task' | 'Bug';
export type IssueStatus = 'To Do' | 'In Progress' | 'Done';
export type IssuePriority = 'Highest' | 'High' | 'Medium' | 'Low';

export interface JiraIssue {
  id: string;
  key: string; // Added key field
  fields: {
    summary: string;
    issuetype: {
      name: IssueType;
      iconUrl: string;
    };
    status: {
      name: IssueStatus;
    };
    priority: {
      name: IssuePriority;
      iconUrl: string;
    };
    assignee: {
      displayName: string;
      avatarUrls: {
        '48x48': string;
      };
    } | null;
    description: {
        type: string;
        version: number;
        content: any[];
    } | string | null;
    created: string;
    updated: string;
  }
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrls: {
    '48x48': string;
  };
  projectTypeKey: string;
}
