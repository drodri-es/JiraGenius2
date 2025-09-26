import { RootCauseAnalysisTool } from './RootCauseAnalysisTool';

export default function RootCauseAnalysisPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="max-w-6xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-headline font-bold">AI Root Cause Analysis</h1>
            <p className="text-muted-foreground mt-2">
            Select a project to let the AI analyze its backlog. It will classify issues as bugs or features and, for each bug, attempt to identify the previously implemented task that may be the root cause.
            </p>
        </header>
        <RootCauseAnalysisTool />
      </div>
    </div>
  );
}
