import type { JiraProject } from '@/lib/types';
import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  projects: JiraProject[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">No projects found</h2>
        <p className="text-muted-foreground">You don't seem to have access to any projects.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
