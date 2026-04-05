'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { TeamTrainingJob } from '@/types/team';

interface TrainingPipelineProps {
  job: TeamTrainingJob | null;
}

const getNodeStyle = (status: string, currentStage: string) => {
  if (status === currentStage) {
    return {
      background: '#3b82f6',
      color: 'white',
      border: '2px solid #2563eb',
    };
  }
  
  const stages = ['queued', 'preprocessing', 'training', 'exporting', 'complete'];
  const currentIndex = stages.indexOf(currentStage);
  const nodeIndex = stages.indexOf(status);
  
  if (nodeIndex < currentIndex) {
    return {
      background: '#10b981',
      color: 'white',
      border: '2px solid #059669',
    };
  }
  
  if (currentStage === 'failed') {
    return {
      background: '#ef4444',
      color: 'white',
      border: '2px solid #dc2626',
    };
  }
  
  return {
    background: '#f3f4f6',
    color: '#6b7280',
    border: '2px solid #d1d5db',
  };
};

export function TrainingPipeline({ job }: TrainingPipelineProps) {
  const currentStatus = job?.status || 'queued';

  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'default',
      position: { x: 50, y: 100 },
      data: { label: '📋 Queued' },
      style: getNodeStyle('queued', currentStatus),
    },
    {
      id: '2',
      type: 'default',
      position: { x: 250, y: 100 },
      data: { label: '⚙️ Preprocessing' },
      style: getNodeStyle('preprocessing', currentStatus),
    },
    {
      id: '3',
      type: 'default',
      position: { x: 450, y: 100 },
      data: { label: '🤖 Training' },
      style: getNodeStyle('training', currentStatus),
    },
    {
      id: '4',
      type: 'default',
      position: { x: 650, y: 100 },
      data: { label: '📦 Exporting' },
      style: getNodeStyle('exporting', currentStatus),
    },
    {
      id: '5',
      type: 'default',
      position: { x: 850, y: 100 },
      data: { label: '✅ Complete' },
      style: getNodeStyle('complete', currentStatus),
    },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: currentStatus === 'preprocessing' },
    { id: 'e2-3', source: '2', target: '3', animated: currentStatus === 'training' },
    { id: 'e3-4', source: '3', target: '4', animated: currentStatus === 'exporting' },
    { id: 'e4-5', source: '4', target: '5', animated: currentStatus === 'complete' },
  ];

  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div className="h-64 border border-gray-200 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
