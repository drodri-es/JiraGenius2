import type { JiraIssue } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const mockIssues: JiraIssue[] = [
  {
    id: 'PROJ-123',
    title: 'Implement dark mode for the entire application',
    type: 'Story',
    status: 'In Progress',
    priority: 'High',
    assignee: {
      name: 'Alice Johnson',
      avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl || `https://picsum.photos/seed/1/32/32`,
    },
    description:
      'The user interface should support a dark mode theme to reduce eye strain in low-light environments. This involves updating all components, including text, backgrounds, and icons, to use a new color palette. The dark mode should be the default theme for the application.',
    createdAt: '2023-10-26T10:00:00Z',
    updatedAt: '2023-10-27T14:30:00Z',
  },
  {
    id: 'PROJ-124',
    title: 'Fix authentication bug on login page',
    type: 'Bug',
    status: 'To Do',
    priority: 'Highest',
    assignee: {
      name: 'Bob Williams',
      avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl || `https://picsum.photos/seed/2/32/32`,
    },
    description:
      'Users are reporting that they are unable to log in, even with correct credentials. The error message "Invalid credentials" is shown, but the server logs do not indicate any failed authentication attempts. This seems to be a client-side issue, possibly related to how the form data is being sent.',
    createdAt: '2023-10-27T11:00:00Z',
    updatedAt: '2023-10-27T11:00:00Z',
  },
  {
    id: 'PROJ-125',
    title: 'Set up CI/CD pipeline for automated deployments',
    type: 'Task',
    status: 'Done',
    priority: 'Medium',
    assignee: {
      name: 'Charlie Brown',
      avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl || `https://picsum.photos/seed/3/32/32`,
    },
    description:
      'A continuous integration and continuous deployment (CI/CD) pipeline needs to be established to automate the build, test, and deployment processes. We will use GitHub Actions to trigger builds on every push to the main branch and deploy to the staging environment.',
    createdAt: '2023-10-25T09:00:00Z',
    updatedAt: '2023-10-26T17:00:00Z',
  },
  {
    id: 'PROJ-126',
    title: 'Design new user profile page',
    type: 'Story',
    status: 'To Do',
    priority: 'Medium',
    assignee: {
      name: 'Diana Prince',
      avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl || `https://picsum.photos/seed/4/32/32`,
    },
    description:
      'Create a new user profile page that displays user information, activity, and settings. The design should be clean, modern, and consistent with the rest of the application. It should include sections for personal details, account security, and notification preferences.',
    createdAt: '2023-10-28T10:00:00Z',
    updatedAt: '2023-10-28T10:00:00Z',
  },
    {
    id: 'PROJ-127',
    title: 'API rate limit issue on /users endpoint',
    type: 'Bug',
    status: 'In Progress',
    priority: 'High',
    assignee: {
      name: 'Bob Williams',
      avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl || `https://picsum.photos/seed/2/32/32`,
    },
    description:
      'The `/users` endpoint is hitting the API rate limit too quickly, causing service disruptions for other parts of the application. The current implementation fetches all users at once. This needs to be optimized, perhaps with pagination or caching, to reduce the number of API calls.',
    createdAt: '2023-10-28T12:00:00Z',
    updatedAt: '2023-10-28T15:00:00Z',
  },
  {
    id: 'PROJ-128',
    title: 'Update documentation for the new API version',
    type: 'Task',
    status: 'To Do',
    priority: 'Low',
    assignee: {
      name: 'Eve Adams',
      avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl || `https://picsum.photos/seed/5/32/32`,
    },
    description:
      'The developer documentation needs to be updated to reflect the changes in the new API v2. This includes updating endpoint descriptions, request/response examples, and authentication guidelines. The documentation is written in Markdown and hosted on our developer portal.',
    createdAt: '2023-10-28T16:00:00Z',
    updatedAt: '2023-10-28T16:00:00Z',
  },
];

export const fetchJiraIssues = async (): Promise<JiraIssue[]> => {
  // In a real app, you would use credentials to fetch from Jira API
  // For now, we simulate a network delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIssues);
    }, 1000);
  });
};

export const fetchJiraIssue = async (id: string): Promise<JiraIssue | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIssues.find(issue => issue.id === id));
    }, 500);
  });
};
