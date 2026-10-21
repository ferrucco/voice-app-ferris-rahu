# Ferru Voice App – Vercel deployment

The original AI Studio app used Express / `server.ts` and a persistent `/live` WebSocket. Vercel previously deployed only the Vite frontend, so that connection did not work.

The browser now uses a short-lived single-use Gemini Live credential from the Vercel Function `POST /api/live/token`. The long-lived key never goes in browser code. Text chat and TTS run in `/api/chat` and `/api/synthesize`; `/api/health` shows whether the backend is configured, not the secret itself.

**Required private setup:** Vercel > project `voice-app-ferris-rahu` > Environment Variables > add a Secret variable `GEMINI_API_KEY` for Production and Preview; then redeploy production. Never post the key in a chat or commit it to GitHub.

The model IDs are inherited from the current AI Studio export (Gemini 3.8 Flash, Gemini 3.8 Flash Lite TTS, Gemini 3.8 Live). Confirm the account has access; a successful build is not a voice runtime test.

Text-to-speech now wraps raw 24 kHz 16-bit PCM into a WAV header when necessary. Browser microphone audio streams as PCM to Gemini Live using the Google GenAI client.

**Classroom prototype security:** Public access can consume API quota. The token endpoint uses best-effort in-memory IP throttling and origin checks, but not durable rate limits or user authentication. For a larger public launch, add robust authentication or verified rate limits plus API billing/quota controls.

The GitHub-deployed version offers English and French as originally generated. This is not identical to the earlier local Ollama-based English/Estonian prototype.

After key setup: test live English and French voice on desktop and mobile, ask a text question, verify TTS output, and inspect the browser console if needed.
