'use client';

import { useState } from 'react';

interface TrainingConfigProps {
  onStart: (config: {
    baseModel?: string;
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
    loraR?: number;
    loraAlpha?: number;
  }) => void;
  onCancel: () => void;
  loading: boolean;
}

export function TrainingConfig({ onStart, onCancel, loading }: TrainingConfigProps) {
  const [config, setConfig] = useState({
    baseModel: 'nlpaueb/legal-bert-base-uncased',
    epochs: 3,
    batchSize: 16,
    learningRate: 0.0001,
    loraR: 8,
    loraAlpha: 16,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Training Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure hyperparameters for model fine-tuning
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Base Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Model
            </label>
            <select
              value={config.baseModel}
              onChange={(e) => setConfig({ ...config, baseModel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="nlpaueb/legal-bert-base-uncased">
                Legal-BERT Base Uncased (Recommended)
              </option>
              <option value="bert-base-uncased">BERT Base Uncased</option>
              <option value="roberta-base">RoBERTa Base</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Pre-trained model to fine-tune
            </p>
          </div>

          {/* Training Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Epochs
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.epochs}
                onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Number of training iterations
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Size
              </label>
              <input
                type="number"
                min="1"
                max="64"
                value={config.batchSize}
                onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Samples per training step
              </p>
            </div>
          </div>

          {/* Learning Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Rate
            </label>
            <input
              type="number"
              step="0.00001"
              min="0.00001"
              max="0.01"
              value={config.learningRate}
              onChange={(e) => setConfig({ ...config, learningRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Step size for gradient descent (typically 0.0001)
            </p>
          </div>

          {/* LoRA Parameters */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              LoRA Configuration
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Low-Rank Adaptation parameters for efficient fine-tuning
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LoRA R (Rank)
                </label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={config.loraR}
                  onChange={(e) => setConfig({ ...config, loraR: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Rank of update matrices (8 recommended)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LoRA Alpha
                </label>
                <input
                  type="number"
                  min="1"
                  max="128"
                  value={config.loraAlpha}
                  onChange={(e) => setConfig({ ...config, loraAlpha: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Scaling factor (typically 2x rank)
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Training Notes</h4>
                <ul className="mt-2 text-xs text-blue-700 space-y-1">
                  <li>• Training will use all approved annotations as training data</li>
                  <li>• Estimated time: 10-30 minutes depending on dataset size</li>
                  <li>• Model will be exported to ONNX format after training</li>
                  <li>• You can monitor progress in real-time on this dashboard</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting Training...' : 'Start Training'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
