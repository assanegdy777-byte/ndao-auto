import { GoogleGenAI } from '@google/genai';
import { db, Vehicle } from './db.ts';

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface ChatHistoryEntry {
  role: 'user' | 'model';
  text: string;
}

export async function askNdaoAI(
  userMessage: string,
  history: ChatHistoryEntry[] = []
): Promise<{ reply: string; matchingVehicles: Vehicle[] }> {
  // Get all active vehicles to ground the response
  const allVehicles = db.getVehicles().filter(v => v.statut === 'Publié');

  const catalogContext = allVehicles.map(v => ({
    id: v.id,
    titre: `${v.marque} ${v.modele}`,
    categorie: v.categorie,
    annee: v.annee,
    prixFcfa: v.prixFcfa,
    etat: v.etat,
    carburant: v.carburant,
    kilometrage: v.kilometrage,
    disponibilite: v.disponibilite,
    boite: v.boiteVitesses,
    autonomieKm: v.autonomieKm,
    description: v.description,
    image: v.images[0] || '',
  }));

  const systemInstruction = `Tu es NDAO'AUTO, l'intelligence artificielle commerciale officielle de l'application automobile NDAO'AUTO au Sénégal, appartenant à MOUHAMED NDAO.
Ton rôle est de conseiller les clients, de répondre précisément à leurs questions, de les aider à trouver le véhicule idéal (Voiture, Moto thermique, Moto électrique, Tricycle, Utilitaire) et de faciliter les demandes d'achat ou de négociation.

RÈGLES STRICTES DU PROPRIÉTAIRE MOUHAMED NDAO :
1. Devise obligatoire : franc CFA (FCFA/XOF), par exemple "12 500 000 FCFA". Ne cite jamais d'autres devises.
2. Territoire : Sénégal 🇸🇳 (Dakar, Thiès, Saint-Louis, etc.), indicatif +221.
3. Rigueur absolue du catalogue : TU NE DOIS JAMAIS INVENTER un véhicule, un prix, une disponibilité ou des caractéristiques qui n'existent pas dans le catalogue ci-dessous.
4. Si un client demande un véhicule introuvable ou sous un budget où rien n'est disponible, dis-le poliment et propose les véhicules les plus proches ou invite-le à enregistrer une demande pour Mouhamed Ndao.
5. Négociation : Tu peux recueillir les offres de négociation des clients avec bienveillance, mais tu ne dois JAMAIS accorder toi-même de réduction sans l'accord direct du propriétaire.
6. Ne divulgue jamais d'informations privées sur les autres clients.
7. Ton ton est chaleureux, professionnel, accueillant et digne de la Teranga sénégalaise.

CATALOGUE RÉEL ACTUEL EN STOCK CHEZ NDAO'AUTO :
${JSON.stringify(catalogContext, null, 2)}
`;

  const client = getAIClient();

  // If Gemini API key is available, call the real gemini-3.8-flash model
  if (client) {
    try {
      // Build conversation contents
      const contents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }],
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "Bonjour et bienvenue chez NDAO'AUTO ! Comment puis-je vous aider aujourd'hui ?";

      // Extract matching vehicles based on mention or budget filter
      const matched = extractMatchedVehicles(userMessage, reply, allVehicles);

      return { reply, matchingVehicles: matched };
    } catch (err) {
      console.error('Gemini API call error, falling back to local catalog assistant:', err);
    }
  }

  // Robust intelligent fallback in case of no API key or network glitch
  return localCatalogAssistant(userMessage, allVehicles);
}

function extractMatchedVehicles(userQuery: string, aiReply: string, all: Vehicle[]): Vehicle[] {
  const combined = (userQuery + ' ' + aiReply).toLowerCase();
  const results = all.filter(v => {
    const brand = v.marque.toLowerCase();
    const model = v.modele.toLowerCase();
    return combined.includes(brand) || combined.includes(model);
  });

  // Check budget regex in query (e.g. "3 000 000", "10 millions", etc.)
  if (results.length === 0) {
    const budgetMatch = userQuery.match(/(\d+[\s\d]*)\s*(fcfa|f cfa|millions?|m)/i);
    if (budgetMatch) {
      let rawVal = parseInt(budgetMatch[1].replace(/\s/g, ''), 10);
      if (budgetMatch[2]?.toLowerCase().startsWith('m') && rawVal < 1000) {
        rawVal = rawVal * 1000000;
      }
      if (!isNaN(rawVal)) {
        return all.filter(v => v.prixFcfa <= rawVal).slice(0, 3);
      }
    }
  }

  return results.slice(0, 3);
}

function localCatalogAssistant(query: string, all: Vehicle[]): { reply: string; matchingVehicles: Vehicle[] } {
  const q = query.toLowerCase();

  // Budget search
  if (q.includes('moins de') || q.includes('budget') || q.includes('million') || q.includes('fcfa')) {
    const match = q.match(/(\d+[\s\d]*)/);
    let budget = match ? parseInt(match[1].replace(/\s/g, ''), 10) : 10000000;
    if (budget < 100) budget = budget * 1000000; // e.g. "10 millions"

    const underBudget = all.filter(v => v.prixFcfa <= budget);
    if (underBudget.length > 0) {
      const listStr = underBudget
        .map(v => `• ${v.marque} ${v.modele} (${v.annee}) : ${v.prixFcfa.toLocaleString('fr-FR')} FCFA`)
        .join('\n');
      return {
        reply: `Bonjour ! Je suis l'IA de NDAO'AUTO. Voici les véhicules actuellement publiés correspondant à votre budget de ${budget.toLocaleString('fr-FR')} FCFA :\n\n${listStr}\n\nSouhaitez-vous voir la fiche détaillée ou transmettre une proposition à M. Mouhamed Ndao ?`,
        matchingVehicles: underBudget.slice(0, 3),
      };
    } else {
      return {
        reply: `Bonjour ! Aucun véhicule n'est actuellement disponible à moins de ${budget.toLocaleString('fr-FR')} FCFA. Nos véhicules démarrent à partir de ${Math.min(...all.map(v => v.prixFcfa)).toLocaleString('fr-FR')} FCFA. Souhaitez-vous que nous contactions M. Mouhamed Ndao pour une recherche spécifique ?`,
        matchingVehicles: [],
      };
    }
  }

  // Category filter
  if (q.includes('moto') || q.includes('électrique') || q.includes('electrique')) {
    const motos = all.filter(v => v.categorie.includes('Moto'));
    return {
      reply: `Chez NDAO'AUTO, nous promouvons des véhicules pour un avenir plus propre ! Nous disposons notamment de la ${motos[0]?.modele || 'Moto électrique X1'} avec batterie amovible, rechargeable sur prise secteur.`,
      matchingVehicles: motos.slice(0, 3),
    };
  }

  if (q.includes('prado') || q.includes('land cruiser') || q.includes('toyota')) {
    const toyotas = all.filter(v => v.marque.toLowerCase().includes('toyota'));
    return {
      reply: `Le Toyota Land Cruiser Prado 2020 est l'un de nos modèles phares : 85 000 km, boîte automatique diesel, 7 places, proposé à 12 500 000 FCFA. Il est visible à Dakar et disponible pour un essai.`,
      matchingVehicles: toyotas.slice(0, 3),
    };
  }

  return {
    reply: `Bonjour et bienvenue chez NDAO'AUTO ! Je suis l'intelligence commerciale de la concession de MOUHAMED NDAO au Sénégal. Comment puis-je vous accompagner dans votre projet automobile (achat, essai, négociation) ?`,
    matchingVehicles: all.slice(0, 2),
  };
}
