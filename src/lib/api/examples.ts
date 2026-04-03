/**
 * API Client Usage Examples
 * 
 * This file demonstrates how to use the API client in various scenarios.
 * These are examples only - not meant to be imported or executed directly.
 */

import {
  interrogatorAPI,
  chronologyAPI,
  cldiDocumentsAPI,
  pageIndexAPI,
  storageAPI,
  APIError,
  NetworkError,
  ValidationError,
} from './index';

// ============================================================================
// Example 1: Complete Interrogation Flow
// ============================================================================

async function exampleInterrogationFlow(caseId: string) {
  try {
    // Start interrogation
    console.log('Starting interrogation...');
    const { interrogationId, questions } = await interrogatorAPI.startInterrogationFlow(
      caseId,
      'The accused was arrested on January 15, 2024...'
    );

    console.log(`Interrogation started: ${interrogationId}`);
    console.log(`Initial questions: ${questions.length}`);

    // Answer questions
    for (const question of questions) {
      console.log(`Q: ${question.question}`);
      
      // In a real app, you'd get the answer from user input
      const answer = 'User answer here...';
      
      const { complete, nextQuestions } = await interrogatorAPI.answerAndContinue(
        interrogationId,
        question.id,
        answer
      );

      if (complete) {
        console.log('Interrogation complete!');
        break;
      }

      if (nextQuestions.length > 0) {
        console.log(`Generated ${nextQuestions.length} follow-up questions`);
      }
    }

    // Get final summary
    const summary = await interrogatorAPI.getInterrogationSummary(caseId);
    console.log(`Total questions: ${summary.totalQuestions}`);
    console.log(`Completion: ${summary.completionPercentage}%`);

  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation error:', error.fields);
    } else if (error instanceof APIError) {
      console.error('API error:', error.statusCode, error.message);
    } else if (error instanceof NetworkError) {
      console.error('Network error:', error.message);
    }
  }
}

// ============================================================================
// Example 2: Chronology Building with Contradiction Detection
// ============================================================================

async function exampleChronologyFlow(caseId: string) {
  try {
    // Build chronology from case data
    console.log('Building chronology...');
    const events = await chronologyAPI.buildAndGetChronology(caseId);
    console.log(`Extracted ${events.length} events`);

    // Display events
    for (const event of events) {
      console.log(`${event.date}: ${event.description}`);
    }

    // Verify and check for contradictions
    console.log('Checking for contradictions...');
    const { isValid, issues, contradictions } = 
      await chronologyAPI.verifyAndCheckContradictions(caseId);

    if (!isValid) {
      console.log(`Found ${issues.length} issues:`);
      for (const issue of issues) {
        console.log(`- ${issue.type}: ${issue.description}`);
      }
    }

    if (contradictions.length > 0) {
      console.log(`Found ${contradictions.length} contradictions:`);
      for (const contradiction of contradictions) {
        console.log(`- ${contradiction.description}`);
        console.log(`  Source A: ${contradiction.sourceA}`);
        console.log(`  Source B: ${contradiction.sourceB}`);

        // Resolve contradiction
        await chronologyAPI.resolveContradiction({
          caseId,
          contradictionId: contradiction.id,
          resolution: 'User resolution here...',
        });
      }
    }

    // Add manual event
    await chronologyAPI.addEvent({
      caseId,
      date: '2024-01-20',
      description: 'Additional event added manually',
      category: 'neutral',
      metadata: {
        legalRelevance: 'Provides context for the case',
      },
    });

  } catch (error) {
    console.error('Chronology error:', error);
  }
}

// ============================================================================
// Example 3: Document Upload and Processing
// ============================================================================

async function exampleDocumentUpload(caseId: string, files: File[]) {
  try {
    console.log(`Uploading ${files.length} documents...`);

    // Upload multiple files
    const responses = await cldiDocumentsAPI.uploadMultipleFiles(
      files,
      caseId,
      'fir' // document type
    );

    for (const response of responses) {
      console.log(`Uploaded: ${response.filename}`);
      console.log(`Extracted text length: ${response.extractedText.length}`);
      console.log(`Dates found: ${response.extractedDetails.dates.join(', ')}`);
      console.log(`Sections: ${response.extractedDetails.sections.join(', ')}`);
      
      if (response.ocrConfidence) {
        console.log(`OCR confidence: ${response.ocrConfidence}%`);
      }
    }

    // Get all documents for case
    const { documents } = await cldiDocumentsAPI.getCaseDocuments(caseId);
    console.log(`Total documents for case: ${documents.length}`);

    // Get documents with dates
    const docsWithDates = await cldiDocumentsAPI.getDocumentsWithDates(caseId);
    console.log(`Documents with dates: ${docsWithDates.length}`);

  } catch (error) {
    console.error('Document upload error:', error);
  }
}

