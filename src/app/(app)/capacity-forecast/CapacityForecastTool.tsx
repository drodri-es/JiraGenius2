'use client';

import { BarChart, Loader2, Sparkles, AlertCircle, TrendingUp, Target, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import { useToast } from '@/hooks/use-toast';
import type { JiraProject, SprintReport } from '@/lib/types';

import { sprintCapacityForecasting, SprintCapacityForecastingOutput } from '@/ai/flows/sprint-capacity-forecasting';

function ResultsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                </div>
                <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </CardContent>
        </Card>
    )
}

function NoSprintsFound() {
    return (
        <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
            <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Sprint Data Found</h3>
            <p className="text-muted-foreground text-sm">
                The AI couldn't find any completed sprints with story points for this project.
            </p>
        </Card>
    )
}

export function CapacityForecastTool() {
  const { credentials, status } = useJiraConnection();
  const { toast } = useToast();

  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<JiraProject | null>(null);

  const [sprintHistory, setSprintHistory] = useState<SprintReport[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<SprintCapacityForecastingOutput | null>(null);


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
    setForecastResult(null);
    setIsHistoryLoading(true);
    setSprintHistory([]);

    try {
      const response = await fetch(`/api/jira/sprints/${project.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error('Failed to fetch sprint history');
      const data = await response.json();
      setSprintHistory(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch sprint history for the selected project.' });
    } finally {
      setIsHistoryLoading(false);
    }
  };
  
  const handleAnalyze = async () => {
    if (sprintHistory.length === 0) {
        toast({ title: 'No sprint history to analyze', description: 'This project has no completed sprints with story points.' });
        return;
    }

    setIsForecasting(true);
    setForecastResult(null);

    try {
        const result = await sprintCapacityForecasting({ sprintHistory, sprintDurationDays: 14 });
        setForecastResult(result);

    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Forecast Failed', description: 'An error occurred while generating the forecast.' });
    } finally {
        setIsForecasting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Select Project</CardTitle>
          <CardDescription>Choose the Jira project for which you want to forecast sprint capacity.</CardDescription>
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
            <CardTitle>2. Generate Forecast</CardTitle>
            <CardDescription>
              Click the button to start the AI analysis on the {sprintHistory.length > 0 ? `${sprintHistory.length} past sprints` : ''} from the <span className="font-semibold text-primary">{selectedProject.name}</span> project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAnalyze} disabled={isHistoryLoading || isForecasting || sprintHistory.length === 0}>
              {isHistoryLoading ? <Loader2 className="mr-2 animate-spin" /> : isForecasting ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
              {isHistoryLoading ? 'Loading History...' : isForecasting ? 'Forecasting...' : `Generate Forecast`}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {isForecasting && <ResultsSkeleton />}

      {forecastResult && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp /> AI Forecast for Next Sprint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="bg-background/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 mb-1"><Target size={16} />Predicted Story Points</h3>
                    <p className="text-4xl font-bold text-primary">{forecastResult.predictedStoryPoints}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 mb-1"><FileText size={16} />Predicted Issues</h3>
                    <p className="text-4xl font-bold text-primary">{forecastResult.predictedIssues}</p>
                </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">Justification</h3>
              <p className="text-foreground/90 italic">"{forecastResult.justification}"</p>
            </div>
          </CardContent>
        </Card>
      )}
      {!isForecasting && forecastResult === null && selectedProject && !isHistoryLoading && sprintHistory.length === 0 && (
          <NoSprintsFound />
      )}
    </div>
  );
}
