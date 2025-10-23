import { PublicLayout } from "@/components/public-layout";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Github,
  Linkedin,
  Twitter,
  Calendar
} from "lucide-react";
import Link from "next/link";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "contact@example.com",
    href: "mailto:contact@example.com",
    description: "Send me an email anytime"
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
    description: "Mon-Fri from 9am to 6pm EST"
  },
  {
    icon: MapPin,
    label: "Location",
    value: "San Francisco, CA",
    description: "Available for remote work worldwide"
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "Within 24 hours",
    description: "I'll respond as quickly as possible"
  }
];

const socialLinks = [
  { name: "GitHub", href: "https://github.com", icon: Github, color: "hover:bg-gray-100 dark:hover:bg-gray-800" },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin, color: "hover:bg-blue-50 dark:hover:bg-blue-950/20" },
  { name: "Twitter", href: "https://twitter.com", icon: Twitter, color: "hover:bg-sky-50 dark:hover:bg-sky-950/20" },
];

const services = [
  "Full-Stack Web Development",
  "React/Next.js Applications",
  "API Design & Development",
  "Database Architecture",
  "UI/UX Design",
  "Technical Consulting",
  "Code Reviews",
  "Performance Optimization"
];

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="container px-4 py-12 mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Have a project in mind or want to collaborate? I'd love to hear from you.
            Send me a message and let's create something amazing together.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">Available for hire</Badge>
            <Badge variant="secondary">Remote friendly</Badge>
            <Badge variant="secondary">Open to collaborations</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-8">
            {/* Quick Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div key={info.label} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{info.label}</h4>
                        {info.href ? (
                          <Link
                            href={info.href}
                            className="text-sm text-primary hover:underline break-all"
                          >
                            {info.value}
                          </Link>
                        ) : (
                          <p className="text-sm text-muted-foreground">{info.value}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Connect on Social Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <Button
                        key={social.name}
                        variant="outline"
                        size="sm"
                        className={`flex flex-col gap-2 h-auto py-3 ${social.color}`}
                        asChild
                      >
                        <Link
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{social.name}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Services I Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200">
                  Current Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Available for new projects</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    I'm currently taking on new freelance projects and consulting opportunities.
                    Typical response time is within 24 hours.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Last updated: This week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Quick answers to common questions about working together
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's your typical project timeline?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Project timelines vary based on complexity. A simple website might take 2-4 weeks,
                  while a complex web application could take 2-6 months.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you work with startups?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Absolutely! I love working with startups and can offer flexible arrangements
                  including equity-based partnerships for the right opportunities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can you help with existing projects?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes, I regularly help with code reviews, feature additions, performance
                  optimization, and architectural improvements for existing applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}