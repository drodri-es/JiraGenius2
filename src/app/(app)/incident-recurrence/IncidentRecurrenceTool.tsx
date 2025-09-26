
'use client';

import { clusterIssues, type ClusterIssuesOutput } from '@/ai/flows/cluster-issues';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import { useToast } from '@/hooks/use-toast';
import type { JiraIssue, JiraProject } from '@/lib/types';
import { Layers, Loader2, Sparkles, AlertCircle, Repeat } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function ResultsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
}

function NoClustersFound() {
    return (
        <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Recurring Incidents Found</h3>
            <p className="text-muted-foreground text-sm">
                The AI couldn't identify any distinct groups of similar incidents in this project.
            </p>
        </Card>
    )
}

export function IncidentRecurrenceTool() {
  const { credentials, status } = useJiraConnection();
  const { toast } = useToast();

  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<JiraProject | null>(null);

  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [isIssuesLoading, setIsIssuesLoading] = useState(false);
  
  const [isClustering, setIsClustering] = useState(false);
  const [clusteringResult, setClusteringResult] = useState<ClusterIssuesOutput | null>(null);


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
      }
    }
    getProjects();
  }, [credentials, status, toast]);

  const handleProjectSelect = async (projectKey: string) => {
    const project = projects.find(p => p.key === projectKey);
    if (!project || !credentials) return;
    
    setSelectedProject(project);
    setClusteringResult(null);
    setIsIssuesLoading(true);
    setIssues([]);

    try {
      const issuesResponse = await fetch(`/api/jira/issues/${projectKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!issuesResponse.ok) throw new Error('Failed to fetch issues');
      const issuesData = await issuesResponse.json();
      setIssues(issuesData.issues || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch issues for the selected project.' });
    } finally {
      setIsIssuesLoading(false);
    }
  };
  
  const handleAnalyze = async () => {
    const bugTypes = ['Bug', 'Error'];
    const bugIssues = issues.filter(issue => bugTypes.includes(issue.fields.issuetype.name));

    if (bugIssues.length === 0) {
        toast({ title: 'No bugs to analyze', description: 'The selected project has no issues of type "Bug" or "Error" to analyze.' });
        return;
    }

    setIsClustering(true);
    setClusteringResult(null);

    try {
        const issuesToCluster = bugIssues.map(issue => ({
            key: issue.key,
            summary: issue.fields.summary
        }));
        const result = await clusterIssues({ issues: issuesToCluster });
        setClusteringResult(result);

    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Analysis Failed', description: 'An error occurred while analyzing the issues.' });
    } finally {
        setIsClustering(false);
    }
  }

  const bugTypes = ['Bug', 'Error'];
  const bugCount = issues.filter(issue => bugTypes.includes(issue.fields.issuetype.name)).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Select Project</CardTitle>
          <CardDescription>Choose the Jira project you want to analyze for recurring incidents.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleProjectSelect} disabled={isProjectsLoading || status !== 'connected'}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder={isProjectsLoading ? "Loading projects..." : "Select a project"} />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.key}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {status !== 'connected' && <p className="text-sm text-destructive mt-2 flex items-center gap-2"><AlertCircle size={16}/> Please connect to Jira in Settings.</p>}
        </CardContent>
      </Card>

      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>2. Analyze Incidents</CardTitle>
            <CardDescription>
              Click to analyze the {isIssuesLoading ? '' : `${bugCount} bugs/errors`} from the <span className="font-semibold text-primary">{selectedProject.name}</span> project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAnalyze} disabled={isIssuesLoading || isClustering || bugCount === 0}>
              {isIssuesLoading ? <Loader2 className="mr-2 animate-spin" /> : isClustering ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
              {isIssuesLoading ? 'Loading Issues...' : isClustering ? 'Analyzing...' : `Analyze ${bugCount} Bugs`}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {isClustering && <ResultsSkeleton />}

      {clusteringResult && (
        <Card>
            <CardHeader>
                <CardTitle>Incident Categorization Results</CardTitle>
            </CardHeader>
            <CardContent>
                {clusteringResult.clusters.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                        {clusteringResult.clusters.map((cluster, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-3 text-left">
                                        <Repeat className="h-5 w-5 text-primary" />
                                        <div>
                                            <h3 className="font-semibold">{cluster.name}</h3>
                                            <p className="text-sm text-muted-foreground">{cluster.issueKeys.length} similar incidents</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-muted-foreground mb-4 italic">AI Summary: "{cluster.description}"</p>
                                    <ul className="space-y-2">
                                        {cluster.issueKeys.map(issueKey => (
                                            <li key={issueKey} className="text-sm">
                                                <Link href={`/issue/${issueKey}`} className="text-blue-400 hover:underline" target="_blank">
                                                    {issueKey}
                                                </Link>
                                                : {issues.find(i => i.key === issueKey)?.fields.summary}
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : <NoClustersFound />}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
