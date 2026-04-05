'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { teamAnnotationsAPI } from '@/lib/team-api';
import type { TeamDocument } from '@/types/team';

interface AnnotationEditorProps {
  document: TeamDocument;
  accessToken: string;
}

type AnnotationLabel = 'FACT' | 'DATE' | 'PARTY' | 'CLAUSE' | 'ERROR' | 'CORRECTION';

const LABELS: { value: AnnotationLabel; label: string; color: string }[] = [
  { value: 'FACT', label: 'Fact', color: 'bg-blue-200' },
  { value: 'DATE', label: 'Date', color: 'bg-green-200' },
  { value: 'PARTY', label: 'Party', color: 'bg-purple-200' },
  { value: 'CLAUSE', label: 'Clause', color: 'bg-yellow-200' },
  { value: 'ERROR', label: 'Error', color: 'bg-red-200' },
  { value: 'CORRECTION', label: 'Correction', color: 'bg-teal-200' },
];

export function AnnotationEditor({ document, accessToken }: AnnotationEditorProps) {
  const [selectedLabel, setSelectedLabel] = useState<AnnotationLabel>('FACT');
  const [correctedText, setCorrectedText] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: document.extractedText || '<p>No text extracted yet.</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  const handleHighlight = () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) {
      setMessage({ type: 'error', text: 'Please select text to highlight' });
      return;
    }

    const labelColor = LABELS.find((l) => l.value === selectedLabel)?.color || 'bg-yellow-200';
    editor.chain().focus().setHighlight({ color: labelColor }).run();
  };

  const handleSaveAnnotation = async () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) {
      setMessage({ type: 'error', text: 'Please select text to annotate' });
      return;
    }

    const originalText = editor.state.doc.textBetween(from, to);

    if (!correctedText.trim()) {
      setMessage({ type: 'error', text: 'Please enter corrected text' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await teamAnnotationsAPI.create(accessToken, {
        documentId: document.id,
        originalText,
        correctedText,
        label: selectedLabel,
      });

      setMessage({ type: 'success', text: 'Annotation saved successfully!' });
      setCorrectedText('');
      
      // Clear selection
      editor.commands.setTextSelection({ from: to, to });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save annotation',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClearHighlights = () => {
    if (!editor) return;
    editor.chain().focus().unsetHighlight().run();
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{document.title}</h2>
          <button
            onClick={handleClearHighlights}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Highlights
          </button>
        </div>

        {/* Label Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Label:</span>
          {LABELS.map((label) => (
            <button
              key={label.value}
              onClick={() => setSelectedLabel(label.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedLabel === label.value
                  ? `${label.color} ring-2 ring-offset-1 ring-gray-900`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label.label}
            </button>
          ))}
          <button
            onClick={handleHighlight}
            className="ml-auto px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Highlight Selected
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="border-b border-gray-200">
        <EditorContent editor={editor} />
      </div>

      {/* Annotation Form */}
      <div className="p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Create Annotation</h3>
        
        {message && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selected Text
            </label>
            <div className="p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900">
              {editor.state.selection.empty
                ? 'No text selected'
                : editor.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to
                  )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corrected Text
            </label>
            <textarea
              value={correctedText}
              onChange={(e) => setCorrectedText(e.target.value)}
              placeholder="Enter the corrected version of the selected text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Label: <span className="font-medium">{selectedLabel}</span>
            </div>
            <button
              onClick={handleSaveAnnotation}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Annotation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
