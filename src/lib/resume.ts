import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

export interface PersonalInfo {
  name: string;
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  website: string;
  github: string;
  linkedin: string;
  location: string;
}

export interface DomainBulletGroup {
  title: string;
  bullets: string[];
}

export interface ExperienceEntry {
  company: string;
  role: string;
  location: string;
  period: string;
  domains: DomainBulletGroup[];
}

export interface ProjectEntry {
  name: string;
  role: string;
  period: string;
  url?: string;
  github?: string;
  tech: string[];
  bullets: string[];
}

export interface EarlierExperienceEntry {
  company: string;
  role: string;
  period: string;
  summary: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  period: string;
}

export interface ReferenceEntry {
  name: string;
  title: string;
  company: string;
  linkedin: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  earlier_experience: EarlierExperienceEntry[];
  skills: SkillCategory[];
  education: EducationEntry;
  references: ReferenceEntry[];
}

export function loadResumeData(): ResumeData {
  const filePath = join(process.cwd(), 'src/content/resume.yaml');
  const raw = readFileSync(filePath, 'utf-8');
  return yaml.load(raw) as ResumeData;
}
