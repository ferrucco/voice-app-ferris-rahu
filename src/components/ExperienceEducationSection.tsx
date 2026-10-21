import React from 'react';
import { Briefcase, GraduationCap, Wrench, Languages, Compass, ArrowRight } from 'lucide-react';
import { FERRIS_PROFILE } from '../data/ferrisData.ts';
import { Language } from '../types/index.ts';

interface ExperienceEducationSectionProps {
  currentLanguage: Language;
  onAskExperience: (question: string) => void;
}

export const ExperienceEducationSection: React.FC<ExperienceEducationSectionProps> = ({
  currentLanguage,
  onAskExperience,
}) => {
  return (
    <section id="experience" className="py-14 px-6 max-w-5xl mx-auto border-b border-[#E7E2D6]">
      {/* Section Header */}
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#8C6D3F]">
          Background & Capabilities
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1A17] tracking-tight mt-1">
          Experience & Skills
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Education & Experience (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Education Card */}
          <div className="bg-[#FFFFFF] border border-[#E7E2D6] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#FAF7F2] border border-[#E7E2D6] rounded-lg text-[#8C6D3F] shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-xl font-medium text-[#1C1A17]">
                    {FERRIS_PROFILE.education.school}
                  </h3>
                  <span className="font-mono text-xs text-[#847E72]">
                    {FERRIS_PROFILE.education.period}
                  </span>
                </div>
                <div className="text-xs font-medium text-[#8C6D3F] mt-0.5">
                  {FERRIS_PROFILE.education.degree}
                </div>
                <p className="mt-3 text-xs text-[#575249] leading-relaxed">
                  {FERRIS_PROFILE.education.description}
                </p>
                <div className="mt-4 pt-3 border-t border-[#E7E2D6]">
                  <button
                    onClick={() =>
                      onAskExperience(
                        currentLanguage === 'fr'
                          ? "Explique-moi les études de Ferris à l'EBS."
                          : "Tell me about Ferris's curriculum and studies at Estonian Business School."
                      )
                    }
                    className="flex items-center gap-1.5 text-xs text-[#8C6D3F] hover:text-[#1C1A17] font-medium transition-colors cursor-pointer"
                  >
                    <span>{currentLanguage === 'fr' ? 'Poser une question à Ferru' : 'Inquire with Ferru'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience Card */}
          <div className="bg-[#FFFFFF] border border-[#E7E2D6] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#FAF7F2] border border-[#E7E2D6] rounded-lg text-[#8C6D3F] shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-xl font-medium text-[#1C1A17]">
                    Stagehand / Event Setup
                  </h3>
                  <span className="font-mono text-xs text-[#847E72]">
                    Event Center
                  </span>
                </div>
                <div className="text-xs font-medium text-[#8C6D3F] mt-0.5">
                  Operations & Production Rigging
                </div>
                <p className="mt-3 text-xs text-[#575249] leading-relaxed">
                  Assisted with stage and truss setup, event preparation and teardown. Worked in dynamic teams under strict event timelines with an emphasis on practical problem-solving, stamina, and operational reliability.
                </p>
                <div className="mt-4 pt-3 border-t border-[#E7E2D6]">
                  <button
                    onClick={() =>
                      onAskExperience(
                        currentLanguage === 'fr'
                          ? "Quelle expérience pratique Ferris a-t-il acquise dans l'événementiel ?"
                          : "What practical skills did Ferris gain in event setup and stage management?"
                      )
                    }
                    className="flex items-center gap-1.5 text-xs text-[#8C6D3F] hover:text-[#1C1A17] font-medium transition-colors cursor-pointer"
                  >
                    <span>{currentLanguage === 'fr' ? 'Écouter les détails avec Ferru' : 'Hear details from Ferru'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skills, Languages & Interests (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Skills Breakdown */}
          <div className="bg-[#FFFFFF] border border-[#E7E2D6] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1C1A17] border-b border-[#E7E2D6] pb-2.5">
              <Wrench className="w-3.5 h-3.5 text-[#8C6D3F]" />
              <span>Skills Matrix</span>
            </div>

            {FERRIS_PROFILE.skills.map((category) => (
              <div key={category.category} className="space-y-1">
                <span className="text-xs font-semibold text-[#1C1A17] block">
                  {category.category}
                </span>
                <p className="text-xs text-[#575249] leading-relaxed">
                  {category.items.join(' · ')}
                </p>
              </div>
            ))}
          </div>

          {/* Languages & Interests */}
          <div className="bg-[#FFFFFF] border border-[#E7E2D6] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1C1A17] border-b border-[#E7E2D6] pb-2.5">
              <Languages className="w-3.5 h-3.5 text-[#8C6D3F]" />
              <span>Languages & Focus</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#1C1A17] block">
                Languages Spoken by Ferris
              </span>
              <p className="text-xs text-[#575249]">
                {FERRIS_PROFILE.languages.map((l) => `${l.language} (${l.level})`).join(' · ')}
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-xs font-semibold text-[#1C1A17] block">
                Personal Interests
              </span>
              <p className="text-xs text-[#575249]">
                {FERRIS_PROFILE.interests.join(' · ')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