// ============================================================================
// Example 4: PageIndex Search for Structural Patterns
// ============================================================================

async function examplePageIndexSearch(draftType: 'bail' | 'injunction' | 'writ') {
  try {
    // Search for structural patterns
    const patterns = await pageIndexAPI.searchStructuralPatterns(
      'bail application structure grounds',
      draftType,
      5
    );

    console.log(`Found ${patterns.length} structural patterns:`);
    for (const pattern of patterns) {
      console.log('---');
      console.log(pattern.substring(0, 200) + '...');
    }

    // Get statistics
    const stats = await pageIndexAPI.getStats();
    console.log(`Total pages indexed: ${stats.totalPages}`);
    console.log(`Bail applications: ${stats.byType.bail}`);
    console.log(`Injunctions: ${stats.byType.injunction}`);
    console.log(`Writs: ${stats.byType.writ}`);

    // Check if populated
    const isPopulated = await pageIndexAPI.isPageIndexPopulated();
    if (!isPopulated) {
      console.warn('PageIndex is empty - run ingestion first');
    }

  } catch (error) {
    console.error('PageIndex search error:', error);
  }
}

// ============================================================================
// Example 5: Storage Operations
// ============================================================================

async function exampleStorageOperations(file: File) {
  try {
    // Upload file
    console.log('Uploading to storage...');
    const uploadResponse = await storageAPI.uploadFile(file, 'documents', {
      userId: 'user-123',
      caseId: 'case-456',
    });

    console.log(`Uploaded: ${uploadResponse.key}`);
    console.log(`URL: ${uploadResponse.url}`);

    // Get presigned URL for temporary access
    const presignedUrl = await storageAPI.getDownloadUrl(
      uploadResponse.key,
      3600 // 1 hour
    );
    console.log(`Presigned URL: ${presignedUrl}`);

    // Download file
    const downloadedFile = await storageAPI.downloadAsFile(uploadResponse.key);
    console.log(`Downloaded: ${downloadedFile.name}`);

    // Delete file
    await storageAPI.deleteDocument({ key: uploadResponse.key });
    console.log('File deleted');

  } catch (error) {
    console.error('Storage error:', error);
  }
}

// ============================================================================
// Example 6: Error Handling Patterns
// ============================================================================

async function exampleErrorHandling(caseId: string) {
  try {
    await interrogatorAPI.startInterrogation({ caseId });
  } catch (error) {
    // Pattern 1: Type-based error handling
    if (error instanceof ValidationError) {
      // Handle validation errors
      console.error('Validation failed:');
      for (const [field, errors] of Object.entries(error.fields || {})) {
        console.error(`  ${field}: ${errors.join(', ')}`);
      }
    } else if (error instanceof APIError) {
      // Handle API errors
      switch (error.statusCode) {
        case 401:
          console.error('Unauthorized - please log in');
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Not found - case does not exist');
          break;
        case 500:
          console.error('Server error - please try again later');
          break;
        default:
          console.error(`API error ${error.statusCode}: ${error.message}`);
      }
    } else if (error instanceof NetworkError) {
      // Handle network errors
      console.error('Network error - check your connection');
    } else {
      // Handle unknown errors
      console.error('Unexpected error:', error);
    }
  }
}

// ============================================================================
// Example 7: Custom Configuration
// ============================================================================

import { APIClient } from './client';

function exampleCustomClient() {
  // Create a custom client with different configuration
  const customClient = new APIClient({
    baseURL: 'https://api.production.example.com',
    getAuthToken: async () => {
      // Custom token retrieval (e.g., from secure storage)
      const token = await getTokenFromSecureStorage();
      return token;
    },
    onError: (error) => {
      // Custom error logging (e.g., to Sentry)
      if (error instanceof APIError && error.statusCode >= 500) {
        logToSentry(error);
      }
    },
    defaultTimeout: 60000, // 60 seconds for slow operations
  });

  // Use custom client
  return customClient.get('/custom-endpoint');
}

// Mock functions for example
async function getTokenFromSecureStorage(): Promise<string> {
  return 'token';
}

function logToSentry(error: Error): void {
  console.error('Sentry:', error);
}

// ============================================================================
// Export examples (for documentation purposes only)
// ============================================================================

export const examples = {
  exampleInterrogationFlow,
  exampleChronologyFlow,
  exampleDocumentUpload,
  examplePageIndexSearch,
  exampleStorageOperations,
  exampleErrorHandling,
  exampleCustomClient,
};
