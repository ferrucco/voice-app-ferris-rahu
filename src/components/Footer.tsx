import React from 'react';
import { FERRIS_PROFILE } from '../data/ferrisData.ts';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E7E2D6] bg-[#FAF7F2] py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#575249]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-serif text-lg font-medium text-[#1C1A17]">
            FERRU
          </span>
          <span className="text-[#847E72] hidden sm:inline">|</span>
          <span className="text-[#575249]">
            Personal Voice Assistant representing {FERRIS_PROFILE.name}
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <span>{FERRIS_PROFILE.location}</span>
          <span className="text-[#D8D1C3]">·</span>
          <a
            href={`mailto:${FERRIS_PROFILE.email}`}
            className="text-[#1C1A17] hover:text-[#8C6D3F] transition-colors"
          >
            {FERRIS_PROFILE.email}
          </a>
        </div>
      </div>
    </footer>
  );
};
