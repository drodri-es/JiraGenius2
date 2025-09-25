import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Book,
  Bug,
  Calendar,
  CheckCircle,
  CheckSquare,
  Circle,
  CircleDot,
  Clock,
  User,
} from 'lucide-react';
import { notFound } from 'next/navigation';

import { AiToolsPanel } from '@/app/(app)/issue/[id]/AiToolsPanel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import type { JiraIssue } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const issueTypeIcons: Record<string, React.ReactNode> = {
  Bug: <Bug className="h-4 w-4 text-red-400" />,
  Story: <Book className="h-4 w-4 text-green-400" />,
  Task: <CheckSquare className="h-4 w-4 text-blue-400" />,
};

const issuePriorityIcons: Record<string, React.ReactNode> = {
  Highest: <ArrowUp className="h-4 w-4 text-red-500" />,
  High: <ArrowUp className="h-4 w-4 text-orange-400" />,
  Medium: <ArrowRight className="h-4 w-4 text-yellow-400" />,
  Low: <ArrowDown className="h-4 w-4 text-green-400" />,
};

const issueStatusIcons: Record<string, React.ReactNode> = {
  'To Do': <Circle className="h-4 w-4 text-blue-400" />,
  'In Progress': <CircleDot className="h-4 w-4 text-yellow-400" />,
  Done: <CheckCircle className="h-4 w-4 text-green-400" />,
};

// This is a server component, but we need credentials for the API call.
// We can't use the `useJiraConnection` hook directly.
// A better approach would be to pass credentials from a client component
// or handle authentication server-side (e.g., with NextAuth.js).
// For this example, we'll fetch credentials on the server if possible,
// but ideally this would be refactored.

async function fetchJiraIssue(id: string, creds: any): Promise<JiraIssue | null> {
    if (!creds) return null;
    try {
        const response = await fetch(`http://localhost:9002/api/jira/issues/${id}`, {
            method: 'POST', // Assuming the endpoint to get a single issue is similar
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(creds),
            cache: 'no-store', // Don't cache issue details
        });
        
        // The search endpoint returns a list, so we might need to adjust if there's a direct issue endpoint
        const data = await response.json();

        // If search returns an array, take the first one. If it's a direct object, use it.
        const issue = Array.isArray(data) ? data.find(i => i.key === id) : data;

        if (!response.ok || !issue) {
            console.error("Failed to fetch issue", data);
            return null;
        }

        return issue;
    } catch (error) {
        console.error("Error fetching issue:", error);
        return null;
    }
}


function JiraIssueDescription({ description }: { description: JiraIssue['fields']['description'] }) {
    if (!description) {
        return <p className="text-muted-foreground">No description provided.</p>;
    }
    if (typeof description === 'string') {
        return <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{description}</p>;
    }
    if (description?.type === 'doc') {
        const renderContent = (content: any[]) => {
            return content.map((node, index) => {
                if (node.type === 'paragraph') {
                    return (
                        <p key={index} className="text-foreground/80 leading-relaxed mb-4">
                            {node.content?.map((textNode: any) => textNode.text).join('') || ''}
                        </p>
                    );
                }
                return null;
            });
        };
        return <div>{renderContent(description.content)}</div>;
    }
    return <p className="text-muted-foreground">Description format not supported.</p>;
}


export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  // This is a workaround to get credentials in a server component.
  // In a real app, you'd manage session/auth state differently.
  const issue: JiraIssue | null = null; // We will fetch on the client.
  
  // This page will now be client-rendered to use the context hook.
  // The functionality is moved to a client component.
  return <IssueDetailClientPage issueId={params.id} />
}


'use client';
import React from 'react';

function IssueDetailClientPage({ issueId }: { issueId: string }) {
    const { credentials, status } = useJiraConnection();
    const [issue, setIssue] = React.useState<JiraIssue | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function getIssue() {
            if (status === 'connected' && credentials) {
                setIsLoading(true);
                const response = await fetch(`/api/jira/issues/${issueId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials),
                });
                if (response.ok) {
                    const data = await response.json();
                     // The API route returns all issues for a project, so we find the specific one.
                    const singleIssue = data.find((i: JiraIssue) => i.key === issueId) || (data.key === issueId ? data : null);
                    setIssue(singleIssue);
                } else {
                    setIssue(null);
                }
                setIsLoading(false);
            } else if (status !== 'connecting') {
                setIsLoading(false);
            }
        }
        getIssue();
    }, [issueId, credentials, status]);
    
    if (isLoading) {
        return (
          <div className="p-4 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-grow">
                <header className="mb-6">
                  <div className="h-5 w-24 mb-3 bg-muted animate-pulse rounded-md" />
                  <div className="h-10 w-4/5 bg-muted animate-pulse rounded-md" />
                </header>
                
                <div className="h-6 w-48 mb-4 mt-8 bg-muted animate-pulse rounded-md" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded-md" />
                </div>
              </div>
      
              <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-6">
                <div className="p-4 border rounded-lg">
                  <div className="h-6 w-24 mb-4 bg-muted animate-pulse rounded-md" />
                  <div className="space-y-4">
                    <div className="h-8 w-full bg-muted animate-pulse rounded-md" />
                    <div className="h-8 w-full bg-muted animate-pulse rounded-md" />
                    <div className="h-8 w-full bg-muted animate-pulse rounded-md" />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        );
    }

  if (!issue) {
    return notFound();
  }
  
  const descriptionText = typeof issue.fields.description === 'string' 
    ? issue.fields.description 
    : issue.fields.description?.content?.map(
        (p: any) => p.content?.map((t: any) => t.text).join('') || ''
      ).join('\n') || '';

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow max-w-full lg:max-w-4xl">
          <header className="mb-6">
            <p className="text-muted-foreground mb-2">{issue.key}</p>
            <h1 className="text-3xl lg:text-4xl font-headline font-bold">{issue.fields.summary}</h1>
          </header>

          <div className="mt-8">
            <h2 className="font-headline text-2xl font-semibold mb-4 border-b pb-2">Description</h2>
            <JiraIssueDescription description={issue.fields.description} />
          </div>
        </div>

        <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="flex items-center gap-2">
                  {issueStatusIcons[issue.fields.status.name]}
                  <span>{issue.fields.status.name}</span>
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Priority</span>
                <div className="flex items-center gap-2">
                  {issuePriorityIcons[issue.fields.priority.name]}
                  <span>{issue.fields.priority.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <div className="flex items-center gap-2">
                  {issueTypeIcons[issue.fields.issuetype.name]}
                  <span>{issue.fields.issuetype.name}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <User size={16} />
                  Assignee
                </span>
                {issue.fields.assignee ? (
                    <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={issue.fields.assignee.avatarUrls['48x48']} alt={issue.fields.assignee.displayName} />
                      <AvatarFallback>{issue.fields.assignee.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{issue.fields.assignee.displayName}</span>
                  </div>
                ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar size={16} />
                  Created
                </span>
                <span>{formatDistanceToNow(new Date(issue.fields.created), { addSuffix: true })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock size={16} />
                  Updated
                </span>
                <span>{formatDistanceToNow(new Date(issue.fields.updated), { addSuffix: true })}</span>
              </div>
            </CardContent>
          </Card>

          <AiToolsPanel issueDescription={descriptionText} />
        </aside>
      </div>
    </div>
  );
}
