import { supabase } from '../supabase';
import { MakigamiProcess } from '../types';

// Funzione per salvare un processo
export const saveProcessToDb = async (userId: string, name: string, processData: MakigamiProcess) => {
const { data, error } = await supabase
.from('saved_processes')
.insert([
{
user_id: userId,
process_name: name, // Adattato alla tua colonna!
process_data: processData
}
])
.select();

if (error) {
console.error("Errore durante il salvataggio:", error);
throw error;
}
return data;
};

// Funzione per caricare la lista dei processi dell'utente
export const getUserProcesses = async (userId: string) => {
const { data, error } = await supabase
.from('saved_processes')
.select('id, process_name, created_at, process_data') // Adattato alla tua colonna!
.eq('user_id', userId)
.order('created_at', { ascending: false });

if (error) {
console.error("Errore durante il caricamento:", error);
throw error;
}
return data;
};

// Funzione per eliminare un processo (usa 'number' perché il tuo id è int8)
export const deleteProcess = async (processId: number) => {
const { error } = await supabase
.from('saved_processes')
.delete()
.eq('id', processId);

if (error) {
console.error("Errore durante l'eliminazione:", error);
throw error;
}
return true;
};
