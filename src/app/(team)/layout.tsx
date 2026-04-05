/**
 * Team Portal Layout
 * 
 * Layout for internal team portal pages (annotation, training, model management)
 */

import { ReactNode } from 'react';

export default function TeamLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Team Portal Header */}
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Lawtus Trainer</h1>
              <p className="text-sm text-indigo-200">Internal AI Training Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="/team/dashboard" className="hover:text-indigo-200">Dashboard</a>
              <a href="/team/ingest" className="hover:text-indigo-200">Ingest</a>
              <a href="/team/studio" className="hover:text-indigo-200">Studio</a>
              <a href="/team/training" className="hover:text-indigo-200">Training</a>
              <a href="/team/models" className="hover:text-indigo-200">Models</a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
