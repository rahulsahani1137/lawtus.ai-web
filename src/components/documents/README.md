# Document Upload Components

This directory contains components for uploading and managing legal documents in the CLDI system.

## Components

### DocumentUploadZone

A drag-and-drop document upload component that integrates with the CLDI Documents API.

**Features:**
- Drag-and-drop file upload
- Multiple file upload support
- Real-time upload progress tracking
- File type validation (PDF, DOCX, JPEG, PNG, TIFF)
- File size validation (max 10MB)
- Upload status indicators (uploading, processing, complete, error)
- Automatic error handling with user feedback

**Usage:**

```tsx
import { DocumentUploadZone } from '@/components/documents/upload-zone'

function MyComponent() {
  const handleUploadComplete = (result) => {
    console.log('Document uploaded:', result)
    // Access extracted details:
    // - result.documentId
    // - result.extractedText
    // - result.extractedDetails (dates, sections, parties, summary)
    // - result.ocrConfidence (for scanned documents)
  }

  return (
    <DocumentUploadZone
      caseId="case-123"
      documentType="fir"
      onUploadComplete={handleUploadComplete}
    />
  )
}
```

**Props:**

- `caseId` (required): The case ID to associate uploaded documents with
- `documentType` (optional): Type of document being uploaded
  - Options: `'fir' | 'arrest_memo' | 'court_order' | 'agreement' | 'notice' | 'other'`
  - Default: `'other'`
- `onUploadComplete` (optional): Callback function called when upload completes successfully
- `className` (optional): Additional CSS classes

### ExtractedDetailsDisplay

A component to display extracted details from uploaded documents.

**Usage:**

```tsx
import { ExtractedDetailsDisplay } from '@/components/documents/upload-zone'

function MyComponent({ details, ocrConfidence }) {
  return (
    <ExtractedDetailsDisplay
      details={details}
      ocrConfidence={ocrConfidence}
    />
  )
}
```

**Props:**

- `details` (required): Extracted details object containing:
  - `dates`: Array of extracted dates
  - `sections`: Array of legal sections invoked
  - `parties`: Array of party names
  - `documentType`: Detected document type
  - `summary`: Document summary
- `ocrConfidence` (optional): OCR confidence score (0-1)

### DocumentUploadZoneExample

A complete example component demonstrating the upload zone with extracted details display.

**Usage:**

```tsx
import { DocumentUploadZoneExample } from '@/components/documents/upload-zone-example'

function MyPage() {
  return (
    <DocumentUploadZoneExample
      caseId="case-123"
      documentType="fir"
    />
  )
}
```

## Hooks

### useDocumentUpload

A React hook for managing document uploads to the CLDI Documents API.

**Usage:**

```tsx
import { useDocumentUpload } from '@/hooks/useDocumentUpload'

function MyComponent() {
  const { uploadDocument, uploadMultiple, uploads } = useDocumentUpload({
    caseId: 'case-123',
    documentType: 'fir',
    onSuccess: (result) => {
      console.log('Upload successful:', result)
    },
    onError: (error) => {
      console.error('Upload failed:', error)
    },
  })

  const handleFileSelect = async (file: File) => {
    await uploadDocument(file)
  }

  const handleMultipleFiles = async (files: File[]) => {
    await uploadMultiple(files)
  }

  return (
    <div>
      {/* Display upload progress */}
      {Array.from(uploads.entries()).map(([id, upload]) => (
        <div key={id}>
          {upload.filename}: {upload.progress}% ({upload.status})
        </div>
      ))}
    </div>
  )
}
```

**Options:**

- `caseId` (required): Case ID for document association
- `documentType` (optional): Document type classification
- `onSuccess` (optional): Success callback
- `onError` (optional): Error callback

**Returns:**

- `uploadDocument(file: File)`: Upload a single file
- `uploadMultiple(files: File[])`: Upload multiple files
- `uploads`: Map of active uploads with progress tracking

## API Integration

The components integrate with the CLDI Documents API through a Next.js API route:

**Endpoint:** `POST /api/cldi-documents/upload`

**Request Format:**
```json
{
  "filename": "document.pdf",
  "contentType": "application/pdf",
  "data": "base64EncodedFileData",
  "caseId": "case-123",
  "documentType": "fir",
  "metadata": {
    "title": "Document Title"
  }
}
```

**Response Format:**
```json
{
  "documentId": "doc-123",
  "filename": "document.pdf",
  "extractedText": "Full extracted text...",
  "extractedDetails": {
    "dates": ["2024-01-01"],
    "sections": ["Section 302 IPC"],
    "parties": ["Party A", "Party B"],
    "documentType": "fir",
    "summary": "Document summary..."
  },
  "ocrConfidence": 0.95,
  "uploadedAt": "2024-01-01T00:00:00Z"
}
```

## Environment Variables

Add to `.env.local`:

```env
ENCORE_API_URL=http://127.0.0.1:4000
```

## Testing

Run tests with:

```bash
bunx vitest run useDocumentUpload.test.ts
```

## Supported File Types

- **PDF**: `.pdf`
- **Word Documents**: `.docx`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.tiff`, `.tif`

Maximum file size: 10MB

## Features

### Automatic OCR

Scanned documents and images are automatically processed with OCR. The confidence score is displayed to the user.

### Extracted Details

The system automatically extracts:
- **Dates**: All dates mentioned in the document
- **Legal Sections**: IPC/BNSS sections invoked
- **Parties**: Names of parties involved
- **Document Type**: Automatic classification
- **Summary**: AI-generated summary

### Error Handling

- File type validation
- File size validation
- Network error handling
- User-friendly error messages
- Automatic retry on transient failures

### Progress Tracking

- Upload progress (0-50%)
- Processing progress (50-100%)
- Status indicators (uploading, processing, complete, error)
- Real-time updates

## Architecture

```
User Interface
    ↓
DocumentUploadZone Component
    ↓
useDocumentUpload Hook
    ↓
Next.js API Route (/api/cldi-documents/upload)
    ↓
Encore Backend (CLDI Documents Service)
    ↓
Document Processing (OCR, Extraction, Storage)
```

## Notes

- Files are converted to base64 before upload
- Upload progress is tracked in component state
- Completed uploads are automatically removed after 2 seconds
- Failed uploads are removed after 3 seconds
- Toast notifications provide user feedback
