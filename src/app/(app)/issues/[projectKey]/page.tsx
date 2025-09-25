'use client';

import { useJiraConnection } from '@/context/JiraConnectionContext';
import type { JiraIssue, JiraProject } from '@/lib/types';
import { useEffect, useState } from 'react';
import { IssueList } from './IssueList';
import IssuesLoading from './IssuesLoading';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProjectIssuesPage({ params }: { params: { projectKey: string } }) {
  const { status, credentials } = useJiraConnection();
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [project, setProject] = useState<JiraProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function getIssuesAndProject(projectKey: string) {
      if (status === 'connected' && credentials) {
        setIsLoading(true);
        try {
          // Fetch issues
          const issuesResponse = await fetch(`/api/jira/issues/${projectKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          if (!issuesResponse.ok) {
            const errorData = await issuesResponse.json();
            throw new Error(errorData.message || 'Failed to fetch issues');
          }

          const issuesData = await issuesResponse.json();
          setIssues(issuesData.issues);
          setProject(issuesData.project);
        } catch (error) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Error fetching project data',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
          });
          setIssues([]);
          setProject(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setIssues([]);
        setProject(null);
      }
    }

    if (status !== 'connecting') {
      getIssuesAndProject(params.projectKey);
    }
  }, [status, credentials, params.projectKey, toast]);

  if (status === 'disconnected' || status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center p-4">
        <h2 className="text-2xl font-headline font-semibold mb-2">Connect to Jira</h2>
        <p className="max-w-md text-muted-foreground mb-6">
          You need to be connected to Jira to view project issues.
        </p>
        <Button asChild>
          <Link href="/settings">
            Go to Settings
          </Link>
        </Button>
      </div>
    );
  }
  
  const pageTitle = project ? project.name : params.projectKey;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Issues for <span className="text-primary">{pageTitle}</span></h1>
      {isLoading || status === 'connecting' ? <IssuesLoading /> : <IssueList issues={issues} />}
    </div>
  );
}
