import { IncidentRecurrenceTool } from './IncidentRecurrenceTool';

export default function IncidentRecurrencePage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-headline font-bold">Incident Recurrence Categorization</h1>
          <p className="text-muted-foreground mt-2">
            Select a project to analyze its incident reports. The AI will identify and group recurring issues,
            helping you spot patterns and address root causes.
          </p>
        </header>
        <IncidentRecurrenceTool />
      </div>
    </div>
  );
}
