import { create } from 'zustand'

interface UploadingFile {
    name: string
    progress: number
}

interface DocumentsState {
    uploadingFiles: Map<string, UploadingFile>
}

const useDocumentsStore = create<DocumentsState>()(() => ({
    uploadingFiles: new Map(),
}))

export const useUploadingFiles = () =>
    useDocumentsStore((s) => s.uploadingFiles)

export const DocumentStoreActions = {
    setUploading(tempId: string, file: UploadingFile | null) {
        useDocumentsStore.setState((s) => {
            const m = new Map(s.uploadingFiles)
            if (file) m.set(tempId, file)
            else m.delete(tempId)
            return { uploadingFiles: m }
        })
    },
}

export default useDocumentsStore
