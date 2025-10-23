import { PublicLayout } from "@/components/public-layout";
import { BlogPostPreview } from "@/components/blog-post-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List, Rss } from "lucide-react";
import { Suspense } from "react";

// API response types
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string | null;
  tags?: string[];
  category?: string;
  readTime?: number;
  views?: number;
  featured?: boolean;
  createdAt: string;
  publishedAt?: string | null;
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

interface BlogResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

async function getBlogPosts(search?: string, category?: string, page = 1, limit = 9): Promise<BlogResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    published: 'true',
    ...(search && { search }),
    ...(category && { category }),
  });

  try {
    const response = await fetch(`${baseUrl}/api/blog?${params}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }

    const data = await response.json();
    return data.data || { posts: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return { posts: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
  }
}

function BlogLoading() {
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

function SearchAndFilter({ currentCategory }: { currentCategory?: string }) {
  const categories = [
    "Technology",
    "Web Development",
    "JavaScript",
    "React",
    "Next.js",
    "TypeScript",
    "Design",
    "Career",
    "Tutorial"
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search articles..."
            className="pl-10"
            name="search"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <a href="/blog/rss.xml">
              <Rss className="h-4 w-4 mr-2" />
              RSS Feed
            </a>
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

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!currentCategory ? "default" : "outline"}
            size="sm"
            asChild={!currentCategory}
          >
            {!currentCategory ? (
              <span>All Posts</span>
            ) : (
              <a href="/blog">All Posts</a>
            )}
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={currentCategory === category ? "default" : "outline"}
              size="sm"
              asChild={currentCategory !== category}
            >
              {currentCategory === category ? (
                <span>{category}</span>
              ) : (
                <a href={`/blog?category=${encodeURIComponent(category)}`}>{category}</a>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

async function BlogContent({ searchParams }: { searchParams: { search?: string; category?: string; page?: string } }) {
  const search = searchParams?.search;
  const category = searchParams?.category;
  const page = parseInt(searchParams?.page || '1');
  const { posts, pagination } = await getBlogPosts(search, category, page);

  const featuredPosts = posts.filter(p => p.featured);
  const regularPosts = posts.filter(p => !p.featured);

  return (
    <div className="container px-4 py-12 mx-auto">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Thoughts, tutorials, and insights about web development, technology, and programming.
          Join me on my journey of continuous learning and discovery.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">Web Development</Badge>
          <Badge variant="secondary">JavaScript</Badge>
          <Badge variant="secondary">React</Badge>
          <Badge variant="secondary">Next.js</Badge>
          <Badge variant="secondary">TypeScript</Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter currentCategory={category} />

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <BlogPostPreview key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          {search ? `Search Results (${pagination.total})` :
           category ? `${category} (${pagination.total})` :
           `Latest Articles (${pagination.total})`}
        </h2>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-6">
              {search
                ? `No articles found matching "${search}". Try different keywords.`
                : category
                ? `No articles found in the "${category}" category.`
                : "No articles available yet. Check back soon!"}
            </p>
            {(search || category) && (
              <Button variant="outline" asChild>
                <a href="/blog">Browse all articles</a>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogPostPreview key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {pagination.hasPrev && (
                  <Button variant="outline" asChild>
                    <a href={`?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}${category ? `&category=${encodeURIComponent(category)}` : ''}`}>
                      Previous
                    </a>
                  </Button>
                )}

                <span className="text-sm text-muted-foreground px-4">
                  Page {page} of {pagination.totalPages}
                </span>

                {pagination.hasNext && (
                  <Button variant="outline" asChild>
                    <a href={`?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}${category ? `&category=${encodeURIComponent(category)}` : ''}`}>
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

export default function BlogPage({ searchParams }: { searchParams: { search?: string; category?: string; page?: string } }) {
  return (
    <PublicLayout>
      <Suspense fallback={<BlogLoading />}>
        <BlogContent searchParams={searchParams} />
      </Suspense>
    </PublicLayout>
  );
}