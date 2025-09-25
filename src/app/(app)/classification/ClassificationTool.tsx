'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { classifyIssue } from '@/ai/flows/classify-issue';
import type { ClassifyIssueOutput } from '@/ai/flows/classify-issue';
import { Sparkles, Loader2, Bug, Zap, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function ClassificationTool() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<ClassifyIssueOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!description) return;
    setIsLoading(true);
    setResult(null);
    try {
      const classificationResult = await classifyIssue({ issueDescription: description });
      setResult(classificationResult);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Classification Failed',
        description: 'An error occurred while classifying the issue.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ClassificationBadge = ({ classification }: { classification: 'Bug' | 'Feature' }) => {
    const isBug = classification === 'Bug';
    return (
      <Badge variant={isBug ? 'destructive' : 'secondary'} className={`text-lg ${isBug ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
        {isBug ? <Bug className="mr-2 h-5 w-5" /> : <Zap className="mr-2 h-5 w-5" />}
        {classification}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Issue Description</CardTitle>
            <CardDescription>Paste the full description of an issue to classify it as a bug or a new feature.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., When a user clicks the 'Export' button, the application crashes..."
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
            Classify Issue
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card>
            <CardHeader>
                <CardTitle>AI Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>AI Classification</span>
                <ClassificationBadge classification={result.classification} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
