import React from 'react';
import { Volume2, Sparkles, ArrowUpRight } from 'lucide-react';
import { PROJECTS_DATA } from '../data/ferrisData.ts';
import { Language, ProjectItem } from '../types/index.ts';

interface ProjectsSectionProps {
  currentLanguage: Language;
  onAskAboutProject: (prompt: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  currentLanguage,
  onAskAboutProject,
}) => {
  return (
    <section id="projects" className="py-14 px-6 max-w-5xl mx-auto border-b border-[#E7E2D6]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#8C6D3F]">
            Selected Works & Systems
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1A17] tracking-tight mt-1">
            Selected Projects
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#575249] max-w-md">
          {currentLanguage === 'fr'
            ? 'Prototypes pratiques en intelligence artificielle, modélisation de décision et services web créés par Ferris.'
            : 'Practical AI prototypes, decision architecture, and web services created and deployed by Ferris.'}
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PROJECTS_DATA.map((project: ProjectItem, index: number) => {
          const inquiryPrompt = currentLanguage === 'fr' ? project.inquiryPromptFr : project.inquiryPromptEn;

          return (
            <div
              key={project.id}
              className="bg-[#FFFFFF] border border-[#E7E2D6] rounded-xl p-6 flex flex-col justify-between hover:border-[#D8D1C3] transition-all hover:shadow-xs group"
            >
              <div>
                {/* Year & Index */}
                <div className="flex items-center justify-between text-xs text-[#847E72] mb-3">
                  <span className="font-mono text-[#8C6D3F] font-medium">0{index + 1}.</span>
                  <span className="font-mono">{project.year}</span>
                </div>

                {/* Project Title */}
                <h3 className="font-serif text-xl font-medium text-[#1C1A17] group-hover:text-[#8C6D3F] transition-colors leading-snug">
                  {project.title}
                </h3>

                {/* Unboxed Metadata / Tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#575249] mt-2 mb-4">
                  {project.tags.map((tag, tIdx) => (
                    <React.Fragment key={tag}>
                      <span>{tag}</span>
                      {tIdx < project.tags.length - 1 && (
                        <span aria-hidden="true" className="text-[#D8D1C3]">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Description */}
                <p className="text-xs text-[#423F3A] leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Action Button: Ask Ferru */}
              <div className="pt-6 mt-6 border-t border-[#E7E2D6]">
                <button
                  onClick={() => onAskAboutProject(inquiryPrompt)}
                  className="w-full flex items-center justify-between py-2 px-3 bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#E7E2D6] rounded-lg text-xs font-medium text-[#1C1A17] transition-all cursor-pointer group-hover:border-[#C9A96E]"
                >
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#8C6D3F]" />
                    <span>{currentLanguage === 'fr' ? 'Demander à Ferru' : 'Hear Ferru explain'}</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#847E72] group-hover:text-[#1C1A17] transition-colors" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
