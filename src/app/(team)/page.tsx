/**
 * Team Portal Home Page
 */

import Link from 'next/link';

export default function TeamPortalPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Internal Use Only</strong> - This portal is for authorized team members only. All actions are logged and monitored.
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Lawtus Trainer
        </h1>
        <p className="text-xl text-gray-600">
          Internal AI Training Portal for Legal-BERT Fine-Tuning
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/team/dashboard" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h3>
          <p className="text-gray-600">View system status and quick access to all features</p>
        </Link>

        <Link href="/team/ingest" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Ingestion</h3>
          <p className="text-gray-600">Upload and process legal documents for annotation</p>
        </Link>

        <Link href="/team/studio" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Annotation Studio</h3>
          <p className="text-gray-600">Annotate documents with corrections and labels</p>
        </Link>

        <Link href="/team/training" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Training Dashboard</h3>
          <p className="text-gray-600">Monitor and manage AI model training jobs</p>
        </Link>

        <Link href="/team/models" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Model Registry</h3>
          <p className="text-gray-600">Manage model versions and deployments</p>
        </Link>

        <Link href="/auth/team-login" className="block p-6 bg-indigo-50 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-indigo-200">
          <h3 className="text-xl font-semibold text-indigo-900 mb-2">Sign In</h3>
          <p className="text-indigo-700">Access the team portal with your credentials</p>
        </Link>
      </div>

      {/* Features List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Document Annotation</strong> - Rich text editor with multi-color highlighting</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>AI Training</strong> - TensorFlow + LoRA fine-tuning for Legal-BERT</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Real-time Progress</strong> - Monitor training progress with live updates</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Model Management</strong> - Version control and zero-downtime deployment</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Role-Based Access</strong> - Admin, Senior Lawyer, Junior Lawyer, Reviewer roles</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
