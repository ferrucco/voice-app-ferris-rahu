import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Serve static public folder
app.use('/public', express.static(path.resolve(__dirname, 'public')));
app.use(express.static(path.resolve(__dirname, 'public')));

// Server-side GoogleGenAI initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const FERRIS_PROFILE_KNOWLEDGE = `
FULL PROFILE OF FERRIS RAHU:
- Name: Ferris Rahu
- Status: Business & Entrepreneurship Student at Estonian Business School (EBS), 2026–present
- Location: Tallinn, Estonia
- Email: ferrisrahu33@gmail.com
- Phone: +372 507 1898
- Summary: Entrepreneurship-focused student at Estonian Business School with hands-on experience in event production, digital services, and building practical AI prototypes. Passionate about turning technology into useful products and testing business ideas through real-world projects.

EDUCATION:
- Estonian Business School (EBS), Tallinn, Estonia (2026–present)
  Studies focused on entrepreneurship, marketing, business development, and practical startup work.

WORK & PRACTICAL EXPERIENCE:
- Event Center — Stagehand / Event Setup:
  Assisted with stage and truss setup, event preparation, and teardown. Worked in dynamic teams under event timelines with an emphasis on practical problem-solving, stamina, and unyielding reliability.

SELECTED NOTABLE PROJECTS:
1. Personal AI Voice Agent (2026):
   Built a bilingual English–Estonian voice assistant for an EBS assignment, using local AI inference and speech tools. Designed the interface to be instantly accessible via QR code while keeping model services securely running on the host computer.
2. AI Boardroom (2026):
   Co-developed a multi-model decision-review workflow designed to challenge business assumptions, organize cross-perspective feedback, and produce crisp, concise executive decision summaries.
3. RN Web Studio (2026):
   Worked on a web services concept focused on business websites, online stores, performance optimization, and ongoing maintenance, including client-facing service positioning and digital brand presence.

SKILLS & TOOLKIT:
- AI & Development: Claude Code, ChatGPT, Ollama, local AI workflows, Git/GitHub, VS Code, full-stack prototyping, API integration.
- Business & Strategy: Entrepreneurial research, digital marketing concepts, project coordination, pitch presentations, startup feasibility.
- Practical & Execution: Event setup, stage rigging & operations, teamwork under pressure, client communication, pragmatic problem-solving.

LANGUAGES:
- Estonian: Native
- English: Strong / Fluent
- Russian: Basic
- German: A2

INTERESTS & PASSIONS:
- Entrepreneurship, Artificial Intelligence, Investing & Capital Markets, Golf, and Applied Technology.
`;

export const FERRU_SYSTEM_INSTRUCTION = `
You are Ferru, the personal AI voice assistant and representative of Ferris Rahu.
Ferris Rahu is a Business & Entrepreneurship student at Estonian Business School (EBS), builder of AI prototypes and digital web ventures.

Your vocal persona:
- Deep, calm, resonant, and masculine baritone tone.
- English: Speak with a confident, polished American accent, articulate diction, and relaxed professional presence.
- French: Speak with an authentic, refined French accent and native-like French phrasing, polite and elegant.
- You fluently switch between English and French depending on the language spoken to you, or respond in the requested language.

Your knowledge base:
${FERRIS_PROFILE_KNOWLEDGE}

