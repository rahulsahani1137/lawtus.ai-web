'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamAuthStore } from '@/store/teamAuthStore';
import { teamTrainingAPI } from '@/lib/team-api';
import { TrainingPipeline } from '@/components/training/training-pipeline';
import { TrainingMetrics } from '@/components/training/training-metrics';
import { TrainingConfig } from '@/components/training/training-config';
import type { TeamTrainingJob } from '@/types/team';

export default function TrainingPage() {
  const router = useRouter();
  const { user, accessToken } = useTeamAuthStore();
  const [currentJob, setCurrentJob] = useState<TeamTrainingJob | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !accessToken) {
      router.push('/login');
      return;
    }

    // Check if user has permission (senior_lawyer or admin)
    if (user.role !== 'senior_lawyer' && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, accessToken, router]);

  const handleStartTraining = async (config: {
    baseModel?: string;
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
    loraR?: number;
    loraAlpha?: number;
  }) => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await teamTrainingAPI.start(accessToken, config);
      
      // Poll for job status
      const jobId = response.jobId;
      const pollInterval = setInterval(async () => {
        try {
          const job = await teamTrainingAPI.getStatus(accessToken, jobId);
          setCurrentJob(job);

          // Stop polling if job is complete or failed
          if (job.status === 'complete' || job.status === 'failed') {
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Failed to fetch job status:', error);
          clearInterval(pollInterval);
        }
      }, 2000);

      setShowConfig(false);
    } catch (error) {
      console.error('Failed to start training:', error);
      alert('Failed to start training: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStopTraining = async () => {
    if (!accessToken || !currentJob) return;

    try {
      await teamTrainingAPI.stop(accessToken, currentJob.id);
      setCurrentJob({ ...currentJob, status: 'failed' });
    } catch (error) {
      console.error('Failed to stop training:', error);
      alert('Failed to stop training: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Training Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor and control model training
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Training Control</h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentJob
                  ? `Job ${currentJob.id.substring(0, 8)} - ${currentJob.status}`
                  : 'No active training job'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {currentJob && (currentJob.status === 'queued' || currentJob.status === 'preprocessing' || currentJob.status === 'training') ? (
                <button
                  onClick={handleStopTraining}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Stop Training
                </button>
              ) : (
                <button
                  onClick={() => setShowConfig(true)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Start New Training'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Training Pipeline Visualization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Pipeline</h2>
          <TrainingPipeline job={currentJob} />
        </div>

        {/* Training Metrics */}
        {currentJob && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Metrics</h2>
            <TrainingMetrics job={currentJob} />
          </div>
        )}

        {/* No Job State */}
        {!currentJob && !showConfig && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No training job running
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Start a new training job to fine-tune the model with your annotations
            </p>
            <button
              onClick={() => setShowConfig(true)}
              className="mt-6 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Configure Training
            </button>
          </div>
        )}
      </div>

      {/* Training Config Modal */}
      {showConfig && (
        <TrainingConfig
          onStart={handleStartTraining}
          onCancel={() => setShowConfig(false)}
          loading={loading}
        />
      )}
    </div>
  );
}
