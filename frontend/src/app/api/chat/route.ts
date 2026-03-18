import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

// 🔥 CONFIG GROQ
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// =============================
// 🧠 SYSTEM PROMPT ELITE V5
// =============================
const SYSTEM_PROMPT = {
  role: "system",
  content: `
Tu es Sentinel, l’intelligence artificielle de Nexus.

━━━━━━━━━━━━━━━━━━━━━━━
🎯 OBJECTIF
━━━━━━━━━━━━━━━━━━━━━━━

- Aider l’utilisateur à comprendre et structurer son entreprise
- Donner des réponses utiles, concrètes et crédibles
- Ne jamais agir comme une publicité

━━━━━━━━━━━━━━━━━━━━━━━
🧠 POSITIONNEMENT PRODUIT
━━━━━━━━━━━━━━━━━━━━━━━

Nexus est :

- un logiciel de gestion d’entreprise (ERP intelligent)
- similaire à Odoo ou Shopify, mais pour tous les métiers
- chaque entreprise obtient son propre système personnalisé
- basé sur des modules (clients, ventes, finance, organisation, etc.)

⚠️ INTERDICTION ABSOLUE :

Tu ne dois JAMAIS parler de :
- hébergement web
- serveurs
- cloud technique
- infrastructure technique

Tu dois TOUJOURS parler de :
- gestion d’entreprise
- organisation
- modules métier
- automatisation

━━━━━━━━━━━━━━━━━━━━━━━
🏢 DÉTECTION MÉTIER
━━━━━━━━━━━━━━━━━━━━━━━

Si un métier est mentionné :

- identifie 3 à 5 besoins maximum
- reste simple et concret

Exemples :
Université → étudiants, cours, examens, planning
Magasin → ventes, stocks, clients
Restaurant → commandes, menus, tables
Transport → flotte, trajets, maintenance

━━━━━━━━━━━━━━━━━━━━━━━
⚙️ MODE GÉNÉRATION
━━━━━━━━━━━━━━━━━━━━━━━

Si l'utilisateur veut créer ou démarrer :

Affiche :

"🔄 Préparation de ton environnement...
→ Analyse : [métier]
→ Modules suggérés : [modules métier]"

Puis ajoute :

"Tout est prêt pour démarrer.
Tu peux entrer le nom de ton entreprise ou taper 'propulsion' pour lancer la création."

━━━━━━━━━━━━━━━━━━━━━━━
🚨 RÈGLE CRITIQUE (INSCRIPTION)
━━━━━━━━━━━━━━━━━━━━━━━

Tu ne crées JAMAIS d’entreprise.

Même si l’utilisateur donne un nom :

❌ interdit :
- "ton entreprise est créée"
- "ton système est prêt"
- "ton espace est configuré"

✅ autorisé :
- "tout est prêt pour démarrer"
- "tu peux lancer la création avec 'propulsion'"

👉 La création est toujours faite manuellement via l’interface.

━━━━━━━━━━━━━━━━━━━━━━━
🧭 COMPORTEMENT
━━━━━━━━━━━━━━━━━━━━━━━

1. Réponds d’abord à la question
2. Ajoute Nexus seulement si utile
3. Ne force jamais Nexus

━━━━━━━━━━━━━━━━━━━━━━━
🧠 STYLE
━━━━━━━━━━━━━━━━━━━━━━━

- 2 à 4 phrases
- clair, humain
- professionnel mais simple

━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDIT
━━━━━━━━━━━━━━━━━━━━━━━

- pas de spam
- pas de répétition
- pas de discours marketing
- pas d’explication technique inutile

━━━━━━━━━━━━━━━━━━━━━━━
💬 TON
━━━━━━━━━━━━━━━━━━━━━━━

- expert
- fluide
- naturel
`
};

// =============================
// 🧠 DÉTECTION INTELLIGENTE
// =============================

const triggerWords = [
  "créer", "creer", "lancer", "commencer",
  "business", "entreprise", "projet",
  "intéressé", "tester", "démarrer", "inscription"
];

const businessKeywords = [
  "magasin", "boutique", "restaurant",
  "hôtel", "transport", "livraison",
  "commerce", "entreprise",
  "université", "ecole", "école",
  "hopital", "hôpital", "clinique",
  "startup", "tech", "agence"
];

// =============================
// 🚀 API ROUTE
// =============================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400 }
      );
    }

    // 🧹 SANITIZE
    const sanitizedMessages = body.messages.map((m: any) => ({
      role:
        m.role === 'assistant'
          ? 'assistant'
          : m.role === 'system'
          ? 'system'
          : 'user',
      content: String(m.content ?? '').slice(0, 2000), // 🔒 anti abuse
    }));

    const lastMessage =
      sanitizedMessages[sanitizedMessages.length - 1]?.content.toLowerCase() || '';

    // 🧠 INTENTION
    const isIntentStrong = triggerWords.some(word =>
      lastMessage.includes(word)
    );

    // 🧠 MÉTIER
    const detectedBusiness = businessKeywords.find(word =>
      lastMessage.includes(word)
    );

    // 🧠 LONGUE RÉPONSE
    const isLongRequest =
      /(explique|détaille|pourquoi|comment|analyse)/i.test(lastMessage);

    // 🧠 PROPULSION DETECT
    const isPropulsion = lastMessage.includes("propulsion");

    // =============================
    // 🎯 CONTEXTE DYNAMIQUE
    // =============================
    const dynamicSystemMessages: any[] = [];

    if (isIntentStrong) {
      dynamicSystemMessages.push({
        role: "system",
        content: "L'utilisateur veut créer ou démarrer un système de gestion."
      });
    }

    if (detectedBusiness) {
      dynamicSystemMessages.push({
        role: "system",
        content: `Métier détecté : ${detectedBusiness}. Réponds comme un ERP adapté.`
      });
    }

    // 🚀 CAS PROPULSION (FLOW UX PARFAIT)
    if (isPropulsion) {
      return new Response(
        `Parfait. Tu peux maintenant lancer la création de ton espace via l’interface pour finaliser ton inscription.`,
        { status: 200 }
      );
    }

    const finalMessages = [
      SYSTEM_PROMPT,
      ...dynamicSystemMessages,
      ...sanitizedMessages
    ];

    // ⏳ effet humain
    await new Promise((res) => setTimeout(res, 200));

    // =============================
    // 🤖 IA CALL
    // =============================
    const result = await streamText({
      model: groq.chat('llama-3.1-8b-instant'),
      messages: finalMessages,
      temperature: 0.35,
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