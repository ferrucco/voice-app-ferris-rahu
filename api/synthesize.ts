import { GoogleGenAI, Modality } from '@google/genai';
function allowed(req: any, res: any): boolean {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.status(405).json({error:'Method not allowed'});return false;}
  const origin=req.headers.origin;
  if(origin){try{const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0];if(new URL(String(origin)).host!==host)throw Error();}catch{res.status(403).json({error:'Origin mismatch'});return false;}}
  return true;
}

export default async function handler(req:any,res:any){
 if(!allowed(req,res))return;
 const key=process.env.GEMINI_API_KEY;
 if(!key)return res.status(503).json({error:'GEMINI_API_KEY missing on Vercel'});
 const text=req.body?.text;
 if(typeof text!=='string'||!text.trim()||text.length>1800)return res.status(400).json({error:'Text required (max 1800 characters)'});
 try{
  const ai=new GoogleGenAI({apiKey:key});
  const response=await ai.models.generateContent({model:'gemini-3.8-flash-lite-tts',contents:[{role:'user',parts:[{text}]}],config:{responseModalities:[Modality.AUDIO],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Fenrir'}}}}});
  const clip=response.candidates?.[0]?.content?.parts?.find((part:any)=>part.inlineData?.data)?.inlineData;
  if(!clip?.data)throw new Error('No audio');
  return res.status(200).json({audio:clip.data,mimeType:clip.mimeType||'audio/pcm;rate=24000'});
 }catch(e){console.error('Ferru synthesis failure:',e instanceof Error?e.message:'unknown');return res.status(502).json({error:'Speech is temporarily unavailable.'});}
}
