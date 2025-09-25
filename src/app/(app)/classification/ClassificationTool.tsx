'use client';

import { classifyIssue, type ClassifyIssueOutput } from '@/ai/flows/classify-issue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import { useToast } from '@/hooks/use-toast';
import type { JiraIssue, JiraProject } from '@/lib/types';
import { Loader2, Sparkles, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import IssuesLoading from '../issues/[projectKey]/IssuesLoading';

interface ClassificationResult extends ClassifyIssueOutput {
    issueKey: string;
    summary: string;
    actualType: string;
    matches: boolean;
}

function ResultsTable({ results, projectKey }: { results: ClassificationResult[], projectKey: string }) {
    if (results.length === 0) {
        return <p className="text-muted-foreground text-center">No results to display.</p>;
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Match</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Actual Type</TableHead>
                        <TableHead>AI Suggestion</TableHead>
                        <TableHead>AI Justification</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {results.map((result) => (
                        <TableRow key={result.issueKey} className={!result.matches ? 'bg-destructive/10 hover:bg-destructive/20' : ''}>
                             <TableCell>
                                {result.matches ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-destructive" />
                                )}
                            </TableCell>
                            <TableCell>
                                <Link href={`/issue/${result.issueKey}`} className="font-medium text-blue-400 hover:underline">
                                    {result.issueKey}
                                </Link>
                                <p className="text-sm text-muted-foreground truncate">{result.summary}</p>
                            </TableCell>
                            <TableCell>{result.actualType}</TableCell>
                            <TableCell>{result.classification}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{result.justification}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}


export function ClassificationTool() {
  const { credentials, status } = useJiraConnection();
  const { toast } = useToast();

  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<JiraProject | null>(null);

  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [isIssuesLoading, setIsIssuesLoading] = useState(false);
  
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResults, setClassificationResults] = useState<ClassificationResult[]>([]);
  
  const extractTextFromDescription = (description: any): string => {
    if (!description) return '';
    if (typeof description === 'string') return description;
    if (description.type === 'doc' && description.content) {
        return description.content.map((node: any) => 
            node.content?.map((textNode: any) => textNode.text).join('') || ''
        ).join('\n');
    }
    return '';
  };


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
    setClassificationResults([]);
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
      setIssues(issuesData.issues);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch issues for the selected project.' });
    } finally {
      setIsIssuesLoading(false);
    }
  };
  
  const handleAnalyze = async () => {
    if (issues.length === 0) {
        toast({ title: 'No issues to analyze', description: 'The selected project has no issues to classify.' });
        return;
    }

    setIsClassifying(true);
    setClassificationResults([]);

    try {
        const results: ClassificationResult[] = [];
        for (const issue of issues) {
            const descriptionText = extractTextFromDescription(issue.fields.description);
            const summary = issue.fields.summary;
            const fullText = `Summary: ${summary}\n\nDescription:\n${descriptionText}`;

            const result = await classifyIssue({ issueDescription: fullText });
            
            // Jira has 'Bug', 'Story', 'Task', etc. Our AI classifies as 'Bug' or 'Feature'.
            // Let's normalize Jira's types for comparison. Stories and Tasks are Features.
            const normalizedJiraType = issue.fields.issuetype.name === 'Bug' ? 'Bug' : 'Feature';

            results.push({
                ...result,
                issueKey: issue.key,
                summary: issue.fields.summary,
                actualType: issue.fields.issuetype.name,
                matches: result.classification === normalizedJiraType
            });
        }
        setClassificationResults(results);

    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Classification Failed', description: 'An error occurred while analyzing the issues.' });
    } finally {
        setIsClassifying(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Select Project</CardTitle>
          <CardDescription>Choose the Jira project whose backlog you want to analyze.</CardDescription>
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
            <CardTitle>2. Analyze Backlog</CardTitle>
            <CardDescription>
              Click the button to start the AI classification on the {issues.length > 0 ? `${issues.length}` : ''} issues from the <span className="font-semibold text-primary">{selectedProject.name}</span> project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAnalyze} disabled={isIssuesLoading || isClassifying || issues.length === 0}>
              {isIssuesLoading ? <Loader2 className="mr-2 animate-spin" /> : isClassifying ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
              {isIssuesLoading ? 'Loading Issues...' : isClassifying ? 'Analyzing...' : `Analyze ${issues.length} Issues`}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {isClassifying && <IssuesLoading />}

      {classificationResults.length > 0 && selectedProject && (
        <Card>
            <CardHeader>
                <CardTitle>Classification Results</CardTitle>
                <CardDescription>
                    The table below shows the AI's classification compared to the actual issue type. Mismatches are highlighted in red.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResultsTable results={classificationResults} projectKey={selectedProject.key} />
            </CardContent>
        </Card>
      )}
    </div>
  );
}
