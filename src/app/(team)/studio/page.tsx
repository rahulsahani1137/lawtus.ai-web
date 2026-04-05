'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamAuthStore } from '@/store/teamAuthStore';
import { teamDocumentsAPI, teamAnnotationsAPI } from '@/lib/team-api';
import { AnnotationEditor } from '@/components/studio/annotation-editor';
import { DocumentSelector } from '@/components/studio/document-selector';
import type { TeamDocument } from '@/types/team';

export default function StudioPage() {
  const router = useRouter();
  const { user, accessToken } = useTeamAuthStore();
  const [documents, setDocuments] = useState<TeamDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<TeamDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !accessToken) {
      router.push('/login');
      return;
    }

    loadDocuments();
  }, [user, accessToken, router]);

  const loadDocuments = async () => {
    if (!accessToken) return;

    try {
      const response = await teamDocumentsAPI.list(accessToken);
      setDocuments(response.documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Annotation Studio</h1>
              <p className="text-sm text-gray-600 mt-1">
                Annotate legal documents to create training data
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
        <div className="grid grid-cols-12 gap-6">
          {/* Document Selector Sidebar */}
          <div className="col-span-3">
            <DocumentSelector
              documents={documents}
              selectedDocument={selectedDocument}
              onSelectDocument={setSelectedDocument}
              onRefresh={loadDocuments}
            />
          </div>

          {/* Editor Area */}
          <div className="col-span-9">
            {selectedDocument ? (
              <AnnotationEditor
                document={selectedDocument}
                accessToken={accessToken!}
              />
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No document selected
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Select a document from the sidebar to start annotating
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
