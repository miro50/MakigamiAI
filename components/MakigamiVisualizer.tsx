import React, { useMemo, useState, useCallback } from 'react';
import { MakigamiProcess, MakigamiStep, Swimlane } from '../types';
import { ReactFlow, Controls, Background, MarkerType, Node, Edge, Handle, Position, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Clock, CheckCircle, AlertTriangle, X, User, Monitor, Globe } from 'lucide-react';

interface Props {
  data: MakigamiProcess;
}

const ROW_HEIGHT = 160;
const COL_WIDTH = 280;
const HEADER_WIDTH = 200;

const formatBusinessTime = (minutes: number) => {
    if (!minutes || minutes === 0) return '-';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 480) return `${(minutes / 60).toFixed(1).replace(/\.0$/, '')}h`;
    return `${(minutes / 480).toFixed(1).replace(/\.0$/, '')}d`;
};

// --- CUSTOM NODES ---

// 1. Il Nodo "Step" (La tua bellissima Card)
const StepNode = ({ data }: { data: any }) => {
  const step: MakigamiStep = data.step;
  const hasWaste = step.waste_tags && step.waste_tags.length > 0 && !step.waste_tags.includes('NONE');
  const isWait = step.times.wait_minutes > 0;
  
  return (
    <div 
      className={`w-[220px] p-2 rounded-lg border shadow-sm bg-white transition-all hover:shadow-md cursor-pointer ${isWait ? 'border-red-300 ring-1 ring-red-100' : 'border-indigo-200'}`}
      onClick={() => data.onClick(step)}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-indigo-400" />
      
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs font-bold ${hasWaste ? 'text-red-500' : 'text-slate-400'}`}>Step {step.id}</span>
        <div className="flex gap-1">
            {step.is_value_added ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-red-400" />}
        </div>
      </div>
      
      <p className="text-xs font-medium text-slate-700 leading-tight line-clamp-3 mb-3">
        {step.description}
      </p>
      
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
         <div className="flex flex-col">
            <span className="text-[9px] text-green-600 font-bold uppercase">Touch</span>
            <span className="text-xs font-bold text-slate-800">{formatBusinessTime(step.times.touch_minutes)}</span>
         </div>
         <div className="flex flex-col text-right">
            <span className="text-[9px] text-red-500 font-bold uppercase">Wait</span>
            <span className="text-xs font-bold text-slate-800">{formatBusinessTime(step.times.wait_minutes)}</span>
         </div>
      </div>

      {hasWaste && (
        <div className="mt-2 flex flex-wrap gap-1">
          {step.waste_tags.map((tag: string, i: number) => (
              <span key={i} className="text-[8px] text-red-700 font-bold bg-red-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {tag}
              </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-indigo-400" />
    </div>
  );
};

// 2. Il Nodo "Swimlane" (Corsia di Background)
const SwimlaneNode = ({ data }: { data: any }) => {
  const Icon = data.type === 'SYSTEM' ? Monitor : data.type === 'EXTERNAL' ? Globe : User;
  
  return (
    <div 
      style={{ width: data.width, height: ROW_HEIGHT - 20 }} 
      className="bg-slate-50/50 border-y border-r border-slate-200 rounded-r-xl flex items-center shadow-sm"
    >
      <div className="w-[200px] h-full bg-white border-r border-slate-200 p-4 flex flex-col justify-center shadow-[4px_0_12px_rgba(0,0,0,0.03)] rounded-l-xl z-10">
        <div className="flex items-center gap-2 mb-1">
           <Icon className="w-4 h-4 text-indigo-500" />
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.type}</span>
        </div>
        <h3 className="font-bold text-slate-800 text-sm">{data.label}</h3>
      </div>
    </div>
  );
};

const nodeTypes = {
  stepNode: StepNode,
  swimlaneNode: SwimlaneNode,
};

// --- ALGORITMO DI POSIZIONAMENTO ---
const calculateDepths = (steps: MakigamiStep[]) => {
  const depths: Record<number, number> = {};
  steps.forEach(s => depths[s.id] = 0);

  let changed = true;
  let iterations = 0;
  
  // Calcolo della colonna (X) ignorando i loop per evitare cicli infiniti
  while (changed && iterations < steps.length) {
    changed = false;
    iterations++;
    steps.forEach(step => {
       if (step.is_rework_loop) return; 
       
       const currentDepth = depths[step.id];
       step.next_step_ids?.forEach(nextId => {
         if ((depths[nextId] || 0) < currentDepth + 1) {
            depths[nextId] = currentDepth + 1;
            changed = true;
         }
       });
    });
  }
  return depths;
};

// --- COMPONENTE PRINCIPALE ---
const MakigamiVisualizer: React.FC<Props> = ({ data }) => {
  const [selectedStep, setSelectedStep] = useState<MakigamiStep | null>(null);

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // 1. Calcola le coordinate X logiche
    const depths = calculateDepths(data.steps);
    const maxDepth = Math.max(0, ...Object.values(depths));
    const totalCanvasWidth = HEADER_WIDTH + (maxDepth + 2) * COL_WIDTH;

    // 2. Mappa l'Indice Y delle Swimlane
    const swimlaneIndexMap = new Map<string, number>();
    data.swimlanes.forEach((lane, index) => {
      swimlaneIndexMap.set(lane.id, index);
      
      // Crea il nodo di Background della Swimlane
      nodes.push({
        id: `lane-${lane.id}`,
        type: 'swimlaneNode',
        position: { x: 0, y: index * ROW_HEIGHT },
        data: { label: lane.name, type: lane.type, width: totalCanvasWidth },
        draggable: false,
        selectable: false,
        zIndex: -1,
      });
    });

    // 3. Crea i Nodi Step
    data.steps.forEach((step) => {
      const colIndex = depths[step.id] || 0;
      const rowIndex = swimlaneIndexMap.get(step.swimlane_id) || 0;

      nodes.push({
        id: step.id.toString(),
        type: 'stepNode',
        position: { 
          x: HEADER_WIDTH + 40 + (colIndex * COL_WIDTH), 
          y: (rowIndex * ROW_HEIGHT) + 20 
        },
        data: { step, onClick: setSelectedStep },
        zIndex: 10,
      });

      // 4. Crea gli Archi (Frecce)
      step.next_step_ids?.forEach(nextId => {
        const isLoop = step.is_rework_loop;
        edges.push({
          id: `e${step.id}-${nextId}`,
          source: step.id.toString(),
          target: nextId.toString(),
          animated: isLoop, // I loop di difettosità si muovono!
          style: isLoop 
            ? { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' } 
            : { stroke: '#6366f1', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isLoop ? '#ef4444' : '#6366f1',
          },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Forza il refresh se i dati del parent cambiano
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[600px] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        className="bg-slate-100"
      >
        <Background gap={20} size={1} color="#e2e8f0" />
        <Controls className="bg-white border-slate-200 fill-slate-600 shadow-md" />
      </ReactFlow>

      {/* Modal di Dettaglio Step (Simile a prima) */}
      {selectedStep && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800">Step {selectedStep.id} Dettaglio</h3>
              <button onClick={() => setSelectedStep(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p className="text-slate-600 text-sm mb-4">{selectedStep.description}</p>
            <div className="flex justify-between bg-slate-50 p-3 rounded-lg">
                <div className="text-center">
                    <span className="block text-xs font-bold text-slate-400 uppercase">Touch (VA)</span>
                    <span className="font-bold text-green-600">{formatBusinessTime(selectedStep.times.touch_minutes)}</span>
                </div>
                <div className="text-center">
                    <span className="block text-xs font-bold text-slate-400 uppercase">Wait (NVA)</span>
                    <span className="font-bold text-red-600">{formatBusinessTime(selectedStep.times.wait_minutes)}</span>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MakigamiVisualizer;