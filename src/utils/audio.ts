// Audio conversion and playback utilities for Gemini Live API and Gemini TTS

// Convert Float32Array from AudioContext to 16-bit PCM little-endian Base64
export function floatTo16BitPCMBase64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

// Convert Base64 16-bit PCM (24kHz from Gemini Live API) to Float32Array
export function base64PCMToFloat32Array(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

// Seamless gapless audio player class for 24kHz PCM streams
export class LiveAudioPlayer {
  private ctx: AudioContext | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  public isPlaying = false;
  private onPlaybackStateChange?: (playing: boolean) => void;

  constructor(onPlaybackStateChange?: (playing: boolean) => void) {
    this.onPlaybackStateChange = onPlaybackStateChange;
  }

  private initCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass({ sampleRate: 24000 });
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playChunk(base64Pcm: string) {
    try {
      const ctx = this.initCtx();
      const float32Data = base64PCMToFloat32Array(base64Pcm);
      const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.push(source);
      this.setPlaying(true);

      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
        if (this.activeSources.length === 0) {
          this.setPlaying(false);
        }
      };
    } catch (err) {
      console.error('LiveAudioPlayer playback error:', err);
    }
  }

  public stop() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // source may have ended
      }
    }
    this.activeSources = [];
    if (this.ctx) {
      this.nextStartTime = this.ctx.currentTime;
    }
    this.setPlaying(false);
  }

  private setPlaying(playing: boolean) {
    if (this.isPlaying !== playing) {
      this.isPlaying = playing;
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(playing);
      }
    }
  }

  public close() {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Gemini TTS may return raw 24 kHz, mono, 16-bit PCM. Audio elements
// require a WAV container; a Blob with a WAV MIME type alone is not enough.
export function base64WavToUrl(base64: string, mimeType?: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  const type=(mimeType||'').toLowerCase();
  const looksLikeWav=bytes.length>=12 &&
    String.fromCharCode(...bytes.slice(0,4))==='RIFF' &&
    String.fromCharCode(...bytes.slice(8,12))==='WAVE';
  if(looksLikeWav || type.includes('audio/wav') || type.includes('audio/x-wav')){
    return URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));
  }
  const rate=Number(type.match(/rate=(\\d+)/)?.[1]||24000);
  const header=new ArrayBuffer(44);
  const view=new DataView(header);
  const label=(offset:number,str:string)=>{for(let i=0;i<str.length;i++)view.setUint8(offset+i,str.charCodeAt(i));};
  label(0,'RIFF');view.setUint32(4,36+bytes.length,true);label(8,'WAVE');
  label(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);
  view.setUint16(22,1,true);view.setUint32(24,rate,true);
  view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
  label(36,'data');view.setUint32(40,bytes.length,true);
  return URL.createObjectURL(new Blob([header,bytes],{type:'audio/wav'}));
}
