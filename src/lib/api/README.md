# API Client Library

Typed API client for all CLDI Encore backend services.

## Features

- ✅ **Typed Request/Response**: Full TypeScript support for all endpoints
- ✅ **Automatic Auth**: JWT tokens injected automatically from localStorage
- ✅ **Error Handling**: Typed error classes (APIError, NetworkError, ValidationError)
- ✅ **Retry Logic**: Automatic retries on network failures with exponential backoff
- ✅ **Timeout Support**: Configurable request timeouts (default 30s)
- ✅ **No Raw Fetch**: All HTTP calls go through the typed client

## Installation

The API client is already set up. Just import what you need:

```typescript
import { apiClient, interrogatorAPI, chronologyAPI } from '@/lib/api';
```

## Configuration

The base URL is configured via environment variable:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
```

## Usage

### Basic Example

```typescript
import { interrogatorAPI } from '@/lib/api';

// Start interrogation
const response = await interrogatorAPI.startInterrogation({
  caseId: 'case-123',
  context: 'Initial case facts...',
});

console.log(response.interrogationId);
```

### Error Handling

```typescript
import { APIError, NetworkError, ValidationError } from '@/lib/api';

try {
  await interrogatorAPI.startInterrogation({ caseId: 'invalid' });
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors (400)
    console.error('Validation failed:', error.fields);
  } else if (error instanceof APIError) {
    // Handle API errors (4xx, 5xx)
    console.error('API error:', error.statusCode, error.message);
  } else if (error instanceof NetworkError) {
    // Handle network failures
    console.error('Network error:', error.message);
  }
}
```

### Custom Configuration

```typescript
import { APIClient } from '@/lib/api';

const customClient = new APIClient({
  baseURL: 'https://api.example.com',
  getAuthToken: async () => {
    // Custom token retrieval
    return await getTokenFromSecureStorage();
  },
  onError: (error) => {
    // Custom error logging
    logToSentry(error);
  },
  defaultTimeout: 60000, // 60 seconds
});
```

## Available APIs

### 1. Interrogator API

AI-powered fact collection through dynamic Q&A.

```typescript
import { interrogatorAPI } from '@/lib/api';

// Start interrogation
await interrogatorAPI.startInterrogation({
  caseId: 'case-123',
  context: 'Initial facts...',
});

// Answer question
await interrogatorAPI.answerQuestion({
  interrogationId: 'int-456',
  questionId: 'q-789',
  answer: 'The arrest occurred on 2024-01-15',
});

// Get summary
const summary = await interrogatorAPI.getInterrogationSummary('case-123');
```

### 2. Chronology API

Timeline building and event management.

```typescript
import { chronologyAPI } from '@/lib/api';

// Build chronology
await chronologyAPI.buildChronology({ caseId: 'case-123' });

// Get events
const { events } = await chronologyAPI.getChronology({ caseId: 'case-123' });

// Add event
await chronologyAPI.addEvent({
  caseId: 'case-123',
  date: '2024-01-15',
  description: 'Arrest occurred',
  category: 'procedural',
});

// Check contradictions
const { contradictions } = await chronologyAPI.checkContradictions({
  caseId: 'case-123',
});
```

### 3. CLDI Documents API

Legal document upload and processing.

```typescript
import { cldiDocumentsAPI } from '@/lib/api';

// Upload file
const file = document.querySelector('input[type="file"]').files[0];
const response = await cldiDocumentsAPI.uploadFile(
  file,
  'case-123',
  'fir' // document type
);

console.log(response.extractedText);
console.log(response.extractedDetails.dates);

// Get case documents
const { documents } = await cldiDocumentsAPI.getCaseDocuments('case-123');
```

### 4. PageIndex API

Legacy draft search for structural patterns.

```typescript
import { pageIndexAPI } from '@/lib/api';

// Search pages
const { pages } = await pageIndexAPI.searchPages({
  query: 'bail application structure',
  draftType: 'bail',
  limit: 5,
});

