'use client';

import { useJiraConnection } from '@/context/JiraConnectionContext';
import { fetchJiraIssues } from '@/lib/mock-data';
import type { JiraIssue } from '@/lib/types';
import { useEffect, useState } from 'react';
import { IssueList } from './IssueList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings } from 'lucide-react';
import DashboardLoading from './loading';

export default function DashboardPage() {
  const { status } = useJiraConnection();
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'connected') {
      setIsLoading(true);
      fetchJiraIssues().then(data => {
        setIssues(data);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      setIssues([]);
    }
  }, [status]);

  if (status === 'disconnected' || status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center p-4">
        <div className="p-6 rounded-full bg-primary/10 mb-4">
            <Settings className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-headline font-semibold mb-2">Connect to Jira</h2>
        <p className="max-w-md text-muted-foreground mb-6">
          You need to connect your Jira account to see your issues. Go to the settings page to get started.
        </p>
        <Button asChild>
          <Link href="/settings">
            Go to Settings <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading || status === 'connecting') {
    return <DashboardLoading />;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-headline font-bold mb-6">Dashboard</h1>
      <IssueList issues={issues} />
    </div>
  );
}
