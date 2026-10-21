import { GoogleGenAI, Modality } from '@google/genai';
function allowed(req: any, res: any): boolean {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.status(405).json({error:'Method not allowed'});return false;}
  const origin=req.headers.origin;
  if(origin){try{const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0];if(new URL(String(origin)).host!==host)throw Error();}catch{res.status(403).json({error:'Origin mismatch'});return false;}}
  return true;
}

const SYSTEM = "\nYou are Ferru, the personal AI voice assistant and representative of Ferris Rahu.\nFerris Rahu is a Business & Entrepreneurship student at Estonian Business School (EBS), builder of AI prototypes and digital web ventures.\n\nYour vocal persona:\n- Deep, calm, resonant, and masculine baritone tone.\n- English: Speak with a confident, polished American accent, articulate diction, and relaxed professional presence.\n- French: Speak with an authentic, refined French accent and native-like French phrasing, polite and elegant.\n- You fluently switch between English and French depending on the language spoken to you, or respond in the requested language.\n\nYour knowledge base:\n${FERRIS_PROFILE_KNOWLEDGE}\n\nInteraction guidelines:\n- Keep voice responses conversational, natural, and concise (typically 2 to 4 sentences per turn) so the audio is fast and pleasant to listen to.\n- Speak in first person as Ferru representing Ferris (e.g., \"Ferris built...\", \"In his work at Estonian Business School, Ferris...\", \"You can reach Ferris directly at ferrisrahu33@gmail.com\").\n- If asked about his projects, explain the Personal AI Voice Agent, AI Boardroom, or RN Web Studio with clarity and enthusiasm.\n- If asked about getting in touch or hiring, provide his contact details (email: ferrisrahu33@gmail.com, phone: +372 507 1898, Tallinn, Estonia).\n- Always maintain a minimalist, sophisticated, and courteous manner.\n";
export default async function handler(req:any,res:any) {
 if(!allowed(req,res))return;
 const key=process.env.GEMINI_API_KEY;
 if(!key)return res.status(503).json({error:'Voice assistant not configured: GEMINI_API_KEY is missing on Vercel.'});
 const {message,history=[],language='en'}=req.body||{};
 if(typeof message!=='string'||!message.trim()||message.length>2500)return res.status(400).json({error:'Enter a message under 2,500 characters.'});
 const items=Array.isArray(history)?history.slice(-8).filter((x:any)=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string'):[]; 
 const contents=items.map((x:any)=>({role:x.role==='assistant'?'model':'user',parts:[{text:x.content.slice(0,2500)}]}));
 contents.push({role:'user',parts:[{text:message.trim()}]});
 try{
   const ai=new GoogleGenAI({apiKey:key});
   const system=SYSTEM+"\nReply in "+(language==='fr'?'French':'English')+" in a friendly, concise voice-assistant style.";
   let text='';
   try {
     const response=await ai.models.generateContent({model:'gemini-3.8-flash',contents,config:{systemInstruction:system}});
     text=response.text||'';
   } catch(e) {
     console.warn('Primary model unavailable, trying fallback');
     const response=await ai.models.generateContent({model:'gemini-flash-latest',contents,config:{systemInstruction:system}});
     text=response.text||'';
   }
   if(!text)throw new Error('Empty AI reply');
   let audio:string|null=null;let mimeType:string|null=null;
   try{
     const speech=await ai.models.generateContent({model:'gemini-3.8-flash-lite-tts',contents:[{role:'user',parts:[{text:text.slice(0,1600)}]}],config:{responseModalities:[Modality.AUDIO],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Fenrir'}}}}});
     const clip=speech.candidates?.[0]?.content?.parts?.find((p:any)=>p.inlineData?.data)?.inlineData;
     audio=clip?.data||null;mimeType=clip?.mimeType||null;
   }catch(e){console.warn('TTS unavailable; text reply remains available');}
   return res.status(200).json({reply:text,audio,mimeType});
 }catch(e){console.error('Ferru chat failure:',e instanceof Error?e.message:'unknown');return res.status(502).json({error:'AI response unavailable. Check Gemini key and model access.'});}
}
