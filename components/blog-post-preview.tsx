import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

interface BlogPostPreviewProps {
  post: BlogPost;
  showAuthor?: boolean;
  showViews?: boolean;
}

export function BlogPostPreview({ post, showAuthor = true, showViews = true }: BlogPostPreviewProps) {
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const readTimeText = post.readTime ? `${post.readTime} min read` : '5 min read';
  const viewsText = post.views ? `${post.views.toLocaleString()} views` : '0 views';

  const postTags = post.tags
    ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags)
    : [];

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Featured Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-muted-foreground text-sm">Article Preview</p>
            </div>
          </div>
        )}
        {post.featured && (
          <Badge className="absolute top-4 left-4" variant="secondary">
            Featured
          </Badge>
        )}
        {post.category && (
          <Badge className="absolute top-4 right-4" variant="outline">
            {post.category}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="h-3 w-3" />
          <span>{publishedDate}</span>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>{readTimeText}</span>
          {showViews && post.views !== undefined && (
            <>
              <span>•</span>
              <Eye className="h-3 w-3" />
              <span>{viewsText}</span>
            </>
          )}
        </div>

        <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm">
          {post.excerpt}
        </CardDescription>

        {showAuthor && post.author && (
          <p className="text-xs text-muted-foreground">
            By {post.author.name}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Tags */}
        {postTags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {postTags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                  #{typeof tag === 'string' ? tag : tag}
                </Badge>
              ))}
              {postTags.length > 4 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{postTags.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Read More Link */}
        <Button variant="ghost" size="sm" className="p-0 h-auto font-normal" asChild>
          <Link href={`/blog/${post.slug}`}>
            Read More
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}