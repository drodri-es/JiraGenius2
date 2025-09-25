import { RoutingTool } from './RoutingTool';

export default function RoutingPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-headline font-bold mb-6">Intelligent Issue Routing</h1>
        <p className="text-muted-foreground mb-6">
          Paste an issue description below and let our AI assistant suggest the best team and person to handle it. This helps streamline workflow and ensures issues are resolved faster.
        </p>
        <RoutingTool />
      </div>
    </div>
  );
}
