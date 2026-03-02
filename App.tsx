
import React, { useState, useEffect } from 'react';
import { generateMakigamiAnalysis, generateToBeProcess } from './services/geminiService';
import { MakigamiProcess } from './types';
import MakigamiVisualizer from './components/MakigamiVisualizer';
import MetricsDashboard from './components/MetricsDashboard';
import ChatAssistant from './components/ChatAssistant';
import KaizenList from './components/KaizenList';
import LandingPage from './components/LandingPage';
import ProcessReview from './components/ProcessReview';
import ProcessDetailsTable from './components/ProcessDetailsTable';
import ComparisonView from './components/ComparisonView';
import { supabase } from './supabase';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Auth from './components/Auth';
import { Auth } from './Auth';
import { Session } from '@supabase/supabase-js';
import ProcessHistory from './components/ProcessHistory';
import { SpeedInsights } from '@vercel/speed-insights/react';

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
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [inputText, setInputText] = useState(DEFAULT_INPUT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  // Stages: 'input' -> 'review' -> 'visualize' -> 'compare'
  const [viewState, setViewState] = useState<'input' | 'review' | 'visualize' | 'compare'>('input');
  
  const [processData, setProcessData] = useState<MakigamiProcess | null>(null);
  const [toBeProcessData, setToBeProcessData] = useState<MakigamiProcess | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setProcessData(null);
    setToBeProcessData(null); // Reset optimization on new generation

    try {
      const data = await generateMakigamiAnalysis(inputText);
      setProcessData(data);
      setViewState('review'); 
    } catch (err) {
      setError("Failed to generate process map. Please check your API key and try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmReview = (updatedData: MakigamiProcess) => {
    setProcessData(updatedData);
    setViewState('visualize');
  };

  const handleCancelReview = () => {
    setViewState('input');
  };

  const handleOptimize = async () => {
    if (!processData) return;
    
    if (toBeProcessData) {
      // Data already exists, just switch view
      setViewState('compare');
      return;
    }

    setIsOptimizing(true);
    try {
      const optimizedData = await generateToBeProcess(processData);
      setToBeProcessData(optimizedData);
      setViewState('compare');
    } catch (err) {
      setError("Failed to generate optimization. Please try again.");
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleLoadExample = () => {
    const randomExample = PROCESS_EXAMPLES[Math.floor(Math.random() * PROCESS_EXAMPLES.length)];
    setInputText(randomExample);
  };

 const handleSave = async () => {
    if (!processData || !session?.user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const { error } = await supabase
        .from('saved_processes') // <- NOME TABELLA CORRETTO
        .insert([
          { 
            user_id: session.user.id,
            process_name: processData.meta_analysis.process_name, // <- NOME COLONNA CORRETTO
            process_data: processData // <- NOME COLONNA CORRETTO
          }
        ]);

      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving process:', err);
      setError('Failed to save process: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };
 

  const handleLoadFromHistory = (data: MakigamiProcess) => {
    setProcessData(data);
    setToBeProcessData(null);
    setViewState('visualize');
    setShowHistory(false);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  
  if (!session) {
return <Auth />;
}
  
  /*if (!session) {
if (showLogin) {
return (
<div className="min-h-screen bg-slate-50 flex flex-col">
<div className="p-4">
<button
onClick={() => setShowLogin(false)}
className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors"
>
<ArrowLeft className="w-4 h-4" /> Torna alla Home
</button>
</div>
<Auth />
</div>
);
}
return <LandingPage onLoginClick={() => setShowLogin(true)} />;
}*/

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewState('input')}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">Makigami AI Generator</span>
          </div>
          <div className="flex items-center gap-4">
            {viewState === 'compare' && (
               <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-600">
                  <Split className="w-4 h-4" /> Comparison Mode
               </div>
            )}
            
            <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all text-sm font-bold border border-transparent hover:border-slate-200"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">I Miei Processi</span>
              </button>

              <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{session.user.email}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Standard User</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* INPUT STAGE */}
        {viewState === 'input' && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center flex-wrap gap-4">
               <div className="flex items-center gap-4">
                 <h2 className="text-lg font-semibold flex items-center gap-2">
                   <FileText className="w-5 h-5 text-indigo-500" />
                   Process Description
                 </h2>
               </div>
               
               <button 
                 onClick={() => setInputText('')}
                 className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
               >
                 <RotateCcw className="w-3 h-3" /> Clear
               </button>
            </div>
            <div className="p-6">
              <textarea
                className="w-full h-48 p-5 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner focus:bg-white focus:border-indigo-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 resize-none text-slate-700 font-mono text-sm leading-relaxed placeholder:text-slate-400"
                placeholder="Describe your process here naturally... Type or paste your process description."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              
              <div className="mt-4 flex justify-between items-center flex-wrap gap-4">
                <button
                  onClick={handleLoadExample}
                  disabled={isGenerating}
                  className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                  title="Load a random process scenario"
                >
                  <BookOpen className="w-4 h-4" />
                  Load Example Process
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputText}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
                    ${isGenerating || !inputText 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 active:scale-95'}
                  `}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" /> Analyzing Process...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" /> Analyze & Review
                    </>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                  {error}
                </div>
              )}
            </div>
          </section>
        )}

        {/* REVIEW STAGE */}
        {viewState === 'review' && processData && (
           <div className="max-w-7xl mx-auto">
             <ProcessReview 
                data={processData} 
                onConfirm={handleConfirmReview} 
                onCancel={handleCancelReview} 
              />
           </div>
        )}

        {/* VISUALIZATION & COMPARISON STAGES */}
        {(viewState === 'visualize' || viewState === 'compare') && processData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Top Controls */}
            <div className="flex justify-between items-center mb-6">
               <button 
                  onClick={() => viewState === 'compare' ? setViewState('visualize') : setViewState('review')}
                  className="text-sm text-slate-500 hover:text-indigo-600 underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> 
                  {viewState === 'compare' ? 'Back to Analysis' : 'Back to Review Parameters'}
                </button>
               
               {viewState === 'visualize' && (
                 <div className="flex items-center gap-3">
                   <button
                     onClick={handleSave}
                     disabled={isSaving}
                     className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold shadow-sm transition-all active:scale-95 border ${
                       saveSuccess 
                       ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                       : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                     }`}
                   >
                     {isSaving ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                     ) : saveSuccess ? (
                       <CheckCircle2 className="w-4 h-4" />
                     ) : (
                       <Save className="w-4 h-4 text-indigo-600" />
                     )}
                     {saveSuccess ? 'Salvato!' : 'Salva'}
                   </button>

                   <button
                     onClick={handleOptimize}
                     disabled={isOptimizing}
                     className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-lg font-bold shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                   >
                     {isOptimizing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Split className="w-4 h-4" />}
                     {isOptimizing ? 'Generating Future State...' : 'Generate "To-Be" Optimization'}
                   </button>
                 </div>
               )}
            </div>

            {viewState === 'visualize' ? (
              <div className="max-w-7xl mx-auto">

                {/* Header Stats */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {processData.meta_analysis.process_name}
                  </h2>
                  <p className="text-slate-600 max-w-3xl line-clamp-2">
                    {processData.meta_analysis.health_check.main_issue}
                  </p>
                </div>

                {/* Metrics */}
                <MetricsDashboard data={processData} />

                {/* Visualizer */}
                <MakigamiVisualizer data={processData} />

                {/* Interactive Kaizen List */}
                <KaizenList 
                  opportunities={processData.kaizen_recommendations} 
                  processSummary={processData.meta_analysis.health_check.main_issue}
                />

                {/* Detailed Table */}
                <ProcessDetailsTable data={processData} />
              </div>
            ) : (
              // COMPARISON VIEW
              <div className="w-full">
                {toBeProcessData && <ComparisonView asIs={processData} toBe={toBeProcessData} />}
              </div>
            )}
            
            {/* Chatbot attached to this context */}
            <ChatAssistant context={JSON.stringify(viewState === 'compare' ? {asIs: processData, toBe: toBeProcessData} : processData)} />
          </div>
        )}
      </main>

      {showHistory && (
        <ProcessHistory 
          onLoad={handleLoadFromHistory} 
          onClose={() => setShowHistory(false)} 
        />
      )}
      <SpeedInsights />
    </div>
  );
}

export default App;
