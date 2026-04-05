'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamAuthStore } from '@/store/teamAuthStore';
import { teamDocumentsAPI } from '@/lib/team-api';

export default function IngestPage() {
  const router = useRouter();
  const { user, accessToken } = useTeamAuthStore();
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState<'pdf' | 'url' | 'manual'>('manual');
  const [sourceUrl, setSourceUrl] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user || !accessToken) {
      router.push('/login');
    }
  }, [user, accessToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title' });
      return;
    }

    if (sourceType === 'url' && !sourceUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    if (sourceType === 'manual' && !extractedText.trim()) {
      setMessage({ type: 'error', text: 'Please enter document text' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      await teamDocumentsAPI.upload(accessToken!, {
        title,
        sourceType,
        sourceUrl: sourceType === 'url' ? sourceUrl : undefined,
        extractedText: sourceType === 'manual' ? extractedText : undefined,
      });

      setMessage({ type: 'success', text: 'Document uploaded successfully!' });
      
      // Reset form
      setTitle('');
      setSourceUrl('');
      setExtractedText('');
      
      // Redirect to studio after 2 seconds
      setTimeout(() => {
        router.push('/studio');
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload document',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Ingestion</h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload documents for annotation
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Contract Agreement 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Source Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="manual"
                    checked={sourceType === 'manual'}
                    onChange={(e) => setSourceType(e.target.value as 'manual')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Manual Text</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="url"
                    checked={sourceType === 'url'}
                    onChange={(e) => setSourceType(e.target.value as 'url')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">URL</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pdf"
                    checked={sourceType === 'pdf'}
                    onChange={(e) => setSourceType(e.target.value as 'pdf')}
                    className="mr-2"
                    disabled
                  />
                  <span className="text-sm text-gray-400">PDF (Coming Soon)</span>
                </label>
              </div>
            </div>

            {/* URL Input */}
            {sourceType === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document URL *
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/document.html"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL crawling will be implemented in the next phase
                </p>
              </div>
            )}

            {/* Manual Text Input */}
            {sourceType === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Text *
                </label>
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Paste or type the document text here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={12}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {extractedText.length} characters
                </p>
              </div>
            )}

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
