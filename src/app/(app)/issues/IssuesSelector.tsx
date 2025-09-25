
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import { useToast } from '@/hooks/use-toast';
import type { JiraProject } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function IssuesSelector() {
  const { credentials, status } = useJiraConnection();
  const { toast } = useToast();
  const router = useRouter();

  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  useEffect(() => {
    async function getProjects() {
      if (status === 'connected' && credentials) {
        setIsProjectsLoading(true);
        try {
          const response = await fetch('/api/jira/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          if (!response.ok) throw new Error('Failed to fetch projects');
          const data = await response.json();
          setProjects(data);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch Jira projects.' });
        } finally {
          setIsProjectsLoading(false);
        }
      } else {
        setIsProjectsLoading(false);
      }
    }
    getProjects();
  }, [credentials, status, toast]);

  const handleProjectSelect = (projectKey: string) => {
    if (projectKey) {
      router.push(`/issues/${projectKey}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Project</CardTitle>
        <CardDescription>Choose the Jira project for which you want to view the issues.</CardDescription>
      </CardHeader>
      <CardContent>
        <Select onValueChange={handleProjectSelect} disabled={isProjectsLoading || status !== 'connected'}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isProjectsLoading ? 'Loading projects...' : 'Select a project'} />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.key}>
                {p.name} ({p.key})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {status !== 'connected' && (
          <p className="mt-2 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle size={16} /> Please connect to Jira in Settings.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
