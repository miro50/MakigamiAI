

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

const DEFAULT_INPUT = "Customer Request Processing: A customer sends an email request to the Sales Department. The Sales Admin typically reads this email after a delay of about 2 hours due to high volume. Once opened, the Admin spends 15 minutes validating if all necessary information is present. If information is missing, they email the customer back and wait about 1 day for a reply. If the info is complete, the request is forwarded to the Technical Team. The Technical Lead reviews the feasibility, which takes 30 minutes. If feasible, the Tech Lead spends 45 minutes creating a draft quote. This draft is sent to Finance for pricing approval. The Finance Manager approves the price in just 10 minutes, but the request usually sits in their inbox for 4 hours before being addressed. Finally, the Sales Admin converts the approved quote to PDF and sends it to the customer.";

const PROCESS_EXAMPLES = [
"Gestione Rimborsi Spese: Il dipendente compila un file Excel in 20 min. Invia email. Il manager attende 4 ore prima di leggere, poi approva in 10 min. L'HR stampa il modulo (5 min) e lo trascrive in SAP (15 min). Attesa bonifico 2 giorni."
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

if (!session) {
return <Auth />;
}

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