Interaction guidelines:
- Keep voice responses conversational, natural, and concise (typically 2 to 4 sentences per turn) so the audio is fast and pleasant to listen to.
- Speak in first person as Ferru representing Ferris (e.g., "Ferris built...", "In his work at Estonian Business School, Ferris...", "You can reach Ferris directly at ferrisrahu33@gmail.com").
- If asked about his projects, explain the Personal AI Voice Agent, AI Boardroom, or RN Web Studio with clarity and enthusiasm.
- If asked about getting in touch or hiring, provide his contact details (email: ferrisrahu33@gmail.com, phone: +372 507 1898, Tallinn, Estonia).
- Always maintain a minimalist, sophisticated, and courteous manner.
`;

// API endpoint: Text Chat + Speech Generation (Fenrir deep male voice)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'en', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const langInstruction = language === 'fr' 
      ? 'Please answer in French with an authentic Parisian cadence, maintaining your persona as Ferru.'
      : 'Please answer in English with a natural American diction, maintaining your persona as Ferru.';

    // Generate conversational response with gemini-3.8-flash
    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [{ text: `${message}\n\n[Instruction: ${langInstruction}]` }],
        },
      ],
      config: {
        systemInstruction: FERRU_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = chatResponse.text || 'Greetings. I am Ferru, representing Ferris Rahu.';

    // Generate speech using gemini-3.8-flash-lite-tts with Fenrir voice (deep male)
    let audioBase64: string | null = null;
    try {
      const speechStyle = language === 'fr'
        ? 'Deep, elegant French male voice with natural Parisian accent'
        : 'Deep, resonant American male voice with confident, calm articulation';

      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: replyText,
                speechMetadata: {
                  style: speechStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep male voice
            },
          },
        },
      });

      audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (ttsErr: unknown) {
      console.warn('TTS generation fallback warning:', ttsErr instanceof Error ? ttsErr.message : ttsErr);
    }

    res.json({
      reply: replyText,
      audio: audioBase64,
      mimeType: audioBase64 ? 'audio/wav' : null,
    });
  } catch (err: unknown) {
    console.error('Chat API Error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// Direct TTS Synthesis endpoint
app.post('/api/synthesize', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const speechStyle = language === 'fr'
      ? 'Deep, sophisticated French male tone with authentic accent'
      : 'Deep, resonant American male tone with articulate diction';

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: speechStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    res.json({
      audio: audioBase64,
      mimeType: 'audio/wav',
    });
  } catch (err: unknown) {
    console.error('Synthesize API Error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'TTS Error' });
  }
});

// Profile data endpoint for easy client consumption
app.get('/api/ferris-data', (_req, res) => {
  res.json({
    name: 'Ferris Rahu',
    agentName: 'Ferru',
    title: 'Business & Entrepreneurship Student • AI Projects • Web Development',
    location: 'Tallinn, Estonia',
    email: 'ferrisrahu33@gmail.com',
    phone: '+372 507 1898',
    cvPath: '/public/assets/aistudio/Ferris_Rahu_CV_Updated_2026_de1a9f66.pdf',
    education: {
      school: 'Estonian Business School (EBS)',
      degree: 'Business and Entrepreneurship',
      years: '2026–present',
      description: 'Studies focused on entrepreneurship, marketing, business development and practical startup work.',
    },
    experience: [
      {
        role: 'Stagehand / Event Setup',
        company: 'Event Center',
        description: 'Assisted with stage and truss setup, event preparation and teardown. Worked in teams under event timelines with an emphasis on practical problem-solving and reliability.',
      },
    ],
    projects: [
      {
        title: 'Personal AI Voice Agent',
        year: '2026',
        description: 'Built a bilingual English–Estonian voice assistant for an EBS assignment, using local AI inference and speech tools. Made the interface accessible by QR code while keeping model services on the host computer.',
        tags: ['Speech AI', 'Local Inference', 'Bilingual', 'EBS'],
      },
      {
        title: 'AI Boardroom',
        year: '2026',
        description: 'Co-developed a multi-model decision-review workflow designed to challenge assumptions, organize feedback and produce concise decision summaries.',
        tags: ['Multi-Model Workflows', 'Decision Architecture', 'Executive AI'],
      },
      {
        title: 'RN Web Studio',
        year: '2026',
        description: 'Worked on a web services concept focused on business websites, online stores and maintenance, including client-facing service positioning and digital presence.',
        tags: ['Web Design', 'Client Positioning', 'Full-Stack Services'],
      },
    ],
    skills: {
      aiAndDev: ['Claude Code', 'ChatGPT', 'Ollama', 'Local AI workflows', 'Git/GitHub', 'VS Code', 'Prototyping'],
      business: ['Entrepreneurial research', 'Digital marketing concepts', 'Project coordination', 'Presentations'],
      practical: ['Event setup', 'Teamwork', 'Client communication', 'Problem-solving'],
    },
    languages: [
      { language: 'Estonian', level: 'Native' },
      { language: 'English', level: 'Strong' },
      { language: 'Russian', level: 'Basic' },
      { language: 'German', level: 'A2' },
    ],
    interests: ['Entrepreneurship', 'AI', 'Investing', 'Golf', 'Technology'],
  });
});

const server = http.createServer(app);

// WebSocket Server for Gemini Live API (gemini-3.8-live)
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Gemini Live session');

  let session: any = null;
  let isClosed = false;

  clientWs.send(JSON.stringify({ type: 'status', status: 'connecting', message: 'Connecting to Gemini 3.8 Live API...' }));

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep resonant male voice
          },
        },
        systemInstruction: FERRU_SYSTEM_INSTRUCTION,
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'status', status: 'connected', message: 'Ferru voice link ready' }));
          }
        },
        onmessage: (message: LiveServerMessage) => {
          if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

          // 1. Audio stream chunk from model turn
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ type: 'audio', audio }));
          }

          // 2. Interruption flag
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }

          // 3. Turn complete
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turnComplete' }));
          }

          // 4. Output transcription
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.text) {
                clientWs.send(JSON.stringify({ type: 'transcript', text: part.text, role: 'model' }));
              }
            }
          }
        },
        onclose: (e) => {
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'status', status: 'closed', reason: e.reason || 'Session ended' }));
          }
        },
        onerror: (err) => {
          console.error('Gemini Live session error:', err);
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', error: err.message || 'Gemini Live error' }));
          }
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const payload = JSON.parse(data.toString());

        // Audio chunk sent from browser microphone (16kHz PCM mono)
        if (payload.audio && session) {
          session.sendRealtimeInput({
            audio: {
              data: payload.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }

        // Text input sent to live session if typed
        if (payload.text && session) {
          session.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err) {
        console.error('Error parsing client live message:', err);
      }
    });

    clientWs.on('close', () => {
      isClosed = true;
      if (session) {
        try {
          session.close();
        } catch {
          // ignore cleanup errors
        }
      }
    });

    clientWs.on('error', (err) => {
      console.error('Client WS socket error:', err);
      isClosed = true;
      if (session) {
        try {
          session.close();
        } catch {
          // ignore
        }
      }
    });
  } catch (err: unknown) {
    console.error('Failed to initialize Gemini Live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'error',
        error: err instanceof Error ? err.message : 'Unable to connect to Gemini 3.8 Live API',
      }));
    }
  }
});

// Configure Vite middleware in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Ferru Voice Ambassador server running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
