'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamAuthStore } from '@/store/teamAuthStore';
import { teamModelsAPI } from '@/lib/team-api';
import type { TeamModel } from '@/types/team';

export default function ModelsPage() {
  const router = useRouter();
  const { user, accessToken } = useTeamAuthStore();
  const [models, setModels] = useState<TeamModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !accessToken) {
      router.push('/login');
      return;
    }

    loadModels();
  }, [user, accessToken, router]);

  const loadModels = async () => {
    if (!accessToken) return;

    try {
      const response = await teamModelsAPI.list(accessToken);
      setModels(response.models);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (modelId: string) => {
    if (!accessToken) return;
    
    if (!confirm('Promote this model to production? This will make it the active model for inference.')) {
      return;
    }

    setActionLoading(modelId);
    try {
      await teamModelsAPI.promote(accessToken, modelId);
      await loadModels();
      alert('Model promoted to production successfully!');
    } catch (error) {
      alert('Failed to promote model: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRollback = async (modelId: string) => {
    if (!accessToken) return;
    
    if (!confirm('Rollback to this model version? This will demote the current production model.')) {
      return;
    }

    setActionLoading(modelId);
    try {
      await teamModelsAPI.rollback(accessToken, modelId);
      await loadModels();
      alert('Model rolled back successfully!');
    } catch (error) {
      alert('Failed to rollback model: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading models...</p>
        </div>
      </div>
    );
  }

  const productionModel = models.find((m) => m.environment === 'production');
  const stagingModels = models.filter((m) => m.environment === 'staging');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Model Registry</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and deploy model versions
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
        {/* Production Model */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Model</h2>
          {productionModel ? (
            <div className="bg-white rounded-lg shadow-sm border-2 border-green-500 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {productionModel.versionTag}
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🚀 Production
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Validation Loss</div>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        {productionModel.valLoss?.toFixed(4) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Validation Accuracy</div>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        {productionModel.valAccuracy 
                          ? `${(productionModel.valAccuracy * 100).toFixed(2)}%` 
                          : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Promoted At</div>
                      <div className="mt-1 text-sm text-gray-900">
                        {productionModel.promotedAt 
                          ? new Date(productionModel.promotedAt).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Created At</div>
                      <div className="mt-1 text-sm text-gray-900">
                        {new Date(productionModel.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No production model
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Promote a staging model to production to start using it
              </p>
            </div>
          )}
        </div>

        {/* Staging Models */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Staging Models ({stagingModels.length})
          </h2>
          
          {stagingModels.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No staging models
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Complete a training job to create a new model version
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stagingModels.map((model) => (
                <div
                  key={model.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {model.versionTag}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                        Staging
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Validation Loss:</span>
                      <span className="font-medium text-gray-900">
                        {model.valLoss?.toFixed(4) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Validation Accuracy:</span>
                      <span className="font-medium text-gray-900">
                        {model.valAccuracy 
                          ? `${(model.valAccuracy * 100).toFixed(2)}%` 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(model.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {(user?.role === 'admin' || user?.role === 'senior_lawyer') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePromote(model.id)}
                        disabled={actionLoading === model.id}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === model.id ? 'Promoting...' : 'Promote to Production'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
