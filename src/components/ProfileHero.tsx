import React from 'react';
import { Mail, Phone, MapPin, FileText, Volume2, ArrowRight } from 'lucide-react';
import { FERRIS_PROFILE } from '../data/ferrisData.ts';
import { Language } from '../types/index.ts';

interface ProfileHeroProps {
  onPlayIntro: (lang: Language) => void;
  onOpenCV: () => void;
  onTriggerVoiceQuestion: (question: string) => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  onPlayIntro,
  onOpenCV,
  onTriggerVoiceQuestion,
}) => {
  return (
    <section id="about" className="pt-8 pb-14 px-6 max-w-5xl mx-auto border-b border-[#E7E2D6]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Typographic Focus (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Subtle Category Kicker */}
          <div className="text-xs font-semibold uppercase tracking-widest text-[#8C6D3F]">
            Candidate & Builder Profile
          </div>

          {/* Primary Name & Title */}
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1C1A17] tracking-tight leading-[1.08]">
              Ferris Rahu
            </h1>
            <p className="mt-3 font-serif text-xl sm:text-2xl text-[#575249] italic">
              {FERRIS_PROFILE.title}
            </p>
          </div>

          {/* Clean Unboxed Metadata (Zero-pill discipline) */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-[#575249] pt-1">
            <span className="flex items-center gap-1.5 font-medium text-[#1C1A17]">
              <MapPin className="w-3.5 h-3.5 text-[#8C6D3F]" />
              {FERRIS_PROFILE.location}
            </span>
            <span aria-hidden="true" className="text-[#D8D1C3]">·</span>
            <a
              href={`mailto:${FERRIS_PROFILE.email}`}
              className="flex items-center gap-1.5 hover:text-[#1C1A17] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#8C6D3F]" />
              {FERRIS_PROFILE.email}
            </a>
            <span aria-hidden="true" className="text-[#D8D1C3]">·</span>
            <a
              href={`tel:${FERRIS_PROFILE.phone}`}
              className="flex items-center gap-1.5 hover:text-[#1C1A17] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#8C6D3F]" />
              {FERRIS_PROFILE.phone}
            </a>
          </div>

          {/* Profile Bio */}
          <div className="pt-2 text-sm sm:text-base text-[#423F3A] leading-relaxed max-w-2xl font-normal">
            <p>{FERRIS_PROFILE.bio}</p>
          </div>

          {/* Audio Intro CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlayIntro('en')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#E7E2D6] rounded-lg text-xs font-medium text-[#1C1A17] transition-all cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-[#8C6D3F]" />
              <span>Voice Briefing (English)</span>
            </button>
            <button
              onClick={() => onPlayIntro('fr')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#E7E2D6] rounded-lg text-xs font-medium text-[#1C1A17] transition-all cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-[#8C6D3F]" />
              <span>Présentation Vocale (Français)</span>
            </button>
            <button
              onClick={onOpenCV}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1A17] hover:bg-[#2F2C27] text-[#FAF7F2] rounded-lg text-xs font-medium transition-all cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4 text-[#C9A96E]" />
              <span>View Curriculum Vitae (PDF)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Architectural Overview Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#E7E2D6] rounded-xl p-6 space-y-5">
          <div className="border-b border-[#E7E2D6] pb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C6D3F]">
              Academic & Operational Anchor
            </span>
            <h3 className="font-serif text-lg font-medium text-[#1C1A17] mt-1">
              Estonian Business School
            </h3>
            <p className="text-xs text-[#575249] mt-0.5">
              B.A. Business and Entrepreneurship · 2026–present
            </p>
          </div>

          {/* Quick Focus Disciplines */}
          <div className="space-y-3 text-xs text-[#575249]">
            <div>
              <span className="font-semibold text-[#1C1A17] block">Academic Focus</span>
              <p className="mt-0.5 text-[#575249]">
                Entrepreneurship, digital marketing, business development, and startup validation.
              </p>
            </div>
            <div>
              <span className="font-semibold text-[#1C1A17] block">Practical Work</span>
              <p className="mt-0.5 text-[#575249]">
                Event Center stage rigging, truss setup, and event logistics under strict schedules.
              </p>
            </div>
            <div>
              <span className="font-semibold text-[#1C1A17] block">Linguistic Breadth</span>
              <p className="mt-0.5 text-[#575249]">
                Estonian (Native) · English (Strong) · Russian · German (A2)
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E7E2D6]">
            <button
              onClick={() => onTriggerVoiceQuestion("What are Ferris's primary goals at Estonian Business School?")}
              className="w-full flex items-center justify-between text-xs text-[#8C6D3F] hover:text-[#1C1A17] font-medium transition-colors cursor-pointer"
            >
              <span>Ask Ferru about EBS studies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
