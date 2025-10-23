import { PublicLayout } from "@/components/public-layout";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List } from "lucide-react";
import { Suspense } from "react";

// API response types
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

interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

async function getProjects(search?: string, page = 1, limit = 12): Promise<ProjectsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  try {
    const response = await fetch(`${baseUrl}/api/projects?${params}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const data = await response.json();
    return data.data || { projects: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { projects: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
  }
}

function ProjectsLoading() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted rounded-lg aspect-video mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchAndFilter() {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search projects..."
          className="pl-10"
          name="search"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        <div className="flex border rounded-md">
          <Button variant="ghost" size="sm" className="rounded-r-none border-r">
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-l-none">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

async function ProjectsContent({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const search = searchParams?.search;
  const page = parseInt(searchParams?.page || '1');
  const { projects, pagination } = await getProjects(search, page);

  const featuredProjects = projects.filter(p => p.featured);
  const regularProjects = projects.filter(p => !p.featured);

  return (
    <div className="container px-4 py-12 mx-auto">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Projects</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          A collection of my work, experiments, and side projects. Each project represents
          an opportunity to learn, grow, and solve interesting problems.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">React</Badge>
          <Badge variant="secondary">Next.js</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">Node.js</Badge>
          <Badge variant="secondary">Full-Stack</Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter />

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* All Projects */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          {search ? `Search Results (${pagination.total})` : `All Projects (${pagination.total})`}
        </h2>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">
              {search
                ? `No projects found matching "${search}". Try different keywords.`
                : "No projects available yet. Check back soon!"}
            </p>
            {search && (
              <Button variant="outline" asChild>
                <a href="/projects">Clear search</a>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {pagination.hasPrev && (
                  <Button variant="outline" asChild>
                    <a href={`?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                      Previous
                    </a>
                  </Button>
                )}

                <span className="text-sm text-muted-foreground px-4">
                  Page {page} of {pagination.totalPages}
                </span>

                {pagination.hasNext && (
                  <Button variant="outline" asChild>
                    <a href={`?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                      Next
                    </a>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  return (
    <PublicLayout>
      <Suspense fallback={<ProjectsLoading />}>
        <ProjectsContent searchParams={searchParams} />
      </Suspense>
    </PublicLayout>
  );
}