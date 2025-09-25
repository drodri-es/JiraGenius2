'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { intelligentIssueRouting } from '@/ai/flows/intelligent-issue-routing';
import type { IntelligentIssueRoutingOutput } from '@/ai/flows/intelligent-issue-routing';
import { Sparkles, Loader2, Users, User, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function RoutingTool() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<IntelligentIssueRoutingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!description) return;
    setIsLoading(true);
    setResult(null);
    try {
      const routingResult = await intelligentIssueRouting({ issueDescription: description });
      setResult(routingResult);
    } catch (e) {
      console.error(e);
      // Here you could use a toast to show an error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Issue Description</CardTitle>
            <CardDescription>Paste the full description of the Jira issue here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., The login button is unresponsive on the main page after the latest update..."
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleAnalyze} disabled={isLoading || !description} className="mt-4">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Suggest Routing
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card>
            <CardHeader>
                <CardTitle>AI Suggestion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                </div>
                <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>AI Suggestion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1"><Users size={16} />Suggested Team</h3>
                    <p className="text-lg font-semibold">{result.suggestedTeam}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1"><User size={16} />Suggested Person</h3>
                    <p className="text-lg font-semibold">{result.suggestedPerson}</p>
                </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1"><FileText size={16} />Justification</h3>
              <p className="text-foreground/90">{result.justification}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
