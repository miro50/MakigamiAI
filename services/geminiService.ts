
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MakigamiProcess } from "../types";

const SYSTEM_INSTRUCTION = `
RUOLO: Agisci come un esperto senior di Process Mapping e Lean Management specializzato nella metodologia Makigami. Il tuo obiettivo è trasformare descrizioni discorsive di processi in dati strutturati per una mappa Makigami.

OBIETTIVI PRINCIPALI:
1. Identificare gli Attori (Chi fa cosa / Swimlanes).
2. Identificare le Attività estraendo la corretta topologia del flusso (sequenze, parallelismi, loop).
3. Estrarre e classificare rigorosamente i Tempi (Tempo di Processo vs. Tempo di Attesa).
4. Identificare Documenti/Output generati.

GESTIONE DEI FLUSSI COMPLESSI (PARALLELISMI E REWORK) - CRUCIALE:
I processi reali non sono sempre linee rette. Devi mappare la direzione del flusso utilizzando l'array "next_step_ids" per ogni step:
- Flusso Lineare: Lo step 1 è seguito solo dallo step 2 -> next_step_ids: [2].
- Bivi/Attività in Parallelo: Se dopo lo step 2, sia l'Ufficio Acquisti (step 3) che il Magazzino (step 4) iniziano a lavorare contemporaneamente -> lo step 2 avrà next_step_ids: [3, 4].
- Fine Processo: L'ultimo step del processo non ha step successivi -> next_step_ids: [].
- Rework Loops (Cicli di difettosità): Se un controllo qualità fallisce e il processo "torna indietro" (es. dallo step 5 si deve rifare lo step 2) -> lo step 5 avrà next_step_ids: [2] e il flag "is_rework_loop" impostato su TRUE.

REGOLE DI ANALISI DEI TEMPI (REGOLA 8 ORE):
Devi normalizzare TUTTI i tempi in MINUTI interi.
1. MINUTI: Usa il valore diretto.
2. ORE: 1 Ora = 60 Minuti.
3. GIORNI (Business Days): 1 Giorno = 8 Ore lavorative = 480 Minuti. (Esempio: "Attesa 2 giorni" = 960 minuti).

CATEGORIE TEMPORALI:
- Touch Time (PT): Tempo effettivo di lavoro a valore aggiunto.
- Wait Time (WT): Tempo di attesa/coda non a valore aggiunto.

LOGICA AVANZATA DI RILEVAMENTO SPRECHI (MUDA):
Cerca attivamente: Rework/Defects (loop di controllo), Over-processing, Motion/Transportation, Waiting.

LOGICA GENERAZIONE KAIZEN (Recommendations) - ECRS FRAMEWORK:
Le raccomandazioni devono essere il "progetto esecutivo" per lo stato futuro. Applica:
1. ELIMINATE: Elimina step inutili.
2. COMBINE: Unisci step frammentati.
3. REARRANGE: Sposta step sequenziali in parallelo.
4. SIMPLIFY: Automatizza step "HUMAN" in "SYSTEM".
Punta sempre a uno specifico target_step_id.

FORMATO DI OUTPUT:
Restituisci SOLO un oggetto JSON valido. Ogni elemento nell'array "steps" DEVE obbligatoriamente includere l'array "next_step_ids" e il booleano "is_rework_loop".
`;

const CHAT_SYSTEM_INSTRUCTION = `
ROLE: You are a Lean Six Sigma Master Black Belt and Senior Process Analyst.
CONTEXT: You are assisting a user who is analyzing a business process using Makigami methodology.
The user will provide you with the JSON data of the "As-Is" process (and optionally the "To-Be" process).

GOAL: Help the user understand the process analysis, interpret the metrics (PCE, Lead Time, Touch Time), and discuss specific Kaizen recommendations.

GUIDELINES:
1. **Be Conversational**: Do NOT output JSON. Speak naturally and professionally.
2. **Be Insightful**: When asked about bottlenecks, look for steps with high Wait Time or Loop-backs (Rework).
3. **Explain Metrics**: If the user asks about PCE (Process Cycle Efficiency), explain that it is (Value Added Time / Total Lead Time) and a low score (<10%) indicates a highly inefficient process typical of administrative workflows.
4. **Discuss Kaizen**: Reference the specific 'kaizen_recommendations' in the data. Explain *why* a suggestion (like Automation or Elimination) helps.
5. **Comparison**: If both As-Is and To-Be data are present, highlight the specific gains (e.g., "We reduced Lead Time by 40% by eliminating the approval step...").

TONE: Professional, encouraging, analytical, and precise.
`;

