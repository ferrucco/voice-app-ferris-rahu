import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  RefreshCw,
  Send,
  MessageSquare,
  Globe,
  Headphones,
} from 'lucide-react';
import { Language, Message } from '../types/index.ts';
import {
  SUGGESTED_QUESTIONS_EN,
  SUGGESTED_QUESTIONS_FR,
} from '../data/ferrisData.ts';
import {
  floatTo16BitPCMBase64,
  LiveAudioPlayer,
  base64WavToUrl,
} from '../utils/audio.ts';

interface VoiceInterfaceProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  currentLanguage,
  onLanguageChange,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  // Voice interaction state
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to talk with Ferru');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: currentLanguage === 'fr'
        ? "Bonjour. Je suis Ferru, l'assistant vocal et représentant de Ferris Rahu. Je peux vous présenter son parcours à l'Estonian Business School, ses projets en IA ou son expertise web. Que souhaitez-vous découvrir ?"
        : "Hello. I am Ferru, the personal voice ambassador representing Ferris Rahu. I can share insights into his work at Estonian Business School, his AI systems, or his venture projects. How may I assist you today?",
      timestamp: new Date(),
      language: currentLanguage,
    },
  ]);

  // Audio level for visualizer
  const [audioLevel, setAudioLevel] = useState<number>(10);

  // References for Live WebSocket and Audio
  const liveSessionRef = useRef<any>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const isMutedRef = useRef<boolean>(false);
  const currentAudioElemRef = useRef<HTMLAudioElement | null>(null);

  // Keep mute ref updated
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Initialize audio player
  useEffect(() => {
    audioPlayerRef.current = new LiveAudioPlayer((playing) => {
      setIsPlayingAudio(playing);
      if (playing) {
        setLiveStatus('speaking');
        setStatusMessage('Ferru is speaking...');
      } else {
        if (isLiveActive) {
          setLiveStatus('listening');
          setStatusMessage('Listening to you...');
        }
      }
    });

    return () => {
      stopLiveSession();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.close();
      }
      if (currentAudioElemRef.current) {
        currentAudioElemRef.current.pause();
      }
    };
  }, []);

  // Update greeting when language switches
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'greeting',
            role: 'assistant',
            content: currentLanguage === 'fr'
              ? "Bonjour. Je suis Ferru, l'assistant vocal de Ferris Rahu. Je parle français avec un ton calme et posé. Posez-moi vos questions sur Ferris ou activez la voix en direct."
              : "Hello. I am Ferru, Ferris Rahu's voice assistant. I speak with a deep, composed American tone. Ask me anything about Ferris or start a live voice session.",
            timestamp: new Date(),
            language: currentLanguage,
          },
        ];
      }
      return prev;
    });
  }, [currentLanguage]);

  // Handle external prompts (e.g. from Project Cards)
  useEffect(() => {
    if (externalPrompt) {
      handleSendPrompt(externalPrompt);
      if (onClearExternalPrompt) {
        onClearExternalPrompt();
      }
    }
  }, [externalPrompt]);

  // Dynamic visualizer loop
  useEffect(() => {
    let animId: number;
    const updateLevel = () => {
      if (isPlayingAudio || liveStatus === 'speaking') {
        setAudioLevel(35 + Math.random() * 55);
      } else if (liveStatus === 'listening') {
        setAudioLevel(15 + Math.random() * 30);
      } else {
        setAudioLevel(8 + Math.random() * 6);
      }
      animId = requestAnimationFrame(updateLevel);
    };
    animId = requestAnimationFrame(updateLevel);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingAudio, liveStatus]);

  // Vercel-compatible Live API: receive a single-use ephemeral token, then
  // connect the browser directly to Gemini. Never expose the permanent API key.
  const startLiveSession = async () => {
    setLiveStatus('connecting');
    setStatusMessage('Connecting to Ferru voice...');
    let stream: MediaStream | null = null;
    try {
      const tokenResp = await fetch('/api/live/token', {method:'POST',cache:'no-store'});
      const tokenData = await tokenResp.json().catch(() => ({}));
      if (!tokenResp.ok || !tokenData.token) {
        throw new Error(tokenData.error || 'Gemini voice authorization failed.');
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}
      });
      mediaStreamRef.current = stream;

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtxClass({sampleRate:16000});
      inputAudioCtxRef.current = inputCtx;
      await inputCtx.resume();
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(2048,1,1);
      scriptProcessorRef.current = processor;
      source.connect(processor);
      processor.connect(inputCtx.destination);

      // Gemini Live accepts these short-lived token credentials.
      const ai = new GoogleGenAI({apiKey:tokenData.token});
      const session = await ai.live.connect({
        model: tokenData.model || 'gemini-3.8-live',
        config:{
          responseModalities:[Modality.AUDIO],
          speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Fenrir'}}},
          inputAudioTranscription:{},
          outputAudioTranscription:{},
          systemInstruction: "You are Ferru, Ferris Rahu's personal voice assistant for an Estonian Business School prototype. Introduce Ferris' AI projects, education and web work. Don't invent personal information or claim to have contacted Ferris. Keep spoken replies short and natural."
        },
        callbacks:{
          onopen:()=>{setIsLiveActive(true);setLiveStatus('listening');setStatusMessage('Ferru is listening. Speak naturally.');},
          onmessage:(message:any)=>{
            const content=message.serverContent;
            if(!content)return;
            for(const part of content.modelTurn?.parts || []){
              if(part.inlineData?.data)audioPlayerRef.current?.playChunk(part.inlineData.data);
            }
            const spoken=content.outputTranscription?.text ||
              (content.modelTurn?.parts || []).map((p:any)=>p.text||'').join('');
            if(spoken){
              setMessages(prev=>[...prev,{
                id:`live-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
                role:'assistant',content:spoken,timestamp:new Date(),language:currentLanguage
              }]);
            }
            if(content.interrupted){
              audioPlayerRef.current?.stop();
              setLiveStatus('listening');
              setStatusMessage('Listening...');
            }
          },
          onerror:(error:any)=>{
            console.error('Gemini Live failure',error);
            setLiveStatus('error');
            setIsLiveActive(false);
            setStatusMessage('Live session ended. Check Gemini model access and retry.');
          },
          onclose:()=>{setIsLiveActive(false);setLiveStatus('idle');setStatusMessage('Live session ended.');}
        }
      });
      liveSessionRef.current=session;
      setIsLiveActive(true);
      setLiveStatus('listening');
      setStatusMessage('Ferru is listening. Speak naturally.');
      processor.onaudioprocess=(event)=>{
        if(isMutedRef.current || !liveSessionRef.current)return;
        try {
          liveSessionRef.current.sendRealtimeInput({
            audio:{data:floatTo16BitPCMBase64(event.inputBuffer.getChannelData(0)),mimeType:'audio/pcm;rate=16000'}
          });
        } catch (error) { console.error('Live microphone stream ended',error); }
      };
      const prompt=currentLanguage==='fr'
        ? "Présente-toi en français très brièvement, comme l'assistant vocal de Ferris Rahu."
        : "Introduce yourself briefly in English as Ferris Rahu's AI voice assistant.";
      session.sendRealtimeInput({text:prompt});
    }catch(error:any){
      console.error('Ferru voice start error',error);
      setIsLiveActive(false);
      setLiveStatus('error');
      setStatusMessage(error?.name==='NotAllowedError'
        ? 'Microphone permission denied. Allow microphone access in your browser.'
        : `Voice connection failed: ${error?.message || 'Please retry'}`);
      cleanupAudioNodes();
    }
  };

  const cleanupAudioNodes = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
    }
  };

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      try { liveSessionRef.current.close(); } catch {}
      liveSessionRef.current = null;
    }
    cleanupAudioNodes();
    setIsLiveActive(false);
    setLiveStatus('idle');
    setStatusMessage('Voice link is standby');
  };

  // Turn-based voice request using Gemini 3.8 Flash + Fenrir TTS
  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    // Stop live session if active to avoid audio collision
    if (isLiveActive) {
      stopLiveSession();
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date(),
      language: currentLanguage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setTextInput('');
    setIsThinking(true);
    setStatusMessage('Ferru is formulating response...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          language: currentLanguage,
          history: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      let audioUrl: string | undefined = undefined;
      if (data.audio) {
        audioUrl = base64WavToUrl(data.audio, data.mimeType);
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        audioUrl,
        timestamp: new Date(),
        language: currentLanguage,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
      setStatusMessage('Ready');

      // Play audio automatically
      if (audioUrl) {
        playWavAudio(audioUrl);
      }
    } catch (err: unknown) {
      console.error('Chat error:', err);
      setIsThinking(false);
      setStatusMessage('Response failed. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: currentLanguage === 'fr'
            ? "Pardonnez-moi, une difficulté technique est survenue. Veuillez reformuler votre question."
            : "My apologies, I encountered a brief connection error. Please try asking again.",
          timestamp: new Date(),
          language: currentLanguage,
        },
      ]);
    }
  };

  const playWavAudio = (url: string) => {
    if (currentAudioElemRef.current) {
      currentAudioElemRef.current.pause();
    }
    const audio = new Audio(url);
    currentAudioElemRef.current = audio;
    setIsPlayingAudio(true);
    setLiveStatus('speaking');
    setStatusMessage('Ferru speaking (Fenrir - Deep Male)...');

    audio.onended = () => {
      setIsPlayingAudio(false);
      setLiveStatus('idle');
      setStatusMessage('Ready');
    };

    audio.onerror = () => {
      setIsPlayingAudio(false);
      setLiveStatus('idle');
    };

    audio.play().catch((e) => {
      console.warn('Audio auto-play blocked:', e);
      setIsPlayingAudio(false);
      setLiveStatus('idle');
    });
  };

  const stopAnyPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
    }
    if (currentAudioElemRef.current) {
      currentAudioElemRef.current.pause();
    }
    setIsPlayingAudio(false);
    setLiveStatus(isLiveActive ? 'listening' : 'idle');
    setStatusMessage(isLiveActive ? 'Listening to you...' : 'Ready');
  };

  const questions = currentLanguage === 'fr' ? SUGGESTED_QUESTIONS_FR : SUGGESTED_QUESTIONS_EN;

  return (
    <section id="voice-interface" className="pt-12 pb-16 px-6 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs tracking-wider uppercase font-medium text-[#8C6D3F] border border-[#E7E2D6] rounded-full bg-[#FAF7F2] mb-3">
          <Headphones className="w-3.5 h-3.5" />
          <span>Gemini 3.8 Live & Speech Architecture</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1C1A17] tracking-tight">
          Converse with Ferru
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#575249] max-w-xl mx-auto leading-relaxed">
          {currentLanguage === 'fr'
            ? 'Représentant officiel de Ferris Rahu. Voix masculine grave, éloquente, articulée en anglais américain et français naturel.'
            : 'Official voice representative for Ferris Rahu. Deep baritone presence, articulate American cadence in English and refined French.'}
        </p>

        {/* Language Selection Segmented Control */}
        <div className="mt-6 inline-flex items-center p-1 bg-[#F3EFE6] border border-[#E7E2D6] rounded-lg">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              currentLanguage === 'en'
                ? 'bg-[#1C1A17] text-[#FAF7F2] shadow-sm'
                : 'text-[#575249] hover:text-[#1C1A17]'
            }`}
          >
            English · American Accent
          </button>
          <button
            onClick={() => onLanguageChange('fr')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              currentLanguage === 'fr'
                ? 'bg-[#1C1A17] text-[#FAF7F2] shadow-sm'
                : 'text-[#575249] hover:text-[#1C1A17]'
            }`}
          >
            Français · Accent Français
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-[#FFFFFF] border border-[#E7E2D6] rounded-2xl shadow-sm overflow-hidden p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Center Visualizer Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center text-center py-4">
            {/* Visualizer Orb */}
            <div className="relative flex items-center justify-center w-52 h-52 sm:w-64 sm:h-64 my-2">
              {/* Outer pulsing acoustic ring */}
              <div
                className={`absolute inset-0 rounded-full border border-[#8C6D3F]/25 transition-all duration-300 ${
                  isPlayingAudio || isLiveActive ? 'animate-voice-pulse' : 'opacity-40'
                }`}
                style={{
                  transform: `scale(${1 + (audioLevel / 200)})`,
                }}
              />
              {/* Secondary subtle halo */}
              <div
                className="absolute inset-4 rounded-full border border-[#D8D1C3] bg-[#FAF7F2]/60 backdrop-blur-sm transition-transform duration-200"
                style={{
                  transform: `scale(${1 + (audioLevel / 350)})`,
                }}
              />
              {/* Core tactile disc */}
              <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#1C1A17] text-[#FAF7F2] flex flex-col items-center justify-center p-4 shadow-md transition-all">
                <span className="font-serif text-2xl tracking-wide font-medium text-[#FAF7F2]">
                  FERRU
                </span>
                <span className="text-[11px] uppercase tracking-widest text-[#C9A96E] mt-0.5">
                  Deep Male
                </span>

                {/* Animated soundbars */}
                <div className="flex items-center gap-1.5 mt-3 h-7">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#C9A96E] rounded-full transition-all duration-150"
                      style={{
                        height: isPlayingAudio || liveStatus === 'speaking'
                          ? `${Math.max(6, Math.sin(Date.now() / 200 + i) * 24 + 10)}px`
                          : isLiveActive
                          ? `${Math.max(4, Math.sin(i * 1.5) * 12 + 6)}px`
                          : '4px',
                        opacity: isPlayingAudio || isLiveActive ? 0.9 : 0.4,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Status Readout */}
            <div className="mt-4 flex items-center gap-2 text-xs text-[#575249]">
              <span className={`w-2 h-2 rounded-full ${
                liveStatus === 'connected' || liveStatus === 'speaking' || isPlayingAudio
                  ? 'bg-[#8C6D3F]'
                  : liveStatus === 'listening'
                  ? 'bg-amber-600 animate-pulse'
                  : 'bg-[#C8BEAC]'
              }`} />
              <span className="font-medium">{statusMessage}</span>
            </div>

            {/* Primary Action Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {!isLiveActive ? (
                <button
                  onClick={startLiveSession}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1C1A17] text-[#FAF7F2] rounded-lg text-xs tracking-wider uppercase font-medium hover:bg-[#2F2C27] transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <Radio className="w-4 h-4 text-[#C9A96E]" />
                  <span>Start Gemini Live Session</span>
                </button>
              ) : (
                <button
                  onClick={stopLiveSession}
                  className="flex items-center gap-2 px-6 py-3 bg-[#8C6D3F] text-white rounded-lg text-xs tracking-wider uppercase font-medium hover:bg-[#785D36] transition-all cursor-pointer shadow-sm"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>End Live Session</span>
                </button>
              )}

              {isLiveActive && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-[#FAF7F2] border-[#E7E2D6] text-[#1C1A17] hover:bg-[#F3EFE6]'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              {isPlayingAudio && (
                <button
                  onClick={stopAnyPlayback}
                  className="p-3 bg-[#FAF7F2] border border-[#E7E2D6] text-[#575249] hover:text-[#1C1A17] rounded-lg text-xs font-medium cursor-pointer"
                  title="Pause audio"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="mt-3 text-[11px] text-[#847E72]">
              {isLiveActive
                ? 'Bidirectional microphone stream active via Gemini 3.8 Live API.'
                : 'Click above to start live voice streaming, or select any question below.'}
            </p>
          </div>

          {/* Right Column: Suggested Inquiries & Quick Prompts (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#E7E2D6] pt-6 lg:pt-0 lg:pl-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1A17]">
                  {currentLanguage === 'fr' ? 'Questions Fréquentes' : 'Curated Inquiries'}
                </span>
                <span className="text-[11px] text-[#847E72]">
                  {currentLanguage === 'fr' ? 'Cliquez pour écouter' : 'Click to hear Ferru'}
                </span>
              </div>

              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(q)}
                    disabled={isThinking}
                    className="w-full text-left p-3 text-xs bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#E7E2D6] rounded-lg text-[#1C1A17] transition-all cursor-pointer flex items-center justify-between gap-2 group"
                  >
                    <span className="line-clamp-2 leading-relaxed">{q}</span>
                    <Volume2 className="w-3.5 h-3.5 text-[#8C6D3F] shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Query Input */}
            <div className="mt-6 pt-4 border-t border-[#E7E2D6]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt(textInput);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={
                    currentLanguage === 'fr'
                      ? 'Poser une question spécifique à Ferru...'
                      : 'Ask Ferru a custom question about Ferris...'
                  }
                  className="flex-1 px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E7E2D6] rounded-lg text-[#1C1A17] placeholder-[#847E72] focus:outline-none focus:ring-1 focus:ring-[#8C6D3F]"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isThinking}
                  className="px-3.5 py-2.5 bg-[#1C1A17] text-[#FAF7F2] rounded-lg text-xs font-medium hover:bg-[#2F2C27] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {isThinking ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Live Conversation Transcript Accordion / Window */}
        <div className="mt-8 pt-6 border-t border-[#E7E2D6]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1C1A17]">
              <MessageSquare className="w-3.5 h-3.5 text-[#8C6D3F]" />
              <span>Dialogue Record</span>
            </div>
            <span className="text-[11px] text-[#847E72]">
              {messages.length} {messages.length === 1 ? 'exchange' : 'exchanges'}
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-2 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3.5 rounded-xl border leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#FAF7F2] border-[#E7E2D6] ml-8 text-[#1C1A17]'
                    : 'bg-[#FDFBF7] border-[#E7E2D6] mr-8 text-[#1C1A17]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[10px] text-[#847E72] uppercase tracking-wider">
                  <span className="font-semibold text-[#8C6D3F]">
                    {m.role === 'user' ? 'Visitor' : 'Ferru (Voice Ambassador)'}
                  </span>
                  {m.audioUrl && (
                    <button
                      onClick={() => playWavAudio(m.audioUrl!)}
                      className="flex items-center gap-1 text-[#8C6D3F] hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Replay Voice</span>
                    </button>
                  )}
                </div>
                <p className="font-sans text-[#2B2926] text-xs leading-normal">
                  {m.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
