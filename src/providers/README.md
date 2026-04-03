# React Query Setup (FTASK-003)

This directory contains the TanStack Query (React Query) configuration for server state management.

## Files

### QueryProvider.tsx
Global React Query provider with configured defaults:
- **Case data**: 5 minute stale time
- **Search results**: 1 minute stale time (default)
- **Retry logic**: 3 retries with exponential backoff
- **Devtools**: Available in development mode only

## Usage

The QueryProvider is already integrated in the root layout (`src/app/layout.tsx`).

### Example: Using Query Hooks

```typescript
import { useCaseDetail } from '@/hooks/use-case-queries';

function CaseView({ caseId }: { caseId: string }) {
  const { data, isLoading, error } = useCaseDetail(caseId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data.title}</div>;
}
```

### Example: Using Mutation Hooks

```typescript
import { useCreateCase } from '@/hooks/use-case-queries';

function CreateCaseForm() {
  const createCase = useCreateCase();
  
  const handleSubmit = async (data) => {
    await createCase.mutateAsync({
      title: data.title,
      draftType: data.draftType,
      rawFacts: data.rawFacts,
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Query Keys

All query keys are centralized in `src/lib/query-keys.ts` for type-safe cache management.

Example query keys:
- `queryKeys.cases.detail(caseId)` → `['cases', caseId]`
- `queryKeys.pageIndex.search(query, type)` → `['pageIndex', 'search', { query, type }]`
- `queryKeys.chronology.events(caseId)` → `['chronology', caseId, 'events']`

## Stale Time Configuration

- **Case data** (5 minutes): Cases, chronology events, interrogation summaries
- **Search results** (1 minute): PageIndex search, general queries
- **Static data** (5 minutes): Statistics, configuration data

## Retry Configuration

- **Queries**: 3 retries with exponential backoff (1s, 2s, 4s, max 30s)
- **Mutations**: 1 retry with 1s delay

## React Query Devtools

In development mode, the devtools are available in the bottom-right corner of the screen. Use them to:
- Inspect query cache
- View query states
- Debug refetch behavior
- Monitor network requests
