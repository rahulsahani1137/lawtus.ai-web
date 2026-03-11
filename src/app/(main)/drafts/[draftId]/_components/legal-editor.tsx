'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const MonacoEditor = dynamic(
    () => import('@monaco-editor/react').then((mod) => mod.default),
    {
        ssr: false,
        loading: () => <Skeleton className="h-full w-full" />,
    },
)

export function LegalEditor({
    content,
    onChange,
}: {
    content: string
    onChange: (value: string) => void
}) {
    return (
        <div className="h-full">
            <MonacoEditor
                height="100%"
                language="plaintext"
                value={content}
                onChange={(value) => onChange(value ?? '')}
                options={{
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    fontSize: 15,
                    fontFamily: 'JetBrains Mono, Consolas, monospace',
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    lineHeight: 24,
                    renderLineHighlight: 'line',
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                }}
                theme="vs"
            />
        </div>
    )
}
