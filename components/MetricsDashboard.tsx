
import React from 'react';
import { MakigamiProcess } from '../types';
import { Timer, TrendingUp, CheckCircle } from 'lucide-react';

interface Props {
  data: MakigamiProcess;
}

const formatBusinessTime = (minutes: number) => {
  if (minutes === 0) return '0m';
  // If less than an hour, show minutes
  if (minutes < 60) return `${minutes}m`;
  // If less than a business day (8 hours = 480 mins), show hours
  if (minutes < 480) return `${(minutes / 60).toFixed(1).replace(/\.0$/, '')}h`;
  // Otherwise show business days
  return `${(minutes / 480).toFixed(1).replace(/\.0$/, '')}d`;
};

const MetricsDashboard: React.FC<Props> = ({ data }) => {
  const m = data.meta_analysis.metrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      
      {/* Total Lead Time */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-2 uppercase tracking-wide">
          <Timer className="w-4 h-4" /> Total Lead Time
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {formatBusinessTime(m.total_lead_time_minutes)}
        </div>
        <div className="text-xs text-slate-400 mt-1">End-to-end duration</div>
      </div>

      {/* Value Added Time */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 bg-green-50/20">
        <div className="flex items-center gap-2 text-green-700 text-xs font-bold mb-2 uppercase tracking-wide">
          <CheckCircle className="w-4 h-4" /> Touch Time (VA)
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {formatBusinessTime(m.total_touch_time_minutes)}
        </div>
        <div className="text-xs text-slate-400 mt-1">Active work</div>
      </div>

      {/* Efficiency (PCE) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-2 uppercase tracking-wide">
          <TrendingUp className="w-4 h-4" /> PCE Efficiency
        </div>
        <div className={`text-2xl font-bold ${m.efficiency_score_pce < 15 ? 'text-red-600' : 'text-green-600'}`}>
          {m.efficiency_score_pce.toFixed(1)}%
        </div>
        <div className="text-xs text-slate-400 mt-1">Process Cycle Efficiency</div>
      </div>

    </div>
  );
};

export default MetricsDashboard;
