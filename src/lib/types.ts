export type IssueType = 'Story' | 'Task' | 'Bug';
export type IssueStatus = 'To Do' | 'In Progress' | 'Done';
export type IssuePriority = 'Highest' | 'High' | 'Medium' | 'Low';

export interface JiraIssue {
  id: string;
  key: string; 
  fields: {
    summary: string;
    issuetype: {
      name: string;
      iconUrl: string;
    };
    status: {
      name: string;
    };
    priority: {
      name: string;
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
    // Story Points is a custom field. The key might vary between Jira instances.
    customfield_10026?: number;
    labels: string[];
  }
}

export interface JiraProject {
  id: string;
  key: string;
  name:string;
  avatarUrls: {
    '48x48': string;
  };
  projectTypeKey: string;
}

export interface JiraSprint {
    id: number;
    name: string;
    state: 'active' | 'closed' | 'future';
    startDate?: string;
    endDate?: string;
    completeDate?: string;
}

export interface SprintReport {
    sprintName: string;
    completedIssues: number;
    totalStoryPoints: number;
}
