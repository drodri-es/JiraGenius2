import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { JiraProject } from '@/lib/types';
import { Briefcase, Code } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: JiraProject;
}

const projectTypeIcons: Record<string, React.ReactNode> = {
  software: <Code className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />,
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/issues/${project.key}`} className="block h-full">
      <Card className="h-full flex flex-col hover:border-accent transition-colors duration-200">
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar className="h-12 w-12 rounded-md">
            <AvatarImage src={project.avatarUrls['48x48']} alt={project.name} />
            <AvatarFallback className="rounded-md">{project.key}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold leading-tight font-body">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{project.key}</p>
          </div>
        </CardHeader>
        <CardContent className="mt-auto flex justify-end items-center text-sm text-muted-foreground">
          <Badge variant="outline" className="flex items-center gap-1.5">
            {projectTypeIcons[project.projectTypeKey] || <Briefcase className="h-4 w-4" />}
            <span className="capitalize">{project.projectTypeKey}</span>
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
