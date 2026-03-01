import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import Auth from './components/Auth';
import { generateMakigamiAnalysis, generateToBeProcess } from './services/geminiService';
import { MakigamiProcess } from './types';
import MakigamiVisualizer from './components/MakigamiVisualizer';
import MetricsDashboard from './components/MetricsDashboard';
import ChatAssistant from './components/ChatAssistant';
import KaizenList from './components/KaizenList';
import ProcessReview from './components/ProcessReview';
import ProcessDetailsTable from './components/ProcessDetailsTable';
import ComparisonView from './components/ComparisonView';
import { Sparkles, RotateCcw, Layout, FileText, Search, Split, ArrowLeft, BookOpen, LogOut } from 'lucide-react';

const DEFAULT_INPUT = `Customer Request Processing:
A customer sends an email request to the Sales Department. The Sales Admin typically reads this email after a delay of about 2 hours due to high volume. Once opened, the Admin spends 15 minutes validating if all necessary information is present. If information is missing, they email the customer back and wait about 1 day for a reply. If the info is complete, the request is forwarded to the Technical Team. The Technical Lead reviews the feasibility, which takes 30 minutes. If feasible, the Tech Lead spends 45 minutes creating a draft quote. This draft is sent to Finance for pricing approval. The Finance Manager approves the price in just 10 minutes, but the request usually sits in their inbox for 4 hours before being addressed. Finally, the Sales Admin converts the approved quote to PDF and sends it to the customer.`;

const PROCESS_EXAMPLES = [
  `Gestione Rimborsi Spese (Processo Amministrativo):
Il processo inizia quando un dipendente compila manualmente un file Excel per le spese e scansiona i propri scontrini, operazione che richiede circa 20 minuti. Fatto ciò, invia una email con gli allegati al proprio responsabile per l'approvazione. Il manager riceve l'email ma, a causa dei numerosi impegni, la lascia in attesa nella casella di posta per circa 4 ore lavorative. Quando finalmente la apre, dedica 10 minuti al controllo dei totali e appone una firma digitale. Se riscontra errori, rimanda tutto indietro al dipendente che deve correggere e rinviare (generando rilavorazione). Se invece è tutto corretto, inoltra la pratica all'ufficio HR. L'addetto HR deve stampare il modulo per l'archivio cartaceo (5 min) e successivamente trascrivere manualmente i dati nel sistema SAP (15 min). Infine, il sistema genera automaticamente l'ordine di bonifico, che viene processato dalla banca dopo 2 giorni lavorativi di attesa tecnica.`,

  `Gestione Ticket Assistenza IT (Processo Servizi):
Un utente aziendale segnala un guasto al PC aprendo un ticket sul portale web dedicato. Il sistema invia subito una notifica all'Helpdesk di primo livello, tuttavia l'operatore, essendo spesso occupato, legge la richiesta solo dopo circa un'ora di attesa. Una volta letta (5 min), tenta di risolvere il problema collegandosi da remoto per circa 15 minuti. Se il problema persiste, scala il ticket al tecnico hardware di secondo livello. Qui il ticket entra in una coda di lavoro e rimane fermo per circa un giorno intero lavorativo. Quando il tecnico prende in carico la richiesta, si reca fisicamente alla scrivania dell'utente (20 min di spostamento), sostituisce il componente guasto lavorando per 45 minuti e riconsegna il PC. Infine, l'utente verifica che tutto funzioni e chiude il ticket in 5 minuti.`,

  `Approvazione Credito Mutuo (Processo Bancario Complesso):
Il cliente avvia la richiesta di mutuo direttamente dall'app mobile. In tempo reale (circa 1 minuto), il sistema effettua un pre-screening automatico consultando le banche dati creditizie (CRIF). Se il semaforo è verde, la pratica viene assegnata a un istruttore umano. L'istruttore dedica 30 minuti all'analisi delle buste paga e della documentazione anagrafica. A questo punto è necessaria una perizia sull'immobile: l'istruttore invia la richiesta a un perito esterno e il processo si blocca in attesa per circa 3 giorni lavorativi. Ricevuta la perizia via PEC in formato PDF, l'istruttore deve inserire manualmente i dati di valutazione nel sistema bancario, impiegando 15 minuti. La pratica completa viene quindi inviata al Capo Area per la delibera finale: il manager impiega 10 minuti per la firma, ma la pratica rimane sulla sua scrivania virtuale per circa 4 ore prima di essere lavorata. Solo allora la banca emette l'offerta vincolante per il cliente.`,
  
  `Onboarding Nuovo Fornitore (Manufacturing):
L'ufficio acquisti individua un potenziale nuovo fornitore e gli invia via email il modulo di qualifica standard. Il processo si ferma in attesa della risposta del fornitore, che arriva mediamente dopo 2 giorni con i certificati ISO allegati. Il Buyer analizza i documenti ricevuti per circa 20 minuti; spesso mancano delle firme o dei dati obbligatori, costringendo a un ciclo di email di chiarimento (rework). Una volta che il dossier è completo, il Buyer lo inoltra al Quality Manager per l'audit di qualifica. Il Quality Manager impiega 15 minuti per pianificare la visita. Il giorno dell'audit, il manager viaggia per 2 ore per raggiungere lo stabilimento e impiega 4 ore per l'ispezione fisica. Rientrato in sede, redige il report di audit su un documento Word (30 min) e lo salva in una cartella di rete. Infine, l'addetto dell'Ufficio Acquisti inserisce manualmente l'anagrafica del fornitore nel sistema ERP (10 min) per abilitare gli ordini.`
];

