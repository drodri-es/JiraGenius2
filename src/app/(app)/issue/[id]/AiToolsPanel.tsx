'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { summarizeIssueDescription } from '@/ai/flows/summarize-issue-description';
import { suggestIssueComment } from '@/ai/flows/suggest-issue-comment';
import { Sparkles, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface AiToolsPanelProps {
  issueDescription: string;
}

export function AiToolsPanel({ issueDescription }: AiToolsPanelProps) {
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  const handleSummarize = async () => {
    setIsSummaryLoading(true);
    setSummary('');
    try {
      const result = await summarizeIssueDescription({ description: issueDescription });
      setSummary(result.summary);
    } catch (e) {
      setSummary('Failed to generate summary.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleSuggestComment = async () => {
    setIsCommentLoading(true);
    setComment('');
    try {
      const result = await suggestIssueComment({ issueDescription });
      setComment(result.suggestedComment);
    } catch (e) {
      setComment('Failed to suggest a comment.');
    } finally {
      setIsCommentLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Sparkles className="text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summarize">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summarize">Summarize</TabsTrigger>
            <TabsTrigger value="suggest-comment">Suggest Comment</TabsTrigger>
          </TabsList>
          <TabsContent value="summarize" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a concise summary of the issue description.
              </p>
              <Button onClick={handleSummarize} disabled={isSummaryLoading} className="w-full">
                {isSummaryLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Summary
              </Button>
              {(isSummaryLoading || summary) && (
                <Card className="bg-background/50">
                  <CardContent className="p-4">
                    {isSummaryLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ) : (
                      <p className="text-sm">{summary}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          <TabsContent value="suggest-comment" className="mt-4">
             <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get an AI-generated suggestion for a relevant comment.
              </p>
              <Button onClick={handleSuggestComment} disabled={isCommentLoading} className="w-full">
                {isCommentLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Suggest Comment
              </Button>
              {(isCommentLoading || comment) && (
                 <Card className="bg-background/50">
                  <CardContent className="p-4">
                    {isCommentLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : (
                      <Textarea value={comment} readOnly className="text-sm bg-transparent border-0" rows={4}/>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
