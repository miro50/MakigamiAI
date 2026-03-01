
import React, { useState } from 'react';
import { KaizenRecommendation } from '../types';
import { Lightbulb, ChevronDown, ChevronUp, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { generateSolutonForKaizen } from '../services/geminiService';

interface Props {
  opportunities: KaizenRecommendation[];
  processSummary: string;
}

const KaizenItem: React.FC<{ item: KaizenRecommendation; summary: string }> = ({ item, summary }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSolution = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (solution) return;
    
    setIsLoading(true);
    try {
      const result = await generateSolutonForKaizen(summary, "Step " + item.target_step_id, item.suggestion);
      setSolution(result);
    } catch (error) {
      console.error(error);
      setSolution("Failed to generate solution. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer bg-gradient-to-r from-white to-slate-50 hover:to-indigo-50/30"
      >
        <div className="flex items-center gap-4">
          <div className="bg-red-100 p-2 rounded-lg text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm md:text-base">Step #{item.target_step_id} Opportunity</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${item.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                {item.impact} Impact
              </span>
              {!isExpanded && (
                <span className="text-xs text-slate-400 truncate max-w-[200px]">
                  {item.suggestion}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button className="text-slate-400 hover:text-indigo-600">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Problem Details */}
            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommendation</h5>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {item.suggestion}
                </p>
              </div>
            </div>

            {/* Solution Section */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Generated Implementation</h5>
              
              {!solution ? (
                <div className="flex flex-col items-start gap-3">
                   <p className="text-sm text-slate-500 italic">
                     Ask AI for a specific execution plan.
                   </p>
                   <button
                     onClick={handleGenerateSolution}
                     disabled={isLoading}
                     className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                   >
                     {isLoading ? (
                       <Zap className="w-4 h-4 animate-spin" />
                     ) : (
                       <Zap className="w-4 h-4 fill-current" />
                     )}
                     {isLoading ? 'Consulting AI...' : 'Generate Plan'}
                   </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 animate-in fade-in zoom-in-95 duration-300">
                   <div className="flex items-start gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-bold text-green-800">Action Plan</span>
                   </div>
                   <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                     {solution}
                   </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

const KaizenList: React.FC<Props> = ({ opportunities, processSummary }) => {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500 fill-current" />
          Kaizen Recommendations
        </h3>
        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
          {opportunities.length} Items
        </span>
      </div>
      
      <div className="grid gap-3">
        {opportunities.sort((a,b) => a.target_step_id - b.target_step_id).map((opp, idx) => (
          <KaizenItem key={idx} item={opp} summary={processSummary} />
        ))}
      </div>
    </div>
  );
};

export default KaizenList;
