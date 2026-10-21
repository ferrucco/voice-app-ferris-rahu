/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TopBar } from './components/TopBar.tsx';
import { VoiceInterface } from './components/VoiceInterface.tsx';
import { ProfileHero } from './components/ProfileHero.tsx';
import { ProjectsSection } from './components/ProjectsSection.tsx';
import { ExperienceEducationSection } from './components/ExperienceEducationSection.tsx';
import { CVModal } from './components/CVModal.tsx';
import { Footer } from './components/Footer.tsx';
import { Language } from './types/index.ts';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isCVModalOpen, setIsCVModalOpen] = useState<boolean>(false);
  const [queuedPrompt, setQueuedPrompt] = useState<string | null>(null);

  const handleStartVoice = () => {
    const el = document.getElementById('voice-interface');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlayIntro = (lang: Language) => {
    setCurrentLanguage(lang);
    const introPrompt =
      lang === 'fr'
        ? "Présente-toi et présente Ferris Rahu de manière élégante et concise en français avec ta voix grave."
        : "Introduce yourself and present Ferris Rahu in a concise, articulate manner in English with your deep baritone voice.";
    setQueuedPrompt(introPrompt);
    handleStartVoice();
  };

  const handleTriggerQuestion = (prompt: string) => {
    setQueuedPrompt(prompt);
    handleStartVoice();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1A17] flex flex-col selection:bg-[#E7E2D6] selection:text-[#1C1A17]">
      {/* 3-Zone Top Navigation Bar */}
      <TopBar
        onStartVoice={handleStartVoice}
        isVoiceActive={false}
        onOpenCV={() => setIsCVModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Profile Hero: Editorial introduction to Ferris Rahu */}
        <ProfileHero
          onPlayIntro={handlePlayIntro}
          onOpenCV={() => setIsCVModalOpen(true)}
          onTriggerVoiceQuestion={handleTriggerQuestion}
        />

        {/* Voice Interface: Interactive Voice Assistant Ferru */}
        <VoiceInterface
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          externalPrompt={queuedPrompt}
          onClearExternalPrompt={() => setQueuedPrompt(null)}
        />

        {/* Selected Works & Systems: 3 key projects */}
        <ProjectsSection
          currentLanguage={currentLanguage}
          onAskAboutProject={handleTriggerQuestion}
        />

        {/* Experience, Education & Skills matrix */}
        <ExperienceEducationSection
          currentLanguage={currentLanguage}
          onAskExperience={handleTriggerQuestion}
        />
      </main>

      {/* CV Modal with live embedded PDF and download */}
      <CVModal
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
      />

      {/* Quiet minimalist footer */}
      <Footer />
    </div>
  );
}
