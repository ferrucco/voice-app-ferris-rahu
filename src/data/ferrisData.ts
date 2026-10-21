import { FerrisProfile, ProjectItem } from '../types/index.ts';

export const FERRIS_PROFILE: FerrisProfile = {
  name: 'Ferris Rahu',
  agentName: 'Ferru',
  title: 'Business & Entrepreneurship Student • AI Projects • Web Development',
  location: 'Tallinn, Estonia',
  email: 'ferrisrahu33@gmail.com',
  phone: '+372 507 1898',
  cvPath: '/public/assets/aistudio/Ferris_Rahu_CV_Updated_2026_de1a9f66.pdf',
  bio: 'Entrepreneurship-focused student at Estonian Business School with hands-on experience in event production, digital services and building practical AI prototypes. Interested in turning technology into useful products and testing business ideas through real-world projects.',
  education: {
    school: 'Estonian Business School (EBS)',
    degree: 'Business and Entrepreneurship',
    period: '2026–present',
    description: 'Studies focused on entrepreneurship, marketing, business development and practical startup work.',
  },
  experience: [
    {
      role: 'Stagehand / Event Setup',
      organization: 'Event Center',
      description: 'Assisted with stage and truss setup, event preparation and teardown. Worked in dynamic teams under tight event timelines with a strong emphasis on practical problem-solving, stamina, and operational reliability.',
    },
  ],
  skills: [
    {
      category: 'AI & Development',
      items: ['Claude Code', 'ChatGPT', 'Ollama', 'Local AI workflows', 'Git & GitHub', 'VS Code', 'Prototyping & APIs'],
    },
    {
      category: 'Business & Venture',
      items: ['Entrepreneurial research', 'Digital marketing concepts', 'Project coordination', 'Executive presentations', 'Venture validation'],
    },
    {
      category: 'Execution & Practical',
      items: ['Event setup & stage rigging', 'Teamwork under pressure', 'Client communication', 'Pragmatic problem-solving'],
    },
  ],
  languages: [
    { language: 'Estonian', level: 'Native' },
    { language: 'English', level: 'Strong (Fluent)' },
    { language: 'Russian', level: 'Basic' },
    { language: 'German', level: 'A2' },
  ],
  interests: ['Entrepreneurship', 'Artificial Intelligence', 'Investing & Markets', 'Golf', 'Applied Technology'],
};

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'voice-agent',
    title: 'Personal AI Voice Agent',
    year: '2026',
    description: 'Built a bilingual English–Estonian voice assistant for an EBS assignment, using local AI inference and speech tools. Made the interface accessible by QR code while keeping model services on the host computer.',
    tags: ['Local Inference', 'Speech AI', 'EBS Assignment', 'QR Interface'],
    inquiryPromptEn: 'Tell me about the Personal AI Voice Agent project Ferris built for EBS.',
    inquiryPromptFr: "Parle-moi du projet d'agent vocal IA personnel créé par Ferris pour l'EBS.",
  },
  {
    id: 'ai-boardroom',
    title: 'AI Boardroom',
    year: '2026',
    description: 'Co-developed a multi-model decision-review workflow designed to challenge assumptions, organize feedback and produce concise decision summaries.',
    tags: ['Multi-Model Workflows', 'Decision Architecture', 'Assumption Testing', 'Executive Briefs'],
    inquiryPromptEn: 'How does Ferris’s AI Boardroom multi-model workflow work?',
    inquiryPromptFr: "Comment fonctionne le système d'AI Boardroom développé par Ferris ?",
  },
  {
    id: 'rn-web-studio',
    title: 'RN Web Studio',
    year: '2026',
    description: 'Worked on a web services concept focused on business websites, online stores and maintenance, including client-facing service positioning and digital presence.',
    tags: ['Web Design', 'Client Positioning', 'E-Commerce', 'Digital Maintenance'],
    inquiryPromptEn: 'What is RN Web Studio and what web services does it focus on?',
    inquiryPromptFr: "Qu'est-ce que RN Web Studio et quels services web propose-t-il ?",
  },
];

export const SUGGESTED_QUESTIONS_EN = [
  'What is Ferris studying at Estonian Business School?',
  'Explain the AI Boardroom decision review system.',
  'How was the Personal AI Voice Agent built?',
  'What services does RN Web Studio offer?',
  'How can I get in touch with Ferris for a project?',
];

export const SUGGESTED_QUESTIONS_FR = [
  "Présente-moi le parcours de Ferris à l'EBS.",
  "Explique-moi le système de revue de décision AI Boardroom.",
  "Comment l'agent vocal bilingue a-t-il été conçu ?",
  "Quels sont les services proposés par RN Web Studio ?",
  'Comment puis-je contacter Ferris pour une collaboration ?',
];
