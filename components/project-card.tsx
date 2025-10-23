import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
  technologies?: string[];
  projectUrl?: string | null;
  githubUrl?: string | null;
  featured?: boolean;
  createdAt: string;
  skills?: Array<{
    id: string;
    name: string;
    category?: string;
  }>;
}

interface ProjectCardProps {
  project: Project;
  showAuthor?: boolean;
}

export function ProjectCard({ project, showAuthor = false }: ProjectCardProps) {
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });

  const techStack = project.technologies
    ? (typeof project.technologies === 'string'
        ? JSON.parse(project.technologies)
        : project.technologies)
    : [];

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Project Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">🚀</div>
              <p className="text-muted-foreground text-sm">Project Preview</p>
            </div>
          </div>
        )}
        {project.featured && (
          <Badge className="absolute top-4 left-4" variant="secondary">
            Featured
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/projects/${project.slug}`} className="hover:underline">
              {project.title}
            </Link>
          </CardTitle>
        </div>
        <CardDescription className="line-clamp-3 text-sm">
          {project.description}
        </CardDescription>
        {showAuthor && project.author && (
          <p className="text-xs text-muted-foreground">
            By {project.author.name}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Tech Stack */}
        {(techStack.length > 0 || (project.skills && project.skills.length > 0)) && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {(techStack.length > 0 ? techStack : project.skills?.map(skill => skill.name)).slice(0, 6).map((tech, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                  {typeof tech === 'string' ? tech : tech}
                </Badge>
              ))}
              {(techStack.length > 6 || (project.skills && project.skills.length > 6)) && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{(techStack.length > 6 ? techStack.length : project.skills?.length) - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 h-8 w-8"
                >
                  <Github className="h-4 w-4" />
                  <span className="sr-only">View on GitHub</span>
                </Link>
              </Button>
            )}
            {project.projectUrl && (
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 h-8 w-8"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">View live project</span>
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/projects/${project.slug}`} className="p-1">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">View project details</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}