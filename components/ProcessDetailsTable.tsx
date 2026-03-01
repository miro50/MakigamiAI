
import React from 'react';
import { MakigamiProcess } from '../types';
import { FileText } from 'lucide-react';

interface Props {
  data: MakigamiProcess;
}

const formatBusinessTime = (minutes: number) => {
    if (minutes === 0) return '-';
    // If less than an hour, show minutes
    if (minutes < 60) return `${minutes}m`;
    // If less than a business day (8 hours = 480 mins), show hours
    if (minutes < 480) return `${(minutes / 60).toFixed(1).replace(/\.0$/, '')}h`;
    // Otherwise show business days
    return `${(minutes / 480).toFixed(1).replace(/\.0$/, '')}d`;
};

const ProcessDetailsTable: React.FC<Props> = ({ data }) => {
  const getSwimlaneName = (id: string) => data.swimlanes.find(s => s.id === id)?.name || id;
  const m = data.meta_analysis.metrics;

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
      
      {/* Activity Details Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <FileText className="w-5 h-5 text-indigo-600" />
             Dettaglio Attività
           </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3 w-32">Swimlane</th>
                <th className="p-3 min-w-[200px]">Azione</th>
                <th className="p-3 w-32">Trigger</th>
                <th className="p-3 w-20 text-center bg-green-50/50 text-green-800 border-l border-slate-200">Touch</th>
                <th className="p-3 w-20 text-center bg-red-50/50 text-red-800">Wait</th>
                <th className="p-3 w-24">Muda Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.steps.sort((a,b) => a.id - b.id).map((step) => (
                <tr key={step.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-center font-mono text-slate-500 font-bold">{step.id}</td>
                  <td className="p-3 font-semibold text-indigo-600">{getSwimlaneName(step.swimlane_id)}</td>
                  <td className="p-3 text-slate-700">{step.description}</td>
                  <td className="p-3 text-slate-500 text-xs italic">{step.trigger}</td>
                  <td className="p-3 text-center font-bold text-green-700 bg-green-50/10 border-l border-slate-100">
                    {step.times.touch_minutes > 0 ? formatBusinessTime(step.times.touch_minutes) : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="p-3 text-center font-bold text-red-600 bg-red-50/10">
                    {step.times.wait_minutes > 0 ? formatBusinessTime(step.times.wait_minutes) : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="p-3">
                     {step.waste_tags && step.waste_tags.length > 0 && !step.waste_tags.includes("NONE") ? (
                       <div className="flex flex-col gap-1">
                          {step.waste_tags.map(tag => (
                             <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-800 w-fit">
                                {tag}
                             </span>
                          ))}
                       </div>
                     ) : <span className="text-slate-300">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
             <tfoot className="bg-slate-50 font-bold text-slate-700 border-t border-slate-200">
              <tr>
                <td colSpan={4} className="p-3 text-right uppercase text-xs tracking-wider text-slate-500">Totale</td>
                <td className="p-3 text-center text-green-800 bg-green-100/20 border-l border-slate-200">{formatBusinessTime(m.total_touch_time_minutes)}</td>
                <td className="p-3 text-center text-red-800 bg-red-100/20">{formatBusinessTime(m.total_lead_time_minutes - m.total_touch_time_minutes)}</td>
                <td className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetailsTable;
