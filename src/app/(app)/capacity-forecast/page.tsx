import { CapacityForecastTool } from "./CapacityForecastTool";

export default function CapacityForecastPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-headline font-bold">Sprint Capacity Forecast</h1>
          <p className="text-muted-foreground mt-2">
            Select a project to analyze its past performance. The AI will forecast your team's capacity for the next sprint based on historical velocity.
          </p>
        </header>
        <CapacityForecastTool />
      </div>
    </div>
  );
}
