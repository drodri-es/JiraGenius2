'use client';

import { useJiraConnection } from '@/context/JiraConnectionContext';
import type { JiraProject } from '@/lib/types';
import { useEffect, useState } from 'react';
import { ProjectList } from './ProjectList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings } from 'lucide-react';
import DashboardLoading from './loading';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { status, credentials } = useJiraConnection();
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function getProjects() {
      if (status === 'connected' && credentials) {
        setIsLoading(true);
        try {
          const response = await fetch('/api/jira/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch projects');
          }

          const data = await response.json();
          setProjects(data);
        } catch (error) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Error fetching projects',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
          });
          setProjects([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setProjects([]);
      }
    }

    getProjects();
  }, [status, credentials, toast]);

  if (status === 'disconnected' || status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center p-4">
        <div className="p-6 rounded-full bg-primary/10 mb-4">
            <Settings className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-headline font-semibold mb-2">Connect to Jira</h2>
        <p className="max-w-md text-muted-foreground mb-6">
          You need to connect your Jira account to see your projects. Go to the settings page to get started.
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
      <h1 className="text-3xl font-headline font-bold mb-6">Jira Projects</h1>
      <ProjectList projects={projects} />
    </div>
  );
}
