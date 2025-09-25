import { ClassificationTool } from './ClassificationTool';

export default function ClassificationPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="max-w-3xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-headline font-bold">Bug vs. Feature Classification</h1>
            <p className="text-muted-foreground mt-2">
            Let the AI analyze an issue description to automatically determine if it's a bug or a new feature request, helping you categorize your work more efficiently.
            </p>
        </header>
        <ClassificationTool />
      </div>
    </div>
  );
}
