/**
 * Team Portal Types
 * 
 * Type definitions for the team portal.
 */

export type TeamRole = 'admin' | 'senior_lawyer' | 'junior_lawyer' | 'reviewer';

export interface TeamUser {
  id: string;
  email: string;
  name: string;
  role: TeamRole;
  isActive: boolean;
}

export interface TeamTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TeamDocument {
  id: string;
  title: string;
  sourceType: 'pdf' | 'url' | 'manual';
  status: 'pending' | 'extracted' | 'indexed' | 'failed';
  createdAt: string;
}

export interface TeamAnnotation {
  id: string;
  documentId: string;
  originalText: string;
  correctedText: string;
  label: 'FACT' | 'DATE' | 'PARTY' | 'CLAUSE' | 'ERROR' | 'CORRECTION';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface TeamTrainingJob {
  jobId: string;
  status: 'queued' | 'preprocessing' | 'training' | 'exporting' | 'complete' | 'failed';
  datasetSize?: number;
  metrics?: any;
  startedAt?: string;
  completedAt?: string;
}

export interface TeamModel {
  id: string;
  versionTag: string;
  environment: 'staging' | 'production';
  valLoss?: number;
  valAccuracy?: number;
  createdAt: string;
}
