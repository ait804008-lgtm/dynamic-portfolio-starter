import { users } from './users';
import { projects } from './projects';
import { experience } from './experience';
import { education } from './education';
import { skills } from './skills';
import { projectSkills } from './project-skills';
import { blogPosts } from './blog';
import { contactMessages } from './contact';
import { personalInfo } from './personal-info';
import { siteSettings } from './site-settings';
import { user, session, account, verification } from './auth';
import { relations as drizzleRelations } from 'drizzle-orm';

// Export all tables
export {
  users,
  projects,
  experience,
  education,
  skills,
  projectSkills,
  blogPosts,
  contactMessages,
  personalInfo,
  siteSettings,
  user,
  session,
  account,
  verification,
};

// Export all types
export type { User, NewUser } from './users';
export type { Project, NewProject } from './projects';
export type { Experience, NewExperience } from './experience';
export type { Education, NewEducation } from './education';
export type { Skill, NewSkill } from './skills';
export type { ProjectSkill, NewProjectSkill } from './project-skills';
export type { BlogPost, NewBlogPost } from './blog';
export type { ContactMessage, NewContactMessage } from './contact';
export type { PersonalInfo, NewPersonalInfo } from './personal-info';
export type { SiteSetting, NewSiteSetting } from './site-settings';
export type { user as UserType, session as SessionType, account as AccountType, verification as VerificationType } from './auth';

// Schema object for Drizzle
export const schema = {
  users,
  projects,
  experience,
  education,
  skills,
  projectSkills,
  blogPosts,
  contactMessages,
  personalInfo,
  siteSettings,
  user,
  session,
  account,
  verification,
};

// Relations
export const relations = drizzleRelations(users, ({ many }) => ({
  projects: many(projects),
  experience: many(experience),
  education: many(education),
  skills: many(skills),
  blogPosts: many(blogPosts),
  personalInfo: many(personalInfo),
  siteSettings: many(siteSettings),
}));