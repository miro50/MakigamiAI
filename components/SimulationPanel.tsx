
import React, { useState } from 'react';
import { Gauge, Play, RotateCcw, TrendingUp } from 'lucide-react';

interface Props {
    onSimulate: (volume: number, scenario: string) => void;
    isSimulating: boolean;
    onReset: () => void;
    hasResults: boolean;
}

const SimulationPanel: React.FC<Props> = ({ onSimulate, isSimulating, onReset, hasResults }) => {
    const [volume, setVolume] = useState(2);
    const [scenario, setScenario] = useState("Peak Season / Black Friday");

    const handleSubmit = () => {
        onSimulate(volume, scenario);
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white border border-slate-700 shadow-xl mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Header */}
                <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="bg-indigo-500/20 p-2 rounded-lg">
                        <Gauge className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">What-If Analysis</h3>
                        <p className="text-xs text-slate-400">Simulate stress scenarios</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
                    
                    {/* Volume Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                            <span>Volume Multiplier</span>
                            <span className="text-indigo-300">{volume}x Load</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            step="0.5" 
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>1x (Normal)</span>
                            <span>10x (Extreme)</span>
                        </div>
                    </div>

                    {/* Scenario Input */}
                    <div className="space-y-2">
                         <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                            Scenario Context
                        </label>
                        <input 
                            type="text" 
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                            placeholder="e.g. 50% Staff Reduction..."
                            className="w-full bg-slate-900/50 border border-slate-600 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 min-w-[140px] justify-end">
                    {hasResults ? (
                        <button 
                            onClick={onReset}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold transition-all"
                        >
                            <RotateCcw className="w-4 h-4" /> Reset
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={isSimulating}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait w-full md:w-auto justify-center"
                        >
                            {isSimulating ? (
                                <Gauge className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4 fill-current" />
                            )}
                            {isSimulating ? 'Simulating...' : 'Run Sim'}
                        </button>
                    )}
                </div>
            </div>

            {/* Results Banner */}
            {hasResults && !isSimulating && (
                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                     <TrendingUp className="w-4 h-4 text-orange-400" />
                     <p className="text-sm text-slate-300">
                         Displaying simulation results for <span className="text-white font-bold">{volume}x volume</span>. 
                         Bottlenecks are highlighted in <span className="text-orange-400 font-bold">Orange</span> and <span className="text-red-500 font-bold">Red</span>.
                     </p>
                </div>
            )}
        </div>
    );
};

export default SimulationPanel;
