
import React, { useState } from 'react';
import { MakigamiProcess, MakigamiStep } from '../types';
import { Save, RefreshCw, Calculator, Trash2 } from 'lucide-react';

interface Props {
  data: MakigamiProcess;
  onConfirm: (updatedData: MakigamiProcess) => void;
  onCancel: () => void;
}

const formatBusinessTime = (minutes: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 480) return `${(minutes / 60).toFixed(1).replace(/\.0$/, '')}h`;
    return `${(minutes / 480).toFixed(1).replace(/\.0$/, '')}d`;
};

const ProcessReview: React.FC<Props> = ({ data, onConfirm, onCancel }) => {
  const [process, setProcess] = useState<MakigamiProcess>(JSON.parse(JSON.stringify(data)));

  // Recalculate metrics based on current steps
  const recalculateMetrics = () => {
    let totalTouch = 0;
    let totalWait = 0;
    
    process.steps.forEach(s => {
        totalTouch += s.times.touch_minutes || 0;
        totalWait += s.times.wait_minutes || 0;
    });

    const totalLead = totalTouch + totalWait;
    const efficiency = totalLead > 0 ? (totalTouch / totalLead) * 100 : 0;
    
    setProcess(prev => ({
      ...prev,
      meta_analysis: {
          ...prev.meta_analysis,
          metrics: {
              ...prev.meta_analysis.metrics,
              total_lead_time_minutes: parseFloat(totalLead.toFixed(1)),
              total_touch_time_minutes: parseFloat(totalTouch.toFixed(1)),
              efficiency_score_pce: parseFloat(efficiency.toFixed(1)),
          }
      }
    }));
  };

  const handleStepChange = (id: number, field: keyof MakigamiStep | 'touch' | 'wait', value: any) => {
    setProcess(prev => ({
      ...prev,
      steps: prev.steps.map(step => {
        if (step.id !== id) return step;
        
        if (field === 'touch') {
            return { ...step, times: { ...step.times, touch_minutes: parseFloat(value) || 0 } };
        }
        if (field === 'wait') {
            return { ...step, times: { ...step.times, wait_minutes: parseFloat(value) || 0 } };
        }
        return { ...step, [field]: value };
      })
    }));
  };

  const handleDeleteStep = (id: number) => {
    setProcess(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== id)
    }));
  };

  const getSwimlaneName = (id: string) => process.swimlanes.find(s => s.id === id)?.name || id;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          <h2 className="font-bold text-lg">Review Analysis Parameters</h2>
        </div>
        <div className="text-sm text-slate-300">
          Verify Master Black Belt extraction
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="block text-xs font-bold text-slate-500 uppercase">Process Name</label>
            <input 
              type="text" 
              value={process.meta_analysis.process_name}
              onChange={(e) => setProcess({...process, meta_analysis: {...process.meta_analysis, process_name: e.target.value}})}
              className="w-full bg-transparent font-bold text-slate-800 focus:outline-none border-b border-transparent focus:border-indigo-500"
            />
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
             <div className="flex items-center gap-2 mb-1">
               <Calculator className="w-4 h-4 text-indigo-500" />
               <span className="text-xs font-bold text-slate-500 uppercase">PCE Efficiency</span>
             </div>
             <div className="text-xl font-bold text-slate-800">{process.meta_analysis.metrics.efficiency_score_pce}%</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
             <div className="flex items-center gap-2 mb-1">
               <Calculator className="w-4 h-4 text-indigo-500" />
               <span className="text-xs font-bold text-slate-500 uppercase">Total Lead Time</span>
             </div>
             <div className="text-xl font-bold text-slate-800">{formatBusinessTime(process.meta_analysis.metrics.total_lead_time_minutes)}</div>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg border-slate-200 shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 z-10">
              <tr>
                <th className="p-3 w-10">#</th>
                <th className="p-3 min-w-[200px]">Description</th>
                <th className="p-3 w-32">Swimlane</th>
                <th className="p-3 w-28 text-center text-green-700 bg-green-50/50">Touch (min)</th>
                <th className="p-3 w-28 text-center text-red-700 bg-red-50/50">Wait (min)</th>
                <th className="p-3 w-32">Waste Tags</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {process.steps.sort((a,b) => a.id - b.id).map((step) => (
                <tr key={step.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-400 font-mono">{step.id}</td>
                  <td className="p-3">
                    <input 
                      type="text" 
                      value={step.description}
                      onChange={(e) => handleStepChange(step.id, 'description', e.target.value)}
                      className="w-full bg-transparent focus:bg-white border border-transparent focus:border-indigo-300 rounded px-2 py-1 transition-all"
                    />
                    <input 
                      type="text" 
                      value={step.trigger}
                      onChange={(e) => handleStepChange(step.id, 'trigger', e.target.value)}
                      className="w-full text-xs text-slate-400 mt-1 bg-transparent focus:bg-white border border-transparent focus:border-indigo-300 rounded px-2 py-1 transition-all italic"
                      placeholder="Trigger..."
                    />
                  </td>
                  <td className="p-3 font-medium text-indigo-600">
                    {getSwimlaneName(step.swimlane_id)}
                  </td>
                  <td className="p-3 bg-green-50/20">
                     <div className="flex flex-col items-center">
                        <input 
                          type="number" 
                          min="0"
                          value={step.times.touch_minutes}
                          onChange={(e) => handleStepChange(step.id, 'touch', e.target.value)}
                          className="w-full text-center font-bold text-green-700 bg-transparent focus:bg-white border border-transparent focus:border-green-300 rounded px-1 py-1"
                        />
                        <span className="text-[10px] text-green-600/70 font-medium">
                           {formatBusinessTime(step.times.touch_minutes)}
                        </span>
                     </div>
                  </td>
                  <td className="p-3 bg-red-50/20">
                     <div className="flex flex-col items-center">
                        <input 
                          type="number" 
                          min="0"
                          value={step.times.wait_minutes}
                          onChange={(e) => handleStepChange(step.id, 'wait', e.target.value)}
                          className="w-full text-center font-bold text-red-600 bg-transparent focus:bg-white border border-transparent focus:border-red-300 rounded px-1 py-1"
                        />
                        <span className="text-[10px] text-red-600/70 font-medium">
                           {formatBusinessTime(step.times.wait_minutes)}
                        </span>
                     </div>
                  </td>
                  <td className="p-3">
                     <input 
                      type="text" 
                      value={step.waste_tags.join(', ')}
                      placeholder="NONE"
                      onChange={(e) => {
                          const tags = e.target.value.split(',').map(s => s.trim());
                          handleStepChange(step.id, 'waste_tags', tags);
                      }}
                      className="w-full text-xs text-red-500 bg-transparent focus:bg-white border border-transparent focus:border-red-200 rounded px-2 py-1 placeholder:text-slate-300"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleDeleteStep(step.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
           <button 
             onClick={recalculateMetrics}
             className="text-indigo-600 text-sm font-semibold flex items-center gap-2 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
           >
             <RefreshCw className="w-4 h-4" /> Update Totals
           </button>

           <div className="flex gap-3">
             <button 
               onClick={onCancel}
               className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
             >
               Back to Edit Input
             </button>
             <button 
               onClick={() => {
                 recalculateMetrics(); 
                 onConfirm(process);
               }}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
             >
               <Save className="w-4 h-4" />
               Confirm & Visualize
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessReview;