// Get stats
const stats = await pageIndexAPI.getStats();
console.log(stats.totalPages);
```

### 5. Storage API

Document storage operations using MinIO.

```typescript
import { storageAPI } from '@/lib/api';

// Upload file
const file = document.querySelector('input[type="file"]').files[0];
const response = await storageAPI.uploadFile(file);

console.log(response.key); // Storage key
console.log(response.url); // Access URL

// Download file
const downloadedFile = await storageAPI.downloadAsFile(response.key);

// Get presigned URL
const url = await storageAPI.getDownloadUrl(response.key, 3600); // 1 hour
```

## Convenience Functions

Each API module includes convenience functions for common workflows:

### Interrogator

```typescript
// Start interrogation and get first questions
const { interrogationId, questions } = await interrogatorAPI.startInterrogationFlow(
  'case-123',
  'Initial facts...'
);

// Answer and get next questions
const { complete, nextQuestions } = await interrogatorAPI.answerAndContinue(
  interrogationId,
  questionId,
  'Answer text'
);
```

### Chronology

```typescript
// Build and get chronology in one call
const events = await chronologyAPI.buildAndGetChronology('case-123');

// Verify and check contradictions
const { isValid, issues, contradictions } = 
  await chronologyAPI.verifyAndCheckContradictions('case-123');
```

### CLDI Documents

```typescript
// Upload multiple files
const files = Array.from(document.querySelector('input[type="file"]').files);
const responses = await cldiDocumentsAPI.uploadMultipleFiles(files, 'case-123');

// Get documents with extracted dates
const docsWithDates = await cldiDocumentsAPI.getDocumentsWithDates('case-123');
```

### Storage

```typescript
// Upload multiple files
const files = Array.from(document.querySelector('input[type="file"]').files);
const responses = await storageAPI.uploadMultipleFiles(files);
```

## Request Configuration

All API functions accept optional configuration:

```typescript
await interrogatorAPI.startInterrogation(
  { caseId: 'case-123' },
  {
    retry: true,        // Enable retries (default: true)
    retries: 3,         // Number of retries (default: 3)
    retryDelay: 1000,   // Initial delay in ms (default: 1000)
    timeout: 30000,     // Request timeout in ms (default: 30000)
  }
);
```

## Error Types

### APIError

Thrown for HTTP errors (4xx, 5xx).

```typescript
class APIError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;
}
```

### NetworkError

Thrown for network failures (connection refused, timeout, etc.).

```typescript
class NetworkError extends Error {
  originalError?: unknown;
}
```

### ValidationError

Thrown for validation errors (400 with field errors).

```typescript
class ValidationError extends APIError {
  fields?: Record<string, string[]>;
}
```

## Testing

The API client includes comprehensive tests:

```bash
bun test src/lib/api/__tests__/client.test.ts
```

## Best Practices

1. **Always handle errors**: Use try-catch blocks and check error types
2. **Use convenience functions**: They handle common workflows
3. **Set appropriate timeouts**: Long operations may need longer timeouts
4. **Don't retry on user errors**: 4xx errors are not retried automatically
5. **Use TypeScript**: Full type safety for all requests/responses

## Architecture

```
lib/api/
├── client.ts              # Base API client with retry logic
├── interrogator.ts        # Interrogator endpoints
├── chronology.ts          # Chronology endpoints
├── cldi-documents.ts      # CLDI documents endpoints
├── pageindex.ts           # PageIndex endpoints
├── storage.ts             # Storage endpoints
├── index.ts               # Central export point
└── __tests__/
    └── client.test.ts     # API client tests
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000

# Optional (defaults shown)
# None - all configuration is in code
```

## Contributing

When adding new endpoints:

1. Add types to the appropriate API file
2. Add API function with proper typing
3. Add convenience functions if needed
4. Export types in `index.ts`
5. Update this README

## License

Internal use only - Part of Lawtus.ai CLDI system.
