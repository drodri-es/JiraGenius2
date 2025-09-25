import { TaggingTool } from './TaggingTool';

export default function TaggingPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="max-w-6xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-headline font-bold">Automated Issue Tagging</h1>
            <p className="text-muted-foreground mt-2">
            Select a project to let the AI analyze its backlog. It will suggest relevant tags for each issue to improve organization and searchability. You can then apply these tags with a single click.
            </p>
        </header>
        <TaggingTool />
      </div>
    </div>
  );
}
