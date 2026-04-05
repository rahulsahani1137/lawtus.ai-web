'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamAuthStore } from '@/store/teamAuthStore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, clearAuth } = useTeamAuthStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/team-login');
    }
  }, [isAuthenticated, isInitialized, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/team');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lawtus Trainer</h1>
              <p className="text-sm text-gray-500">Internal Team Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                    {user?.role.replace('_', ' ')}
                  </span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Annotation Studio Card */}
          <div 
            onClick={() => router.push('/team/studio')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Annotation Studio
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Annotate legal documents to create training data
            </p>
            <span className="text-xs text-blue-600 font-medium">
              Open Studio →
            </span>
          </div>

          {/* Ingestion Panel Card */}
          <div 
            onClick={() => router.push('/team/ingest')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-3xl mb-3">📤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Document Ingestion
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload PDFs and URLs for annotation
            </p>
            <span className="text-xs text-blue-600 font-medium">
              Upload Documents →
            </span>
          </div>

          {/* Training Dashboard Card */}
          <div 
            onClick={() => {
              if (user?.role === 'senior_lawyer' || user?.role === 'admin') {
                router.push('/team/training');
              } else {
                alert('Only senior lawyers and admins can access the training dashboard');
              }
            }}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Training Dashboard
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Monitor and control model training
            </p>
            <span className="text-xs text-blue-600 font-medium">
              {user?.role === 'senior_lawyer' || user?.role === 'admin' 
                ? 'Open Dashboard →' 
                : 'Senior Lawyer+ Only'}
            </span>
          </div>

          {/* Model Registry Card */}
          <div 
            onClick={() => router.push('/team/models')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Model Registry
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage and deploy model versions
            </p>
            <span className="text-xs text-blue-600 font-medium">
              View Models →
            </span>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backend API</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authentication</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Python Trainer</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Not Started
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rust Inference</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Not Started
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
