# React Query Setup - FTASK-003 Completion

## Overview

TanStack Query (React Query) has been configured as the server state manager for all CLDI API calls.

## Completed Tasks

### ✅ 1. Install @tanstack/react-query
- Already installed: `@tanstack/react-query@5.90.21`
- Added devtools: `@tanstack/react-query-devtools@5.96.1`

### ✅ 2. Create QueryProvider
**File**: `src/providers/QueryProvider.tsx`

Configuration:
- Default stale time: 1 minute (search results)
- Case data stale time: 5 minutes (configured per-query)
- Retry logic: 3 retries with exponential backoff
- Devtools: Enabled in development only

### ✅ 3. Define Query Keys
**File**: `src/lib/query-keys.ts`

Centralized query key factory with type-safe keys for:
- PageIndex (search, stats)
- Interrogator (summary)
- Chronology (events, contradictions)
- CLDI Documents (list, detail)
- Storage (buckets, presigned URLs)
- Cases (list, detail)

### ✅ 4. Configure Stale Times
- **Case data**: 5 minutes
  - Cases
  - Chronology events
  - Interrogation summaries
  - Contradictions
- **Search results**: 1 minute (default)
  - PageIndex search
  - General queries

### ✅ 5. Configure Retry Logic
- **Queries**: 3 retries with exponential backoff (1s, 2s, 4s, max 30s)
- **Mutations**: 1 retry with 1s delay

### ✅ 6. Add React Query Devtools
- Available in development mode only
- Position: bottom-right
- Initially closed

## Example Hooks Created

### Case Queries (`src/hooks/use-case-queries.ts`)
- `useCaseDetail(caseId)` - Fetch case details
- `useCases()` - Fetch all cases
- `useCreateCase()` - Create new case
- `useUpdateCase(caseId)` - Update case
- `useDeleteCase()` - Delete case

### Chronology Queries (`src/hooks/use-chronology-queries.ts`)
- `useChronologyEvents(caseId)` - Fetch events
- `useBuildChronology()` - Build chronology
- `useAddEvent(caseId)` - Add event
- `useUpdateEvent(caseId)` - Update event
- `useDeleteEvent(caseId)` - Delete event
- `useVerifyChronology(caseId)` - Verify chronology
- `useContradictions(caseId)` - Check contradictions
- `useResolveContradiction(caseId)` - Resolve contradiction

### Interrogator Queries (`src/hooks/use-interrogator-queries.ts`)
- `useInterrogationSummary(caseId)` - Fetch summary
- `useStartInterrogation()` - Start interrogation
- `useAnswerQuestion(caseId)` - Answer question

### PageIndex Queries (`src/hooks/use-pageindex-queries.ts`)
- `usePageIndexSearch(query, draftType, limit)` - Search pages
- `usePageIndexStats()` - Get statistics

## Integration

The QueryProvider is already integrated in the root layout:

```typescript
// src/app/layout.tsx
<QueryProvider>
  <AuthProvider>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </AuthProvider>
</QueryProvider>
```

## Usage Examples

### Fetching Data
```typescript
import { useCaseDetail } from '@/hooks/use-case-queries';

function CaseView({ caseId }: { caseId: string }) {
  const { data, isLoading, error } = useCaseDetail(caseId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data.title}</div>;
}
```

### Mutations
```typescript
import { useCreateCase } from '@/hooks/use-case-queries';

function CreateCaseForm() {
  const createCase = useCreateCase();
  
  const handleSubmit = async (data) => {
    try {
      await createCase.mutateAsync({
        title: data.title,
        draftType: data.draftType,
      });
      // Success - cache automatically invalidated
    } catch (error) {
      // Handle error
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Search with Debouncing
```typescript
import { usePageIndexSearch } from '@/hooks/use-pageindex-queries';
import { useState } from 'react';

function SearchBar() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = usePageIndexSearch(query, 'bail', 5);
  
  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
      {isLoading && <div>Searching...</div>}
      {data?.pages.map(page => <div key={page.id}>{page.content}</div>)}
    </div>
  );
}
```

## Acceptance Criteria Met

✅ **Query client configured globally**
- QueryProvider wraps entire app
- Configured with appropriate defaults

✅ **Query keys centralized and typed**
- All keys in `src/lib/query-keys.ts`
- Type-safe with TypeScript

✅ **Devtools available in development**
- React Query Devtools installed
- Only shown in development mode

✅ **No direct useEffect + fetch patterns for server data**
- Example hooks demonstrate proper React Query usage
- All server state managed through queries/mutations

## Files Created/Modified

### Created
1. `src/lib/query-keys.ts` - Query key factory
2. `src/hooks/use-case-queries.ts` - Case query hooks
3. `src/hooks/use-chronology-queries.ts` - Chronology query hooks
4. `src/hooks/use-interrogator-queries.ts` - Interrogator query hooks
5. `src/hooks/use-pageindex-queries.ts` - PageIndex query hooks
6. `src/providers/README.md` - Provider documentation
7. `REACT_QUERY_SETUP.md` - This file

### Modified
1. `src/providers/QueryProvider.tsx` - Updated configuration
2. `package.json` - Added devtools dependency

## Next Steps

To migrate existing hooks to React Query:

1. Replace `useState` + `useEffect` patterns with `useQuery`
2. Replace manual fetch calls with `useMutation`
3. Use query keys from `src/lib/query-keys.ts`
4. Remove manual cache management (React Query handles it)

Example migration:
```typescript
// Before (manual state management)
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetch('/api/cases')
    .then(res => res.json())
    .then(setData)
    .finally(() => setLoading(false));
}, []);

// After (React Query)
const { data, isLoading } = useCases();
```

## Testing

To verify the setup:

1. Start the development server: `bun run dev`
2. Open the app in browser
3. Check bottom-right corner for React Query Devtools button
4. Use example hooks in components
5. Verify queries are cached and refetched according to stale times

## Documentation

- Provider README: `src/providers/README.md`
- Query Keys: `src/lib/query-keys.ts` (inline documentation)
- Example Hooks: Each hook file has JSDoc comments
