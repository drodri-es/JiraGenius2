import { IssuesSelector } from './IssuesSelector';

export default function IssuesPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-headline font-bold">Select a Project</h1>
          <p className="text-muted-foreground mt-2">
            Please choose a project from the list below to view its issues.
          </p>
        </header>
        <IssuesSelector />
      </div>
    </div>
  );
}
