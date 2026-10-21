import React from 'react';
import { Mic, Volume2 } from 'lucide-react';

interface TopBarProps {
  onStartVoice: () => void;
  isVoiceActive: boolean;
  onOpenCV: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onStartVoice,
  isVoiceActive,
  onOpenCV,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E7E2D6]">
      <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line text element wordmark */}
        <a
          href="#"
          className="font-serif text-2xl font-bold tracking-tight text-[#1C1A17] whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
        >
          FERRU
        </a>

        {/* Zone 2: 4–5 nav links, 1–2 word labels, single-line */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#575249]">
          <a
            href="#voice-interface"
            className="hover:text-[#1C1A17] transition-colors whitespace-nowrap shrink-0"
          >
            Voice
          </a>
          <a
            href="#about"
            className="hover:text-[#1C1A17] transition-colors whitespace-nowrap shrink-0"
          >
            Profile
          </a>
          <a
            href="#projects"
            className="hover:text-[#1C1A17] transition-colors whitespace-nowrap shrink-0"
          >
            Projects
          </a>
          <a
            href="#experience"
            className="hover:text-[#1C1A17] transition-colors whitespace-nowrap shrink-0"
          >
            Background
          </a>
          <button
            onClick={onOpenCV}
            className="hover:text-[#1C1A17] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Curriculum
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onStartVoice}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md tracking-wider uppercase transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              isVoiceActive
                ? 'bg-[#8C6D3F] text-white shadow-sm ring-2 ring-[#8C6D3F]/30'
                : 'bg-[#1C1A17] text-[#FAF7F2] hover:bg-[#2F2C27]'
            }`}
          >
            {isVoiceActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Voice Active</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Talk with Ferru</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
