import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import Auth from './components/Auth';
import { generateMakigamiAnalysis, generateToBeProcess } from './services/geminiService';
import { saveProcessToDb, getUserProcesses, deleteProcess } from './services/dbService';
import { MakigamiProcess } from './types';
import MakigamiVisualizer from './components/MakigamiVisualizer';
import MetricsDashboard from './components/MetricsDashboard';
import ChatAssistant from './components/ChatAssistant';
import KaizenList from './components/KaizenList';
import ProcessReview from './components/ProcessReview';
import ProcessDetailsTable from './components/ProcessDetailsTable';
import ComparisonView from './components/ComparisonView';
import { Sparkles, RotateCcw, Layout, FileText, Search, Split, ArrowLeft, LogOut, Save, FolderOpen, Trash2, Clock } from 'lucide-react';

const DEFAULT_INPUT = "Customer Request Processing: A customer sends an email request to the Sales Department. The Sales Admin typically reads this email after a delay of about 2 hours due to high volume. Once opened, the Admin spends 15 minutes validating if all necessary information is present. If information is missing, they email the customer back and wait about 1 day for a reply. If the info is complete, the request is forwarded to the Technical Team. The Technical Lead reviews the feasibility, which takes 30 minutes. If feasible, the Tech Lead spends 45 minutes creating a draft quote. This draft is sent to Finance for pricing approval. The Finance Manager approves the price in just 10 minutes, but the request usually sits in their inbox for 4 hours before being addressed. Finally, the Sales Admin converts the approved quote to PDF and sends it to the customer.";

