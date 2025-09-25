export default function ProjectIssuesPage({ params }: { params: { projectKey: string } }) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-headline font-bold mb-6">Issues for {params.projectKey}</h1>
        {/* Issue list will be implemented here */}
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center h-96">
            <p className="text-muted-foreground">Issue list coming soon.</p>
        </div>
      </div>
    );
  }
  