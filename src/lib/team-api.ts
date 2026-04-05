/**
 * Team Portal API Client
 * 
 * API client for team portal backend.
 */

import type { TeamUser, TeamTokens, TeamDocument, TeamAnnotation, TeamTrainingJob, TeamModel } from '@/types/team';

const API_URL = process.env.NEXT_PUBLIC_TEAM_API_URL || 'http://127.0.0.1:4000';

class TeamAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'TeamAPIError';
  }
}

async function teamFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new TeamAPIError(
      error.message || 'Request failed',
      response.status,
      error.code
    );
  }

  return response.json();
}

// ============================================================================
// Team Auth API
// ============================================================================

export const teamAuthAPI = {
  async sendOTP(email: string): Promise<{ message: string; expiresInSeconds: number }> {
    return teamFetch('/team/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyOTP(email: string, otp: string): Promise<{
    user: TeamUser;
    tokens: TeamTokens;
  }> {
    return teamFetch('/team/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  async refresh(refreshToken: string, sessionId: string): Promise<TeamTokens> {
    return teamFetch('/team/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken, sessionId }),
    });
  },

  async me(accessToken: string): Promise<{
    user: TeamUser;
    session: { id: string };
  }> {
    return teamFetch('/team/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async logout(accessToken: string, sessionId: string): Promise<{ success: boolean }> {
    return teamFetch('/team/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ sessionId }),
    });
  },
};

// ============================================================================
// Team Documents API
// ============================================================================

export const teamDocumentsAPI = {
  async list(accessToken: string): Promise<{ documents: TeamDocument[] }> {
    return teamFetch('/team/documents', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async upload(
    accessToken: string,
    data: {
      title: string;
      sourceType: 'pdf' | 'url' | 'manual';
      sourceUrl?: string;
      extractedText?: string;
    }
  ): Promise<{ id: string; title: string; status: string }> {
    return teamFetch('/team/documents/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// Team Annotations API
// ============================================================================

export const teamAnnotationsAPI = {
  async list(accessToken: string): Promise<{ annotations: TeamAnnotation[] }> {
    return teamFetch('/team/annotations', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async create(
    accessToken: string,
    data: {
      documentId: string;
      originalText: string;
      correctedText: string;
      label: 'FACT' | 'DATE' | 'PARTY' | 'CLAUSE' | 'ERROR' | 'CORRECTION';
    }
  ): Promise<{ id: string; status: string }> {
    return teamFetch('/team/annotations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  async approve(accessToken: string, annotationId: string): Promise<{ success: boolean }> {
    return teamFetch(`/team/annotations/${annotationId}/approve`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ annotationId }),
    });
  },

  async reject(accessToken: string, annotationId: string): Promise<{ success: boolean }> {
    return teamFetch(`/team/annotations/${annotationId}/reject`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ annotationId }),
    });
  },
};

// ============================================================================
// Team Training API
// ============================================================================

export const teamTrainingAPI = {
  async start(
    accessToken: string,
    config: {
      baseModel?: string;
      epochs?: number;
      batchSize?: number;
      learningRate?: number;
      loraR?: number;
      loraAlpha?: number;
    }
  ): Promise<{ jobId: string; status: string }> {
    return teamFetch('/team/training/start', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ config }),
    });
  },

  async getStatus(accessToken: string, jobId: string): Promise<TeamTrainingJob> {
    return teamFetch(`/team/training/${jobId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async stop(accessToken: string, jobId: string): Promise<{ success: boolean }> {
    return teamFetch(`/team/training/${jobId}/stop`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ jobId }),
    });
  },
};

// ============================================================================
// Team Models API
// ============================================================================

export const teamModelsAPI = {
  async list(accessToken: string): Promise<{ models: TeamModel[] }> {
    return teamFetch('/team/models', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async promote(accessToken: string, modelId: string): Promise<{ success: boolean }> {
    return teamFetch(`/team/models/${modelId}/promote`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ modelId }),
    });
  },

  async rollback(accessToken: string, modelId: string): Promise<{ success: boolean }> {
    return teamFetch(`/team/models/${modelId}/rollback`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ modelId }),
    });
  },
};
