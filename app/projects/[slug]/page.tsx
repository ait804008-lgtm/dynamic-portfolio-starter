import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, ExternalLink, Github, User, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string | null;
  imageUrl?: string | null;
  images?: string[];
  technologies?: string[];
  projectUrl?: string | null;
  githubUrl?: string | null;
  featured?: boolean;
  published: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  skills?: Array<{
    id: string;
    name: string;
    category?: string;
    proficiency?: string;
    description?: string;
  }>;
}

interface ProjectResponse {
  project: Project;
}

async function getProject(slug: string): Promise<Project | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // First, try to find project by slug by searching all projects
    const searchResponse = await fetch(`${baseUrl}/api/projects?search=${encodeURIComponent(slug)}&limit=100`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to search projects');
    }

    const searchData = await searchResponse.json();
    const projects = searchData.data?.projects || [];

    // Find the project with matching slug
    const foundProject = projects.find((p: Project) => p.slug === slug);

    if (!foundProject) {
      return null;
    }

    // Get full project details using the project ID
    const projectResponse = await fetch(`${baseUrl}/api/projects/${foundProject.id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!projectResponse.ok) {
      throw new Error('Failed to fetch project details');
    }

    const projectData = await projectResponse.json();
    return projectData.data?.project || null;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

function ProjectLoading() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-full mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function ProjectContent({ slug }: { slug: string }) {
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const techStack = project.technologies
    ? (typeof project.technologies === 'string'
        ? JSON.parse(project.technologies)
        : project.technologies)
    : [];

  return (
    <div className="container px-4 py-12 mx-auto">
      {/* Back Button */}
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/projects" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Header */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Project Image */}
          {project.imageUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Long Description */}
          {project.longDescription && (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">About this project</h2>
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {project.longDescription}
              </div>
            </div>
          )}

          {/* Additional Images */}
          {project.images && project.images.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Screenshots</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.images.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={image}
                      alt={`${project.title} screenshot ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formattedDate}</span>
              </div>

              {project.author && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Author:</span>
                  <span>{project.author.name}</span>
                </div>
              )}

              {project.featured && (
                <Badge variant="secondary">Featured Project</Badge>
              )}
            </CardContent>
          </Card>

          {/* Technologies */}
          {(techStack.length > 0 || (project.skills && project.skills.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technologies Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(techStack.length > 0 ? techStack : project.skills?.map(skill => skill.name)).map((tech, index) => (
                    <Badge key={index} variant="outline">
                      {typeof tech === 'string' ? tech : tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.projectUrl && (
                <Button asChild className="w-full">
                  <Link
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Live Project
                  </Link>
                </Button>
              )}

              {project.githubUrl && (
                <Button variant="outline" asChild className="w-full">
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    View Source Code
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Skills Section */}
          {project.skills && project.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills Demonstrated</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{skill.name}</div>
                      {skill.category && (
                        <div className="text-xs text-muted-foreground">{skill.category}</div>
                      )}
                    </div>
                    {skill.proficiency && (
                      <Badge variant="secondary" className="text-xs">
                        {skill.proficiency}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  return (
    <PublicLayout>
      <Suspense fallback={<ProjectLoading />}>
        <ProjectContent slug={params.slug} />
      </Suspense>
    </PublicLayout>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} - Portfolio`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.imageUrl ? [project.imageUrl] : [],
    },
  };
}