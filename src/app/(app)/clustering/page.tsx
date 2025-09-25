import { ClusteringTool } from './ClusteringTool';

export default function ClusteringPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-headline font-bold">User Story Clustering</h1>
          <p className="text-muted-foreground mt-2">
            Select a project to analyze its issues. The AI will identify and group similar user stories,
            helping you spot duplicates and recurring themes in your backlog.
          </p>
        </header>
        <ClusteringTool />
      </div>
    </div>
  );
}
