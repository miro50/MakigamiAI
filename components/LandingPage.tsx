import React from 'react';
import { 
  Layout, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  Clock, 
  Search, 
  Split, 
  FileText, 
  ChevronRight,
  MousePointer2,
  Cpu,
  LineChart
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header / Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-indigo-200">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-800">
              Makigami<span className="text-indigo-600">AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 mr-8">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">Come Funziona</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Vantaggi</a>
          </div>

          <button 
            onClick={onLoginClick}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Accedi / Registrati
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-8 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>L'Intelligenza Artificiale al servizio del Lean Management</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto">
            Trasforma testi confusi in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Mappe Makigami</span> in pochi secondi
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Elimina ore di lavoro manuale. Inserisci la descrizione del tuo processo e lascia che la nostra IA calcoli Lead Time, sprechi e suggerisca lo stato futuro ottimale.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onLoginClick}
              className="group relative bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 overflow-hidden"
            >
              <div className="flex items-center gap-2 relative z-10">
                Inizia l'Analisi Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-5 rounded-2xl font-bold text-lg text-slate-600 hover:bg-slate-50 transition-all"
            >
              Scopri come funziona
            </button>
          </div>

          {/* Hero Visual Placeholder */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center p-8">
              <div className="grid grid-cols-3 gap-8 w-full h-full opacity-40">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                  <FileText className="w-12 h-12 text-slate-300" />
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                  <Cpu className="w-12 h-12 text-indigo-300 animate-pulse" />
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                  <LineChart className="w-12 h-12 text-slate-300" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-indigo-600/10 p-6 rounded-full animate-ping absolute"></div>
                <div className="bg-white shadow-2xl border border-slate-100 p-6 rounded-2xl flex items-center gap-4 relative z-10">
                  <div className="bg-indigo-600 p-3 rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                    <p className="text-lg font-extrabold text-slate-800">Analisi in corso...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Analisi Lean in 3 Semplici Step</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Il nostro motore AI è stato addestrato sulle migliori pratiche di Lean Manufacturing e Service Design.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-indigo-100 -translate-y-1/2 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-white border-4 border-indigo-50 rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:border-indigo-200 transition-all duration-300">
                <MousePointer2 className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">1. Descrivi il Processo</h3>
              <p className="text-slate-600">Scrivi in linguaggio naturale come avviene il processo. Non servono schemi complicati, basta il racconto.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-white border-4 border-indigo-50 rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:border-indigo-200 transition-all duration-300">
                <Cpu className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">2. L'IA Elabora i Dati</h3>
              <p className="text-slate-600">Il nostro algoritmo identifica swimlane, tempi di attraversamento, colli di bottiglia e sprechi (Muda).</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-white border-4 border-indigo-50 rounded-3xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:border-indigo-200 transition-all duration-300">
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">3. Ottieni Risultati</h3>
              <p className="text-slate-600">Visualizza la mappa Makigami completa, le metriche PCE e ricevi suggerimenti per il processo To-Be.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Tutto ciò che serve per un <span className="text-indigo-600">miglioramento continuo</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10">
                Makigami AI non è solo un generatore di diagrammi. È un assistente intelligente che ti aiuta a prendere decisioni basate sui dati.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Clock, title: "Risparmio di Tempo", desc: "Passa dall'analisi alla mappa in 30 secondi invece che in 4 ore." },
                  { icon: Search, title: "Individuazione Muda", desc: "L'IA evidenzia automaticamente sovrapproduzione, attese e rilavorazioni." },
                  { icon: Split, title: "Generazione To-Be", desc: "Ottieni una proposta di processo ottimizzato basata su logiche Lean." },
                  { icon: ShieldCheck, title: "Esportazione Dati", desc: "Salva i tuoi processi e scarica report pronti per gli stakeholder." }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6 mt-12">
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl">
                  <Zap className="w-10 h-10 text-indigo-400 mb-6" />
                  <p className="text-2xl font-bold mb-2">95%</p>
                  <p className="text-slate-400 text-sm">Riduzione del tempo di mappatura</p>
                </div>
                <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-2xl">
                  <BarChart3 className="w-10 h-10 text-white/80 mb-6" />
                  <p className="text-2xl font-bold mb-2">PCE</p>
                  <p className="text-indigo-100 text-sm">Calcolo automatico efficienza</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                  <ShieldCheck className="w-10 h-10 text-indigo-600 mb-6" />
                  <p className="text-2xl font-bold mb-2">Cloud</p>
                  <p className="text-slate-500 text-sm">Accesso sicuro ovunque</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                  <Sparkles className="w-10 h-10 text-indigo-600 mb-6" />
                  <p className="text-2xl font-bold mb-2">AI-First</p>
                  <p className="text-slate-500 text-sm">Motore Gemini 1.5 Pro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-3xl shadow-indigo-200">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] border-[40px] border-white rounded-full"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] border-[20px] border-white rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-8">Pronto a ottimizzare i tuoi processi?</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
                Unisciti a centinaia di Lean Manager che hanno già digitalizzato il loro modo di lavorare.
              </p>
              <button 
                onClick={onLoginClick}
                className="bg-white text-indigo-600 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-50 hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3 mx-auto"
              >
                Inizia Ora Gratis
                <ChevronRight className="w-6 h-6" />
              </button>
              <p className="mt-6 text-indigo-200 text-sm font-medium">Nessuna carta di credito richiesta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-lg">
                <Layout className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">Makigami AI</span>
            </div>
            
            <div className="flex gap-8 text-sm text-slate-500 font-medium">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Termini di Servizio</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Contatti</a>
            </div>
            
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Makigami AI Generator. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
