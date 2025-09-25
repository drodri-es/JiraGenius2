import { fetchJiraIssue } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import type { JiraIssue } from '@/lib/types';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Book,
  Bug,
  CheckCircle,
  CheckSquare,
  Circle,
  CircleDot,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AiToolsPanel } from './AiToolsPanel';
import { formatDistanceToNow } from 'date-fns';

const issueTypeIcons: Record<JiraIssue['type'], React.ReactNode> = {
  Bug: <Bug className="h-4 w-4 text-red-400" />,
  Story: <Book className="h-4 w-4 text-green-400" />,
  Task: <CheckSquare className="h-4 w-4 text-blue-400" />,
};

const issuePriorityIcons: Record<JiraIssue['priority'], React.ReactNode> = {
  Highest: <ArrowUp className="h-4 w-4 text-red-500" />,
  High: <ArrowUp className="h-4 w-4 text-orange-400" />,
  Medium: <ArrowRight className="h-4 w-4 text-yellow-400" />,
  Low: <ArrowDown className="h-4 w-4 text-green-400" />,
};

const issueStatusIcons: Record<JiraIssue['status'], React.ReactNode> = {
  'To Do': <Circle className="h-4 w-4 text-blue-400" />,
  'In Progress': <CircleDot className="h-4 w-4 text-yellow-400" />,
  'Done': <CheckCircle className="h-4 w-4 text-green-400" />,
};

export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  const issue = await fetchJiraIssue(params.id);

  if (!issue) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow max-w-full lg:max-w-4xl">
          <header className="mb-6">
            <p className="text-muted-foreground mb-2">{issue.id}</p>
            <h1 className="text-3xl lg:text-4xl font-headline font-bold">{issue.title}</h1>
          </header>

          <div className="mt-8">
            <h2 className="font-headline text-2xl font-semibold mb-4 border-b pb-2">Description</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
          </div>
        </div>

        <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="flex items-center gap-2">
                  {issueStatusIcons[issue.status]}
                  <span>{issue.status}</span>
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Priority</span>
                <div className="flex items-center gap-2">
                  {issuePriorityIcons[issue.priority]}
                  <span>{issue.priority}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <div className="flex items-center gap-2">
                  {issueTypeIcons[issue.type]}
                  <span>{issue.type}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <User size={16} />
                  Assignee
                </span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={issue.assignee.avatarUrl} alt={issue.assignee.name} />
                    <AvatarFallback>{issue.assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{issue.assignee.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar size={16} />
                  Created
                </span>
                <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock size={16} />
                  Updated
                </span>
                <span>{formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}</span>
              </div>
            </CardContent>
          </Card>

          <AiToolsPanel issueDescription={issue.description} />
        </aside>
      </div>
    </div>
  );
}
