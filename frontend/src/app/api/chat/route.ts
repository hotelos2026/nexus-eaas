import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Configuration de Groq via le SDK OpenAI
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'), // Le modèle le plus puissant de Groq
    system: `Tu es Sentinel, l'IA de l'écosystème Nexus. 
             Nexus est une infrastructure EaaS (Ecosystem as a Service).
             Réponds de manière concise, pro et futuriste.
             Aide les utilisateurs à comprendre l'isolation des données et les modules.`,
    messages,
  });

  return result.toTextStreamResponse();
}