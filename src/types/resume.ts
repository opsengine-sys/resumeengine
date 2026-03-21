export interface PersonalInfo {
  firstName: string;
  lastName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  github: string;
  photo: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Technical' | 'Soft' | 'Tools' | 'Other';
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface ExperienceBullet {
  id: string;
  text: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  bullets: ExperienceBullet[];
}

export interface Education {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  projectUrl: string;
  githubUrl: string;
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  expiryDate: string;
  credentialUrl: string;
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
}

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  description: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

export type SectionKey =
  | 'personal'
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | 'languages'
  | 'volunteer'
  | 'publications'
  | 'references';

/* ── Custom Section Field Types ────────────────────────────────── */
export type CustomFieldType = 'text' | 'longtext' | 'date' | 'dropdown';

export interface CustomFieldOption { id: string; label: string; }

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  value: string;
  options?: CustomFieldOption[]; // for dropdown type
}

export interface CustomSectionEntry {
  id: string;
  fields: CustomField[];
}

export interface SectionConfig {
  key: string;        // built-in: SectionKey, custom: arbitrary string
  label: string;
  visible: boolean;
  icon: string;
  isCustom?: boolean; // true for user-added sections
  customFieldDefs?: { id: string; label: string; type: CustomFieldType; options?: CustomFieldOption[] }[];
  customEntries?: CustomSectionEntry[];
}

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  skills: Skill[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
  languages: Language[];
  volunteer: VolunteerExperience[];
  publications: Publication[];
  references: Reference[];
}

export type TextCaseType = 'uppercase' | 'capitalize' | 'lowercase' | 'normal';
export type TextWeightType = 'normal' | 'italic' | 'bold' | 'light';

export interface ElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: TextWeightType;
  letterCase?: TextCaseType;
  isItalic?: boolean;
}

export interface TypographySettings {
  fontFamily: string;
  nameFontSize: number;
  baseFontSize: number;
  headingFontSize: number;
  subHeadingFontSize: number;
  lineHeight: number;
  sectionSpacing: number;
  itemSpacing: number;
  pagePaddingX: number;
  pagePaddingY: number;
  headerPaddingY: number;
  // Global case (kept for backwards compat)
  nameCase: TextCaseType;
  headingCase: TextCaseType;
  subHeadingCase: TextCaseType;
  // Per-element style overrides (kept for backwards compat)
  companyStyle: 'normal' | 'italic' | 'bold';
  dateStyle: 'normal' | 'italic' | 'bold';
  institutionStyle: 'normal' | 'italic' | 'bold';
  sectionTitleStyle: 'normal' | 'italic' | 'bold';
  // NEW: per text-level full style control
  levelStyles: Record<TextLevel, ElementStyle>;
}

export type TextLevel =
  | 'candidateName'
  | 'headline'
  | 'contactInfo'
  | 'sectionTitle'
  | 'jobTitle'
  | 'companyName'
  | 'institutionName'
  | 'date'
  | 'bodyText';

export interface ColorSettings {
  textColor: string;          // body text color
  headingColor: string;       // section headings color
  linkColor: string;          // URL / link color
  mutedColor: string;         // dates, subtitles
  showBorder: boolean;        // page border toggle
  borderColor: string;        // border color if showBorder
  showPageNumbers: boolean;   // page number footer toggle
}

export interface Resume {
  id: string;
  name: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  sections: SectionConfig[];
  typography: TypographySettings;
  colors: ColorSettings;
  data: ResumeData;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  font: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
  layout: 'single' | 'two-column' | 'modern';
  preview: string;
}
