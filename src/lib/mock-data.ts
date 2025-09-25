import type { JiraIssue, JiraProject } from './types';
import { PlaceHolderImages } from './placeholder-images';

const mockAssignees = {
    'Alice Johnson': {
        name: 'Alice Johnson',
        avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl || `https://picsum.photos/seed/1/32/32`,
    },
    'Bob Williams': {
        name: 'Bob Williams',
        avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl || `https://picsum.photos/seed/2/32/32`,
    },
     'Charlie Brown': {
      name: 'Charlie Brown',
      avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl || `https://picsum.photos/seed/3/32/32`,
    },
    'Diana Prince': {
        name: 'Diana Prince',
        avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl || `https://picsum.photos/seed/4/32/32`,
    },
    'Eve Adams': {
        name: 'Eve Adams',
        avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl || `https://picsum.photos/seed/5/32/32`,
    }
}


export const mockIssues: JiraIssue[] = [];


export const mockProjects: JiraProject[] = [
  {
    id: '10000',
    key: 'PROJ',
    name: 'JiraGenius AI App',
    avatarUrls: { '48x48': 'https://picsum.photos/seed/project1/48/48' },
    projectTypeKey: 'software',
  },
  {
    id: '10001',
    key: 'WEB',
    name: 'Company Website',
    avatarUrls: { '48x48': 'https://picsum.photos/seed/project2/48/48' },
    projectTypeKey: 'business',
  },
  {
    id: '10002',
    key: 'MOB',
    name: 'Mobile App Refresh',
    avatarUrls: { '48x48': 'https://picsum.photos/seed/project3/48/48' },
    projectTypeKey: 'software',
  },
  {
    id: '10003',
    key: 'DS',
    name: 'Design System',
    avatarUrls: { '48x48': 'https://picsum.photos/seed/project4/48/48' },
    projectTypeKey: 'software',
  },
];


export const fetchJiraIssues = async (projectKey: string): Promise<JiraIssue[]> => {
  // In a real app, you would use credentials to fetch from Jira API
  // For now, we simulate a network delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([]);
    }, 1000);
  });
};

export const fetchJiraIssue = async (id: string): Promise<JiraIssue | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIssues.find(issue => issue.key === id));
    }, 500);
  });
};

export const fetchJiraProjects = async (): Promise<JiraProject[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockProjects);
    }, 1000);
  });
};
