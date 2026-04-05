'use client';

import type { TeamTrainingJob } from '@/types/team';

interface TrainingMetricsProps {
  job: TeamTrainingJob;
}

export function TrainingMetrics({ job }: TrainingMetricsProps) {
  const metrics = job.metrics as any || {};
  const config = job.config as any || {};

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start) return 'N/A';
    
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-500 uppercase">Job ID</div>
          <div className="mt-1 text-sm font-mono text-gray-900">
            {job.id.substring(0, 8)}...
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-500 uppercase">Status</div>
          <div className="mt-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                job.status === 'complete'
                  ? 'bg-green-100 text-green-800'
                  : job.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : job.status === 'training'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {job.status}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-500 uppercase">Dataset Size</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {job.datasetSize || 0}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-500 uppercase">Duration</div>
          <div className="mt-1 text-sm font-medium text-gray-900">
            {formatDuration(job.startedAt, job.completedAt)}
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Base Model</div>
            <div className="mt-1 text-sm font-medium text-gray-900">
              {config.baseModel || 'legal-bert-base-uncased'}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Epochs</div>
            <div className="mt-1 text-sm font-medium text-gray-900">
              {config.epochs || 3}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Batch Size</div>
            <div className="mt-1 text-sm font-medium text-gray-900">
              {config.batchSize || 16}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Learning Rate</div>
            <div className="mt-1 text-sm font-medium text-gray-900">
              {config.learningRate || 0.0001}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">LoRA R</div>
            <div className="mt-1 text-sm font-medium text-gray-900">
              {config.loraR || 8}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">LoRA Alpha</div>
            <div className="mt-1 text-sm font-medium text-gray-900">
              {config.loraAlpha || 16}
            </div>
          </div>
        </div>
      </div>

      {/* Training Metrics */}
      {metrics.loss !== undefined && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Training Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-xs font-medium text-blue-600 uppercase">Loss</div>
              <div className="mt-1 text-2xl font-bold text-blue-900">
                {metrics.loss?.toFixed(4) || 'N/A'}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-xs font-medium text-green-600 uppercase">Accuracy</div>
              <div className="mt-1 text-2xl font-bold text-green-900">
                {metrics.accuracy ? `${(metrics.accuracy * 100).toFixed(2)}%` : 'N/A'}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-xs font-medium text-purple-600 uppercase">Epoch</div>
              <div className="mt-1 text-2xl font-bold text-purple-900">
                {metrics.currentEpoch || 0} / {config.epochs || 3}
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-xs font-medium text-orange-600 uppercase">Progress</div>
              <div className="mt-1 text-2xl font-bold text-orange-900">
                {metrics.progress ? `${metrics.progress}%` : '0%'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {job.errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Training Error</h3>
              <p className="mt-1 text-sm text-red-700">{job.errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>{' '}
            <span className="text-gray-900">
              {new Date(job.createdAt).toLocaleString()}
            </span>
          </div>
          {job.startedAt && (
            <div>
              <span className="text-gray-500">Started:</span>{' '}
              <span className="text-gray-900">
                {new Date(job.startedAt).toLocaleString()}
              </span>
            </div>
          )}
          {job.completedAt && (
            <div>
              <span className="text-gray-500">Completed:</span>{' '}
              <span className="text-gray-900">
                {new Date(job.completedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