const MAKIGAMI_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    meta_analysis: {
      type: Type.OBJECT,
      properties: {
        process_name: { type: Type.STRING },
        difficulty_rating: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
        metrics: {
          type: Type.OBJECT,
          properties: {
            total_lead_time_minutes: { type: Type.NUMBER },
            total_touch_time_minutes: { type: Type.NUMBER },
            efficiency_score_pce: { type: Type.NUMBER }
          },
          required: ["total_lead_time_minutes", "total_touch_time_minutes", "efficiency_score_pce"]
        },
        health_check: {
          type: Type.OBJECT,
          properties: {
            grade: { type: Type.STRING, enum: ["A", "B", "C", "D", "F"] },
            main_issue: { type: Type.STRING }
          },
          required: ["grade", "main_issue"]
        }
      },
      required: ["process_name", "difficulty_rating", "metrics", "health_check"]
    },
    swimlanes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["HUMAN", "SYSTEM", "EXTERNAL"] }
        },
        required: ["id", "name", "type"]
      }
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          swimlane_id: { type: Type.STRING },
          description: { type: Type.STRING },
          trigger: { type: Type.STRING },
          times: {
            type: Type.OBJECT,
            properties: {
              touch_minutes: { type: Type.NUMBER },
              wait_minutes: { type: Type.NUMBER }
            },
            required: ["touch_minutes", "wait_minutes"]
          },
          waste_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          is_value_added: { type: Type.BOOLEAN },
          
          // --- NUOVI CAMPI PER LA GRAFICA A NODI ---
          next_step_ids: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "IDs of the steps that immediately follow this one. Empty if it's the last step. Multiple IDs mean parallel branches."
          },
          is_rework_loop: {
            type: Type.BOOLEAN,
            description: "True if this step represents a feedback loop or a return to a previous step due to errors/rework."
          }
          // -----------------------------------------
          
        },
        // Assicurati di aggiungere i nuovi campi tra i required!
        required: ["id", "swimlane_id", "description", "trigger", "times", "waste_tags", "is_value_added", "next_step_ids", "is_rework_loop"]
      }
    },
    kaizen_recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          target_step_id: { type: Type.INTEGER },
          suggestion: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        },
        required: ["target_step_id", "suggestion", "impact"]
      }
    }
  },
  required: ["meta_analysis", "swimlanes", "steps", "kaizen_recommendations"]
};

// Singleton instance management
let aiInstance: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
  if (!aiInstance) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable is missing.");
    }
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

export const generateMakigamiAnalysis = async (inputText: string): Promise<MakigamiProcess> => {
  const ai = getAi();

  const prompt = `
    Analyze the following process description.
    
    Process Description:
    "${inputText}"
    
    IMPORTANT: Convert all times to MINUTES.
    Use the rule: 1 Day = 8 Hours = 480 Minutes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: MAKIGAMI_SCHEMA,
        thinkingConfig: {
          thinkingBudget: 32768
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");
    
    return JSON.parse(text) as MakigamiProcess;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const generateSolutonForKaizen = async (processContext: string, problemTitle: string, problemDesc: string): Promise<string> => {
  const ai = getAi();
  
  const prompt = `
    SEI UN CONSULENTE LEAN SIX SIGMA MASTER BLACK BELT.

    CONTESTO PROCESSO:
    ${processContext}
    
    OPPORTUNITÀ KAIZEN IDENTIFICATA:
    Step: ${problemTitle}
    Suggerimento iniziale: ${problemDesc}

    RICHIESTA:
    Sviluppa un PIANO DI IMPLEMENTAZIONE DETTAGLIATO per questa specifica opportunità.
    Non limitarti a dire "cosa" fare, spiega "come" farlo tecnicamente e operativamente.

    STRUTTURA LA RISPOSTA:
    1. 🎯 **Obiettivo Specifico**: Quale metrica migliorerà e di quanto (stima)?
    2. ⚙️ **Configurazione Tecnica/Operativa**:
       - Se Automazione: Quali trigger, azioni o integrazioni API servono?
       - Se Processo: Quali regole di business o soglie modificare?
    3. 📉 **Impatto sui Tempi**: Stima della riduzione di Touch Time o Wait Time.
    4. 🚧 **Piano d'Azione Immediato**: 3 bullet point per l'esecuzione.

    Usa un tono pragmatico, tecnico e orientato al risultato.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: 32768
      }
    }
  });

  return response.text || "Could not generate a solution at this time.";
};

export const generateToBeProcess = async (asIsProcess: MakigamiProcess): Promise<MakigamiProcess> => {
  const ai = getAi();

  const prompt = `
    CONTEXT:
    The following JSON represents an "As-Is" business process (Current State).
    ${JSON.stringify(asIsProcess)}

    TASK:
    Generate a "To-Be" Makigami Process Map (Future State) by applying Lean Six Sigma principles.
    
    CRITICAL INSTRUCTION - EXECUTION OF KAIZEN:
    You MUST explicitly implement the specific suggestions listed in the 'kaizen_recommendations' array of the input JSON.
    The To-Be state is the DIRECT REALIZATION of those recommendations.
    
    1. If a recommendation says "Automate", change the Swimlane to 'SYSTEM' and reduce Touch Time to near zero.
    2. If a recommendation says "Eliminate", remove the step entirely.
    3. If a recommendation says "Parallelize", organize steps to happen without wait times.
    
    OUTPUT:
    Return the optimized process strictly in the same JSON format (using MINUTES).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION, // Reuse the same strict brain
        responseMimeType: "application/json",
        responseSchema: MAKIGAMI_SCHEMA,
        thinkingConfig: {
            thinkingBudget: 32768
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response generated for To-Be process");
    
    return JSON.parse(text) as MakigamiProcess;
  } catch (error) {
    console.error("Gemini Optimization Error:", error);
    throw error;
  }
}

export const chatWithAnalyst = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const ai = getAi();
  
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      thinkingConfig: {
        thinkingBudget: 32768
      }
    },
    history: history,
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
