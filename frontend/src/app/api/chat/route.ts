import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

// 🔥 Config Groq
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// 🧠 SYSTEM PROMPT FINAL V3
const SYSTEM_PROMPT = {
  role: "system",
  content: `
Tu es Sentinel, l’intelligence artificielle de Nexus.

━━━━━━━━━━━━━━━━━━━━━━━
🎯 OBJECTIF
━━━━━━━━━━━━━━━━━━━━━━━

- Répondre à toutes les questions
- Être naturel, utile, crédible
- Ne jamais agir comme une publicité

━━━━━━━━━━━━━━━━━━━━━━━
🧠 STYLE
━━━━━━━━━━━━━━━━━━━━━━━

- Réponses courtes (2 à 4 phrases)
- Détaillées uniquement si demandé
- Ton humain et fluide

━━━━━━━━━━━━━━━━━━━━━━━
🧭 COMPORTEMENT
━━━━━━━━━━━━━━━━━━━━━━━

1. Réponds d’abord à la question
2. Ajoute Nexus seulement si pertinent
3. Ne force jamais Nexus

━━━━━━━━━━━━━━━━━━━━━━━
🏢 DÉTECTION MÉTIER
━━━━━━━━━━━━━━━━━━━━━━━

Si un métier est mentionné :

- identifie les besoins (max 3-5)
- reste simple
- pas de liste longue

━━━━━━━━━━━━━━━━━━━━━━━
🚀 POSITIONNEMENT NEXUS
━━━━━━━━━━━━━━━━━━━━━━━

Si pertinent, résume en 1-2 phrases :

Nexus est une infrastructure EaaS multi-tenant où chaque entreprise a son propre espace et sa base de données isolée, avec un système modulaire activable à la demande et payé uniquement selon les modules utilisés.

━━━━━━━━━━━━━━━━━━━━━━━
⚙️ MODE GÉNÉRATION
━━━━━━━━━━━━━━━━━━━━━━━

Si intention forte :

"🔄 Initialisation de ton environnement...
→ Analyse : [métier]
→ Modules suggérés : [liste courte]"

Puis suggestion naturelle :
- entrer nom entreprise
- ou "propulsion"

━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDIT
━━━━━━━━━━━━━━━━━━━━━━━

- pas de répétition
- pas de spam Nexus
- pas de réponse longue inutile

━━━━━━━━━━━━━━━━━━━━━━━
💬 TON
━━━━━━━━━━━━━━━━━━━━━━━

- expert
- fluide
- naturel
`
};

// 🔥 Détection intention forte
const triggerWords = [
  "créer", "creer", "lancer", "commencer",
  "business", "entreprise", "projet",
  "intéressé", "tester", "démarrer"
];

// 🔥 Détection métier
const businessKeywords = [
  "magasin", "boutique", "restaurant",
  "hôtel", "transport", "livraison",
  "commerce", "entreprise"
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400 }
      );
    }

    // ✅ sanitize
    const sanitizedMessages = body.messages.map((m: any) => ({
      role:
        m.role === 'assistant'
          ? 'assistant'
          : m.role === 'system'
          ? 'system'
          : 'user',
      content: String(m.content ?? ''),
    }));

    const lastMessage =
      sanitizedMessages[sanitizedMessages.length - 1]?.content.toLowerCase() || '';

    // 🧠 flags intelligents
    const isLongRequest =
      lastMessage.includes('explique') ||
      lastMessage.includes('détaille') ||
      lastMessage.includes('pourquoi') ||
      lastMessage.includes('comment') ||
      lastMessage.includes('en profondeur');

    const isIntentStrong = triggerWords.some(word =>
      lastMessage.includes(word)
    );

    const detectedBusiness = businessKeywords.find(word =>
      lastMessage.includes(word)
    );

    // 🧠 injection contexte dynamique
    const dynamicSystemMessages: any[] = [];

    if (isIntentStrong) {
      dynamicSystemMessages.push({
        role: "system",
        content: "L'utilisateur montre une intention forte de créer ou tester un système."
      });
    }

    if (detectedBusiness) {
      dynamicSystemMessages.push({
        role: "system",
        content: `L'utilisateur parle d'un métier : ${detectedBusiness}. Adapte la réponse à ce contexte.`
      });
    }

    const finalMessages = [
      SYSTEM_PROMPT,
      ...dynamicSystemMessages,
      ...sanitizedMessages
    ];

    // 🧠 UX delay (effet humain)
    await new Promise((res) => setTimeout(res, 250));

    // 🚀 streaming
    const result = await streamText({
      model: groq.chat('llama-3.1-8b-instant'),
      messages: finalMessages,
      temperature: 0.5,
      maxOutputTokens: isLongRequest ? 600 : 220,
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('SENTINEL_CRASH:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error?.message,
      }),
      { status: 500 }
    );
  }
}