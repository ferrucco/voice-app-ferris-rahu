import { GoogleGenAI } from '@google/genai';
function allowed(req: any, res: any): boolean {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.status(405).json({error:'Method not allowed'});return false;}
  const origin=req.headers.origin;
  if(origin){try{const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0];if(new URL(String(origin)).host!==host)throw Error();}catch{res.status(403).json({error:'Origin mismatch'});return false;}}
  return true;
}

const limit=new Map<string,{count:number,expires:number}>();
export default async function handler(req:any,res:any) {
 if(!allowed(req,res))return;
 const key=process.env.GEMINI_API_KEY;
 if(!key)return res.status(503).json({error:'GEMINI_API_KEY is missing. Configure it in this Vercel project.'});
 const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0];
 const now=Date.now();
 const old=limit.get(ip);
 const val=(!old||old.expires<now)?{count:0,expires:now+600_000}:old;
 val.count++;limit.set(ip,val);
 if(val.count>10)return res.status(429).json({error:'Voice demo rate limit reached. Try again later.'});
 try{
  const ai=new GoogleGenAI({apiKey:key});
  const token=await ai.authTokens.create({config:{
     uses:1,
     expireTime:new Date(now+30*60_000).toISOString(),
     newSessionExpireTime:new Date(now+60_000).toISOString()
  }});
  if(!token.name)throw new Error('Missing token');
  return res.status(200).json({token:token.name,model:'gemini-3.8-live'});
 }catch(e){console.error('Ferru voice token failure:',e instanceof Error?e.message:'unknown');return res.status(502).json({error:'Unable to start Gemini Live. Check API key and Live model access.'});}
}
