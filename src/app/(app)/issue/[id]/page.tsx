'use client';

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
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

import { AiToolsPanel } from '@/app/(app)/issue/[id]/AiToolsPanel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import type { JiraIssue } from '@/lib/types';
import IssueDetailLoading from './loading';

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

export default function IssueDetailPage({ params }: { params: { id: string } }) {
    const { credentials, status } = useJiraConnection();
    const [issue, setIssue] = React.useState<JiraIssue | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function getIssue() {
            if (status === 'connected' && credentials) {
                setIsLoading(true);
                try {
                    const response = await fetch(`/api/jira/issues/${params.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(credentials),
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setIssue(data);
                    } else {
                        setIssue(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch issue", error);
                    setIssue(null);
                } finally {
                    setIsLoading(false);
                }
            } else if (status !== 'connecting') {
                setIsLoading(false);
            }
        }
        getIssue();
    }, [params.id, credentials, status]);
    
    if (isLoading || status === 'connecting') {
        return <IssueDetailLoading />;
    }

    if (!issue) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <h2>Issue not found</h2>
          <p>The issue with key "{params.id}" could not be loaded or doesn't exist.</p>
        </div>
      )
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
