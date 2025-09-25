export type IssueType = 'Story' | 'Task' | 'Bug';
export type IssueStatus = 'To Do' | 'In Progress' | 'Done';
export type IssuePriority = 'Highest' | 'High' | 'Medium' | 'Low';

export interface JiraIssue {
  id: string;
  title: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: {
    name: string;
    avatarUrl: string;
  };
  description: string;
  createdAt: string;
  updatedAt: string;
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
