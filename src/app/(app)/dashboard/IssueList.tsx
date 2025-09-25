import type { JiraIssue } from '@/lib/types';
import { IssueCard } from './IssueCard';

interface IssueListProps {
  issues: JiraIssue[];
}

export function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">No issues found</h2>
        <p className="text-muted-foreground">There are no issues to display at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {issues.map(issue => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
