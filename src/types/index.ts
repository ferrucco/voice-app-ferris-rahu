export type Language = 'en' | 'fr';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  language?: Language;
}

export interface ProjectItem {
  id: string;
  title: string;
  year: string;
  description: string;
  tags: string[];
  inquiryPromptEn: string;
  inquiryPromptFr: string;
}

export interface FerrisProfile {
  name: string;
  agentName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  cvPath: string;
  bio: string;
  education: {
    school: string;
    degree: string;
    period: string;
    description: string;
  };
  experience: {
    role: string;
    organization: string;
    description: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  languages: {
    language: string;
    level: string;
  }[];
  interests: string[];
}
