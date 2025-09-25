'use client';

import { suggestIssueTags, type SuggestIssueTagsOutput } from '@/ai/flows/suggest-issue-tags';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import { useToast } from '@/hooks/use-toast';
import type { JiraIssue, JiraProject } from '@/lib/types';
import { Loader2, Sparkles, AlertCircle, CheckCircle, Tags, Tag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import IssuesLoading from '../issues/[projectKey]/IssuesLoading';
import { Badge } from '@/components/ui/badge';

interface TaggingResult {
    issueKey: string;
    summary: string;
    currentTags: string[];
    suggestedTags: string[];
    status: 'pending' | 'loading' | 'success' | 'error';
}

function ResultsTable({ results, onUpdate }: { results: TaggingResult[], onUpdate: (issueKey: string, newTags: string[]) => void }) {
    if (results.length === 0) {
        return <p className="text-muted-foreground text-center">No results to display.</p>;
    }

    const getCombinedTags = (current: string[], suggested: string[]) => {
        const combined = new Set([...current, ...suggested]);
        return Array.from(combined);
    };

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Issue</TableHead>
                        <TableHead>Current Tags</TableHead>
                        <TableHead>Suggested Tags</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {results.map((result) => (
                        <TableRow key={result.issueKey}>
                            <TableCell>
                                <Link href={`/issue/${result.issueKey}`} className="font-medium text-blue-400 hover:underline">
                                    {result.issueKey}
                                </Link>
                                <p className="text-sm text-muted-foreground truncate">{result.summary}</p>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {result.currentTags.length > 0 ? result.currentTags.map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    )) : <span className="text-xs text-muted-foreground">None</span>}
                                </div>
                            </TableCell>
                            <TableCell>
                               <div className="flex flex-wrap gap-1">
                                    {result.suggestedTags.map(tag => (
                                        <Badge key={tag} variant="outline" className="bg-primary/10 border-primary/40 text-primary">{tag}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                               <Button 
                                    size="sm" 
                                    onClick={() => onUpdate(result.issueKey, getCombinedTags(result.currentTags, result.suggestedTags))}
                                    disabled={result.suggestedTags.length === 0 || result.status === 'loading' || result.status === 'success'}
                                >
                                    {result.status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {result.status === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
                                    {result.status === 'success' ? 'Updated' : 'Update in Jira'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function TaggingTool() {
  const { credentials, status } = useJiraConnection();
  const { toast } = useToast();

  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<JiraProject | null>(null);

  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [isIssuesLoading, setIsIssuesLoading] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [taggingResults, setTaggingResults] = useState<TaggingResult[]>([]);
  
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
    setTaggingResults([]);
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
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleAnalyze = async () => {
    if (issues.length === 0) {
        toast({ title: 'No issues to analyze', description: 'The selected project has no issues to tag.' });
        return;
    }

    setIsAnalyzing(true);
    setTaggingResults([]);

    try {
        const results: TaggingResult[] = [];
        for (const issue of issues) {
            const descriptionText = extractTextFromDescription(issue.fields.description);
            const summary = issue.fields.summary;
            const fullText = `Summary: ${summary}\n\nDescription:\n${descriptionText}`;

            const result = await suggestIssueTags({ issueContent: fullText });
            
            results.push({
                issueKey: issue.key,
                summary: issue.fields.summary,
                currentTags: issue.fields.labels || [],
                suggestedTags: result.suggestedTags.filter(tag => !(issue.fields.labels || []).includes(tag)),
                status: 'pending'
            });
            
            setTaggingResults([...results]);
            await sleep(6000); // Avoid rate limiting
        }
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Analysis Failed', description: 'An error occurred while analyzing the issues. This might be due to API rate limits.' });
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleUpdateIssue = async (issueKey: string, newTags: string[]) => {
    if (!credentials) return;

    setTaggingResults(prev => prev.map(r => r.issueKey === issueKey ? { ...r, status: 'loading' } : r));

    try {
        const response = await fetch(`/api/jira/issues/${issueKey}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...credentials, labels: newTags }),
        });

        if (!response.ok) {
           throw new Error(`Failed to update issue ${issueKey}`);
        }

        setTaggingResults(prev => prev.map(r => r.issueKey === issueKey ? { ...r, status: 'success', currentTags: newTags, suggestedTags: [] } : r));
        toast({ title: 'Success', description: `Issue ${issueKey} has been updated.`});

    } catch (e) {
        console.error(e);
        setTaggingResults(prev => prev.map(r => r.issueKey === issueKey ? { ...r, status: 'error' } : r));
        toast({ variant: 'destructive', title: 'Update Failed', description: `An error occurred while updating issue ${issueKey}.` });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Select Project</CardTitle>
          <CardDescription>Choose the Jira project whose backlog you want to analyze for tagging.</CardDescription>
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
            <CardTitle>2. Analyze Backlog for Tags</CardTitle>
            <CardDescription>
              Click to start the AI analysis on the {issues.length > 0 ? `${issues.length}` : ''} issues from the <span className="font-semibold text-primary">{selectedProject.name}</span> project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAnalyze} disabled={isIssuesLoading || isAnalyzing || issues.length === 0}>
              {isIssuesLoading ? <Loader2 className="mr-2 animate-spin" /> : isAnalyzing ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
              {isIssuesLoading ? 'Loading Issues...' : isAnalyzing ? 'Analyzing...' : `Analyze ${issues.length} Issues`}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {isAnalyzing && taggingResults.length === 0 && <IssuesLoading />}

      {taggingResults.length > 0 && selectedProject && (
        <Card>
            <CardHeader>
                <CardTitle>Tagging Suggestions</CardTitle>
                <CardDescription>
                    The table below shows the AI's tag suggestions. Click 'Update in Jira' to apply them.
                    {isAnalyzing && ` (Analyzing... ${taggingResults.length} of ${issues.length})`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResultsTable results={taggingResults} onUpdate={handleUpdateIssue} />
            </CardContent>
        </Card>
      )}
    </div>
  );
}
