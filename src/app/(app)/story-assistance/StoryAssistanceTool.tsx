'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { userStoryWritingAssistance } from '@/ai/flows/user-story-writing-assistance';
import type { UserStoryWritingAssistanceOutput } from '@/ai/flows/user-story-writing-assistance';
import { Sparkles, Loader2, CheckCircle, Lightbulb, Pilcrow, BookCheck, ClipboardCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function ResultsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Skeleton className="h-4 w-full mb-2" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-5/6" />
                </div>
            </CardContent>
        </Card>
    )
}

const categoryIcons: Record<string, React.ReactNode> = {
    Clarity: <Lightbulb className="h-4 w-4 text-blue-400" />,
    Completeness: <BookCheck className="h-4 w-4 text-green-400" />,
    Format: <Pilcrow className="h-4 w-4 text-orange-400" />,
    Grammar: <ClipboardCheck className="h-4 w-4 text-purple-400" />,
};

export function StoryAssistanceTool() {
  const [userStory, setUserStory] = useState('');
  const [result, setResult] = useState<UserStoryWritingAssistanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!userStory) return;
    setIsLoading(true);
    setResult(null);
    try {
      const assistanceResult = await userStoryWritingAssistance({ userStory });
      setResult(assistanceResult);
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
            <CardTitle>User Story Text</CardTitle>
            <CardDescription>
                Write or paste your user story below. A good user story follows the format: "As a [user type], I want [goal] so that [benefit]."
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., As a registered user, I want to be able to reset my password so that I can regain access to my account if I forget it."
            rows={6}
            value={userStory}
            onChange={(e) => setUserStory(e.target.value)}
          />
          <Button onClick={handleAnalyze} disabled={isLoading || !userStory} className="mt-4">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Get Feedback
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && <ResultsSkeleton />}

      {result && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Overall Assessment</h3>
                <p className="text-foreground/90 italic">"{result.overallFeedback}"</p>
            </div>
             {result.suggestions.length > 0 ? (
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Suggestions for Improvement</h3>
                    <div className="space-y-3">
                        {result.suggestions.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-3 bg-background/50 rounded-lg">
                                <div className="p-2 bg-background rounded-full">
                                    {categoryIcons[item.category] || <Lightbulb className="h-4 w-4" />}
                                </div>
                                <div>
                                    <Badge variant="outline" className="mb-1">{item.category}</Badge>
                                    <p className="text-foreground/90">{item.suggestion}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center p-6 text-center border-dashed rounded-lg">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold">Great User Story!</h3>
                    <p className="text-muted-foreground text-sm">
                        The AI found no issues. This user story is clear, complete, and well-formatted.
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
