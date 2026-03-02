import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { MakigamiProcess } from '../types';
import { FolderOpen, Clock, Trash2, X, RotateCcw } from 'lucide-react';

interface ProcessHistoryProps {
  onLoad: (data: MakigamiProcess) => void;
  onClose: () => void;
}

export default function ProcessHistory({ onLoad, onClose }: ProcessHistoryProps) {
  const [savedList, setSavedList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Utente non autenticato");

      // QUI USIAMO LA TABELLA E LE COLONNE CORRETTE
      const { data, error } = await supabase
        .from('saved_processes')
        .select('id, process_name, created_at, process_data')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedList(data || []);
    } catch (err: any) {
      console.error("Errore nel caricamento della cronologia:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo processo?")) return;
    
    try {
      const { error } = await supabase
        .from('saved_processes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Aggiorna la lista rimuovendo l'elemento eliminato
      setSavedList(savedList.filter(item => item.id !== id));
    } catch (err) {
      alert("Errore durante l'eliminazione");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-indigo-500" /> I Miei Processi Salvati
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
          {isLoading ? (
            <div className="text-center text-slate-500 py-12 flex flex-col items-center gap-3">
              <RotateCcw className="w-6 h-6 animate-spin text-indigo-500" /> 
              Caricamento in corso...
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12 bg-red-50 rounded-xl border border-red-200">
              Errore nel caricamento: {error}
            </div>
          ) : savedList.length === 0 ? (
            <div className="text-center text-slate-500 py-12 bg-white rounded-xl border border-slate-200 border-dashed">
              Non hai ancora salvato nessun processo. Generane uno e salvalo!
            </div>
          ) : (
            <div className="space-y-3">
              {savedList.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">{item.process_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> 
                      Salvato il {new Date(item.created_at).toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => onLoad(item.process_data)} 
                      className="px-5 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Apri Processo
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Elimina"
                    >
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
  );
}