function App() {
const [session, setSession] = useState<Session | null>(null);
const [inputText, setInputText] = useState(DEFAULT_INPUT);
const [isGenerating, setIsGenerating] = useState(false);
const [isOptimizing, setIsOptimizing] = useState(false);
const [viewState, setViewState] = useState<'input' | 'review' | 'visualize' | 'compare'>('input');
const [processData, setProcessData] = useState<MakigamiProcess | null>(null);
const [toBeProcessData, setToBeProcessData] = useState<MakigamiProcess | null>(null);
const [error, setError] = useState<string | null>(null);

// Stati per il database
const [isSaving, setIsSaving] = useState(false);
const [showDashboard, setShowDashboard] = useState(false);
const [savedList, setSavedList] = useState<any[]>([]);
const [isLoadingList, setIsLoadingList] = useState(false);

useEffect(() => {
supabase.auth.getSession().then(({ data: { session } }) => {
setSession(session);
});

const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
});

return () => subscription.unsubscribe();
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

try {
  const data = await generateMakigamiAnalysis(inputText);
  setProcessData(data);
  setViewState('review'); 
} catch (err) {
  setError("Failed to generate process map. Please check your API key and try again.");
} finally {
  setIsGenerating(false);
}
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

// --- FUNZIONI DATABASE ---
const handleSaveProcess = async () => {
if (!session || !processData) return;
setIsSaving(true);
try {
await saveProcessToDb(session.user.id, processData.meta_analysis.process_name, processData);
alert("Processo salvato con successo!");
} catch (err) {
alert("Si è verificato un errore durante il salvataggio.");
} finally {
setIsSaving(false);
}
};

const openDashboard = async () => {
if (!session) return;
setShowDashboard(true);
setIsLoadingList(true);
try {
const data = await getUserProcesses(session.user.id);
setSavedList(data || []);
} catch (err) {
console.error(err);
} finally {
setIsLoadingList(false);
}
};

const handleDeleteSaved = async (id: number) => {
if (!window.confirm("Sei sicuro di voler eliminare questo processo?")) return;
try {
await deleteProcess(id);
setSavedList(savedList.filter(p => p.id !== id));
} catch (err) {
alert("Errore durante l'eliminazione");
}
};

const loadSavedProcess = (item: any) => {
setProcessData(item.process_data);
setToBeProcessData(null); // Resetta eventuale To-Be
setViewState('visualize');
setShowDashboard(false);
};
// -------------------------

if (!session) {
return <Auth />;
}

return (
<div className="min-h-screen bg-slate-50 text-slate-900 pb-20 relative">
<nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
<div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewState('input')}>
<div className="bg-indigo-600 p-2 rounded-lg">
<Layout className="w-5 h-5 text-white" />
</div>
<span className="font-bold text-xl text-slate-800">Makigami AI Generator</span>
</div>
<div className="flex items-center gap-4">
<button
onClick={openDashboard}
className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
>
<FolderOpen className="w-4 h-4" /> I Miei Processi
</button>
<span className="text-sm text-slate-500 font-medium hidden md:block border-l pl-4 border-slate-200">
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

  <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {viewState === 'input' && (
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 max-w-7xl mx-auto">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
           <h2 className="text-lg font-semibold flex items-center gap-2">
             <FileText className="w-5 h-5 text-indigo-500" /> Process Description
           </h2>
           <button onClick={() => setInputText('')} className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1">
             <RotateCcw className="w-3 h-3" /> Clear
           </button>
        </div>
        <div className="p-6">
          <textarea
            className="w-full h-48 p-5 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner transition-all duration-300 resize-none font-mono text-sm leading-relaxed"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? <><Sparkles className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Search className="w-5 h-5" /> Analyze & Review</>}
            </button>
          </div>
          {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        </div>
      </section>
    )}

    {viewState === 'review' && processData && (
       <div className="max-w-7xl mx-auto">
         <ProcessReview data={processData} onConfirm={handleConfirmReview} onCancel={() => setViewState('input')} />
       </div>
    )}

    {(viewState === 'visualize' || viewState === 'compare') && processData && (
      <div>
        <div className="flex justify-between items-center mb-6">
           <button onClick={() => viewState === 'compare' ? setViewState('visualize') : setViewState('review')} className="text-sm text-slate-500 hover:text-indigo-600 underline flex items-center gap-1">
             <ArrowLeft className="w-3 h-3" /> Back
           </button>
           
           {viewState === 'visualize' && (
             <div className="flex gap-3">
               <button 
                 onClick={handleSaveProcess} 
                 disabled={isSaving} 
                 className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium shadow-sm transition-all active:scale-95 disabled:opacity-70"
               >
                 <Save className="w-4 h-4 text-slate-500" />
                 {isSaving ? 'Salvataggio...' : 'Salva Processo'}
               </button>

               <button 
                 onClick={handleOptimize} 
                 disabled={isOptimizing} 
                 className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-lg font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70"
               >
                 {isOptimizing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Split className="w-4 h-4" />}
                 {isOptimizing ? 'Generating...' : 'Generate "To-Be"'}
               </button>
             </div>
           )}
        </div>

        {viewState === 'visualize' ? (
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{processData.meta_analysis.process_name}</h2>
              <p className="text-slate-600">{processData.meta_analysis.health_check.main_issue}</p>
            </div>
            <MetricsDashboard data={processData} />
            <MakigamiVisualizer data={processData} />
            <KaizenList opportunities={processData.kaizen_recommendations} processSummary={processData.meta_analysis.health_check.main_issue} />
            <ProcessDetailsTable data={processData} />
          </div>
        ) : (
          <div className="w-full">{toBeProcessData && <ComparisonView asIs={processData} toBe={toBeProcessData} />}</div>
        )}
        
        <ChatAssistant context={JSON.stringify(viewState === 'compare' ? {asIs: processData, toBe: toBeProcessData} : processData)} />
      </div>
    )}
  </main>

  {/* MODALE DEI PROCESSI SALVATI */}
  {showDashboard && (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-indigo-500" /> I Miei Processi Salvati
          </h2>
          <button onClick={() => setShowDashboard(false)} className="text-slate-400 hover:text-slate-600 font-medium">Chiudi</button>
        </div>
        <div className="p-6 overflow-y-auto bg-slate-50/50">
           {isLoadingList ? (
             <div className="text-center text-slate-500 py-12 flex flex-col items-center gap-3">
               <RotateCcw className="w-6 h-6 animate-spin text-indigo-500" /> Caricamento in corso...
             </div>
           ) : savedList.length === 0 ? (
             <div className="text-center text-slate-500 py-12 bg-white rounded-xl border border-slate-200 border-dashed">
               Non hai ancora salvato nessun processo. Generane uno e clicca su "Salva Processo"!
             </div>
           ) : (
             <div className="space-y-3">
               {savedList.map(item => (
                 <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all gap-4">
                   <div>
                     <h3 className="font-semibold text-slate-800 text-lg">{item.process_name}</h3>
                     <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                       <Clock className="w-3 h-3" /> Salvato il {new Date(item.created_at).toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                     </p>
                   </div>
                   <div className="flex gap-2 shrink-0">
                     <button onClick={() => loadSavedProcess(item)} className="px-5 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
                       Apri
                     </button>
                     <button onClick={() => handleDeleteSaved(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Elimina">
                       <Trash2 className="w-5 h-5" />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  )}

</div>
);
}

export default App;
