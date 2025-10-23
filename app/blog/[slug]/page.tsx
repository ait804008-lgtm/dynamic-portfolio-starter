import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, Eye, User, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string | null;
  tags?: string[];
  category?: string;
  readTime?: number;
  views?: number;
  featured?: boolean;
  published: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

interface BlogPostResponse {
  post: BlogPost;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  try {
    // First, try to find the post by slug by searching all posts
    const searchResponse = await fetch(`${baseUrl}/api/blog?search=${encodeURIComponent(slug)}&limit=100&published=true`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to search blog posts');
    }

    const searchData = await searchResponse.json();
    const posts = searchData.data?.posts || [];

    // Find the post with matching slug
    const foundPost = posts.find((p: BlogPost) => p.slug === slug);

    if (!foundPost) {
      return null;
    }

    // Return the found post directly since it already contains all necessary data
    return foundPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

function BlogPostLoading() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
        <div className="grid lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-muted rounded w-full mb-4"></div>
            <div className="h-64 bg-muted rounded mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
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

// Function to estimate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

async function BlogPostContent({ slug }: { slug: string }) {
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const readTime = post.readTime || calculateReadingTime(post.content || '');
  const readTimeText = `${readTime} min read`;
  const viewsText = post.views ? `${post.views.toLocaleString()} views` : '0 views';

  const postTags = post.tags
    ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags)
    : [];

  return (
    <div className="container px-4 py-12 mx-auto">
      {/* Back Button */}
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/blog" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>

      <article className="grid lg:grid-cols-4 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              {post.category && (
                <Badge variant="outline">{post.category}</Badge>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{publishedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{readTimeText}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{viewsText}</span>
              </div>
              {post.featured && (
                <Badge variant="secondary">Featured</Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-6">
              {post.excerpt}
            </p>

            {post.author && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">
                    {post.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
            )}
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-8">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {post.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="leading-relaxed"
              />
            ) : (
              <div className="text-muted-foreground">
                <p>Content coming soon...</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {postTags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {postTags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    #{typeof tag === 'string' ? tag : tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Author Card */}
          {post.author && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Author</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold text-xl">
                    {post.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{post.author.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Full-Stack Developer & Technical Writer
                </p>
                <p className="text-sm text-muted-foreground">
                  Passionate about sharing knowledge and helping others learn web development.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Article Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Article Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Published:</span>
                <span>{publishedDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reading time:</span>
                <span>{readTimeText}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Views:</span>
                <span>{viewsText}</span>
              </div>
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>
                    {new Date(post.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share this article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on Twitter
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on LinkedIn
                </a>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </article>
    </div>
  );
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <PublicLayout>
      <Suspense fallback={<BlogPostLoading />}>
        <BlogPostContent slug={params.slug} />
      </Suspense>
    </PublicLayout>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  return {
    title: post.metaTitle || `${post.title} - Blog`,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.name] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}