function App() {
const [session, setSession] = useState<Session | null>(null);

const [inputText, setInputText] = useState(DEFAULT_INPUT);
const [isGenerating, setIsGenerating] = useState(false);
const [isOptimizing, setIsOptimizing] = useState(false);
const [viewState, setViewState] = useState<'input' | 'review' | 'visualize' | 'compare'>('input');
const [processData, setProcessData] = useState<MakigamiProcess | null>(null);
const [toBeProcessData, setToBeProcessData] = useState<MakigamiProcess | null>(null);
const [error, setError] = useState<string | null>(null);

// Controllo sessione Supabase
useEffect(() => {
supabase.auth.getSession().then(({ data: { session } }) => {
setSession(session);
});

}, []);

const handleLogout = async () => {
await supabase.auth.signOut();
};

const handleGenerate = async () => {
if (!inputText.trim()) return;
setIsGenerating(true);
setError(null);
setProcessData(null);
setToBeProcessData(null);

};

const handleConfirmReview = (updatedData: MakigamiProcess) => {
setProcessData(updatedData);
setViewState('visualize');
};

const handleOptimize = async () => {
if (!processData) return;
if (toBeProcessData) {
setViewState('compare');
return;
}
setIsOptimizing(true);
try {
const optimizedData = await generateToBeProcess(processData);
setToBeProcessData(optimizedData);
setViewState('compare');
} catch (err) {
setError("Failed to generate optimization.");
} finally {
setIsOptimizing(false);
}
};

// Se l'utente non è loggato, mostra la schermata Auth
if (!session) {
return <Auth />;
}

// Se è loggato, mostra l'app
return (
<div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
<nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
<div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewState('input')}>
<div className="bg-indigo-600 p-2 rounded-lg">
<Layout className="w-5 h-5 text-white" />
</div>
<span className="font-bold text-xl text-slate-800">Makigami AI Generator</span>
</div>
<div className="flex items-center gap-4">
<span className="text-sm text-slate-500 font-medium hidden md:block">
{session.user.email}
</span>
<button
onClick={handleLogout}
className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
>
<LogOut className="w-4 h-4" /> Esci
</button>
</div>
</div>
</nav>

);
}

export default App;
