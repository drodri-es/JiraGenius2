import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IssuesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center p-4">
      <h2 className="text-2xl font-headline font-semibold mb-2">Select a Project</h2>
      <p className="max-w-md text-muted-foreground mb-6">
        Please select a project from the Projects page to view its issues.
      </p>
      <Button asChild>
        <Link href="/dashboard">
          Go to Projects
        </Link>
      </Button>
    </div>
  );
}
