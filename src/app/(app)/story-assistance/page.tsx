import { StoryAssistanceTool } from './StoryAssistanceTool';

export default function StoryAssistancePage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="max-w-3xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-headline font-bold">User Story Writing Assistant</h1>
            <p className="text-muted-foreground mt-2">
            Get real-time feedback from AI to improve the quality and clarity of your user stories. The assistant checks for format, completeness, and grammar.
            </p>
        </header>
        <StoryAssistanceTool />
      </div>
    </div>
  );
}
