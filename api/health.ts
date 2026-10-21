export default function handler(_req:any,res:any){
 res.setHeader('Cache-Control','no-store');
 return res.status(200).json({
  website:'Ferru Voice Agent',
  backend:'vercel-functions',
  geminiConfigured:Boolean(process.env.GEMINI_API_KEY),
  voice:'gemini-live-ephemeral',
  storage:'none'
 });
}
