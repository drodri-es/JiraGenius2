import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { JiraIssue } from '@/lib/types';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Book,
  Bug,
  CheckSquare,
} from 'lucide-react';
import Link from 'next/link';

interface IssueCardProps {
  issue: JiraIssue;
}

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

const issueStatusColors: Record<JiraIssue['status'], string> = {
    'To Do': 'border-blue-400/50 text-blue-400',
    'In Progress': 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    'Done': 'bg-green-400/10 text-green-400 border-green-400/20',
};


export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Link href={`/issue/${issue.id}`} className="block h-full">
      <Card className="h-full flex flex-col hover:border-accent transition-colors duration-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">{issue.id}</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={issue.assignee.avatarUrl} alt={issue.assignee.name} />
              <AvatarFallback>{issue.assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-lg font-semibold leading-tight pt-2 font-body">{issue.title}</CardTitle>
        </CardHeader>
        <CardFooter className="mt-auto flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5" title={issue.type}>
              {issueTypeIcons[issue.type]}
              <span className="sr-only">{issue.type}</span>
            </div>
            <div className="flex items-center gap-1.5" title={issue.priority}>
              {issuePriorityIcons[issue.priority]}
              <span className="sr-only">{issue.priority}</span>
            </div>
          </div>
          <Badge className={`${issueStatusColors[issue.status]}`}>{issue.status}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
