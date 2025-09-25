'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { JiraIssue } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDown, ArrowRight, ArrowUp, Book, Bug, CheckSquare, ShieldQuestion } from 'lucide-react';
import Link from 'next/link';

interface IssueListProps {
  issues: JiraIssue[];
}

const issueTypeIcons: Record<string, React.ReactNode> = {
  Bug: <Bug className="h-4 w-4 text-red-400" />,
  Story: <Book className="h-4 w-4 text-green-400" />,
  Task: <CheckSquare className="h-4 w-4 text-blue-400" />,
};

const issuePriorityIcons: Record<string, React.ReactNode> = {
  Highest: <ArrowUp className="h-4 w-4 text-red-500" />,
  High: <ArrowUp className="h-4 w-4 text-orange-400" />,
  Medium: <ArrowRight className="h-4 w-4 text-yellow-400" />,
  Low: <ArrowDown className="h-4 w-4 text-green-400" />,
};

export function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg">
        <h2 className="text-xl font-semibold">No issues found</h2>
        <p className="text-muted-foreground">This project doesn't have any issues yet.</p>
      </div>
    );
  }

  const getIssueTypeIcon = (typeName: string) => {
    return issueTypeIcons[typeName] || <ShieldQuestion className="h-4 w-4" />;
  };

  const getPriorityIcon = (priorityName: string) => {
    return issuePriorityIcons[priorityName] || <ShieldQuestion className="h-4 w-4" />;
  };
  
  const extractTextFromDescription = (description: any): string => {
    if (!description) return 'No description';
    if (typeof description === 'string') return description;
    if (description.type === 'doc' && description.content) {
      return description.content.map((node: any) => {
        if (node.type === 'paragraph' && node.content) {
          return node.content.map((textNode: any) => textNode.text).join('');
        }
        return '';
      }).join('\n');
    }
    return 'Complex description';
  };


  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Key</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map(issue => (
            <TableRow key={issue.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                    {getIssueTypeIcon(issue.fields.issuetype.name)}
                    <Link href={`/issue/${issue.key}`} className="hover:underline">
                        {issue.key}
                    </Link>
                </div>
              </TableCell>
              <TableCell>
                <Link href={`/issue/${issue.key}`} className="hover:underline font-medium">
                  {issue.fields.summary}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{issue.fields.status.name}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getPriorityIcon(issue.fields.priority.name)}
                  <span>{issue.fields.priority.name}</span>
                </div>
              </TableCell>
              <TableCell>
                {issue.fields.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={issue.fields.assignee.avatarUrls['48x48']} alt={issue.fields.assignee.displayName} />
                      <AvatarFallback>{issue.fields.assignee.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{issue.fields.assignee.displayName}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(issue.fields.updated), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
