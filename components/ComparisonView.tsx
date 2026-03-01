
import React from 'react';
import { MakigamiProcess } from '../types';
import MakigamiVisualizer from './MakigamiVisualizer';
import { TrendingDown, TrendingUp, Zap, Minus, AlertTriangle, ArrowRight } from 'lucide-react';

interface Props {
  asIs: MakigamiProcess;
  toBe: MakigamiProcess;
}

const formatBusinessTime = (minutes: number) => {
    if (minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 480) return `${(minutes / 60).toFixed(1).replace(/\.0$/, '')}h`;
    return `${(minutes / 480).toFixed(1).replace(/\.0$/, '')}d`;
};

const ComparisonMetricCard: React.FC<{
  label: string;
  asIsValue: number;
  toBeValue: number;
  unit: string;
  isLowerBetter?: boolean;
}> = ({ label, asIsValue, toBeValue, unit, isLowerBetter = true }) => {
  const diff = toBeValue - asIsValue;
  const absDiff = Math.abs(diff);
  const percentChange = asIsValue !== 0 ? (absDiff / asIsValue) * 100 : 0;
  
  const isReduction = diff < 0;
  const isIncrease = diff > 0;
  const isNeutral = diff === 0;

  let isGood = false;
  if (isNeutral) {
     // Neutral
  } else if (isLowerBetter) {
     isGood = isReduction;
  } else {
     isGood = isIncrease; 
  }

  const colorClass = isNeutral 
    ? 'text-slate-500 bg-slate-100 border-slate-200'
    : isGood 
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
      : 'text-rose-700 bg-rose-50 border-rose-200';
      
  const valueColorClass = isNeutral
    ? 'text-slate-700'
    : isGood
      ? 'text-emerald-600'
      : 'text-rose-600';

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{label}</div>
      
      <div className="flex items-end justify-between mb-4">
        <div>
           <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">As-Is</div>
           <div className="font-semibold text-slate-600 text-lg">
             {unit === 'dynamic' ? formatBusinessTime(asIsValue) : asIsValue.toFixed(1)} 
             <span className="text-xs font-normal text-slate-400 ml-1">{unit !== 'dynamic' ? unit : ''}</span>
           </div>
        </div>
        
        <div className="mb-2 text-slate-300">
            <ArrowRight className="w-4 h-4" />
        </div>

        <div className="text-right">
           <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">To-Be</div>
           <div className={`font-bold text-2xl ${valueColorClass}`}>
             {unit === 'dynamic' ? formatBusinessTime(toBeValue) : toBeValue.toFixed(1)}
             <span className="text-sm font-normal opacity-70 ml-1">{unit !== 'dynamic' ? unit : ''}</span>
           </div>
        </div>
      </div>
      
      <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${colorClass}`}>
        <div className="flex items-center gap-2">
            {isNeutral && <Minus className="w-4 h-4" />}
            {isReduction && <TrendingDown className="w-4 h-4" />}
            {isIncrease && <TrendingUp className="w-4 h-4" />}
            
            <span className="text-xs font-bold">
                {isNeutral && "No Change"}
                {isReduction && "Reduction"}
                {isIncrease && "Increase"}
            </span>
        </div>
        <span className="text-xs font-bold">
            {isNeutral ? '0%' : `${percentChange.toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
};

const ComparisonView: React.FC<Props> = ({ asIs, toBe }) => {
  const mAsIs = asIs.meta_analysis.metrics;
  const mToBe = toBe.meta_analysis.metrics;
  
  const asIsNva = mAsIs.total_lead_time_minutes - mAsIs.total_touch_time_minutes;
  const toBeNva = mToBe.total_lead_time_minutes - mToBe.total_touch_time_minutes;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      
      {/* Header Section */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-yellow-400 fill-current" />
            <h2 className="text-2xl font-bold">Process Optimization Report</h2>
            </div>
            <p className="text-slate-300 max-w-2xl">
            Comparison of the current operational state versus the AI-optimized future state, highlighting efficiency gains and waste reduction.
            </p>
        </div>
      </div>

      {/* KPI Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComparisonMetricCard 
          label="Total Lead Time" 
          asIsValue={mAsIs.total_lead_time_minutes} 
          toBeValue={mToBe.total_lead_time_minutes} 
          unit="dynamic" 
          isLowerBetter={true} 
        />
        <ComparisonMetricCard 
          label="Waste (Wait Time)" 
          asIsValue={asIsNva} 
          toBeValue={toBeNva} 
          unit="dynamic" 
          isLowerBetter={true} 
        />
        <ComparisonMetricCard 
          label="Flow Efficiency (PCE)" 
          asIsValue={mAsIs.efficiency_score_pce} 
          toBeValue={mToBe.efficiency_score_pce} 
          unit="%" 
          isLowerBetter={false} 
        />
      </div>

      {/* Split Screen Visualizers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* AS-IS Side */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-t-xl border-x border-t border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <div className="bg-red-100 p-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              Current State (As-Is)
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">
              Original
            </span>
          </div>
          
          <div className="border border-slate-200 rounded-b-xl shadow-inner overflow-hidden bg-slate-50 relative">
             <div className="scale-95 origin-top-left opacity-90 grayscale-[0.3]">
               <MakigamiVisualizer data={asIs} />
             </div>
             {/* Overlay Badge */}
             <div className="absolute bottom-4 left-4 bg-red-100/90 backdrop-blur border border-red-200 text-red-800 text-xs px-3 py-2 rounded-lg font-medium shadow-sm max-w-xs">
                {asIs.meta_analysis.health_check.main_issue}
             </div>
          </div>
        </div>

        {/* TO-BE Side */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-t-xl border-x border-t border-indigo-100 shadow-sm ring-1 ring-indigo-50">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <div className="bg-emerald-100 p-1.5 rounded-lg">
                 <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              </div>
              Future State (To-Be)
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white font-bold bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-1 rounded shadow-sm">
               Recommended
            </span>
          </div>
          
          <div className="border border-indigo-100 rounded-b-xl shadow-lg overflow-hidden bg-white relative">
             <div className="scale-95 origin-top-left">
               <MakigamiVisualizer data={toBe} />
             </div>
             {/* Overlay Badge */}
             <div className="absolute bottom-4 left-4 bg-emerald-50/90 backdrop-blur border border-emerald-200 text-emerald-900 text-xs px-3 py-2 rounded-lg font-medium shadow-sm max-w-xs">
                Optimized Flow
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComparisonView;
