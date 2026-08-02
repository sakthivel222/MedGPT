import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Trash2, CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react'
import { documentService } from '../services/chat'
import { formatFileSize, formatChatDate } from '../utils/helpers'
import type { Document } from '../types'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import { classNames } from '../utils/helpers'

export default function UploadPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const loadDocs = async () => {
    setLoading(true)
    try {
      const docs = await documentService.getDocuments()
      setDocuments(docs)
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDocs() }, [])

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      await documentService.uploadPDF(file, setProgress)
      toast.success(`"${file.name}" uploaded and processing...`)
      loadDocs()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  })

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await documentService.deleteDocument(id)
      setDocuments((d) => d.filter((x) => x.id !== id))
      toast.success('Document deleted')
    } catch {
      toast.error('Failed to delete document')
    }
  }

  const getStatusIcon = (doc: Document) => {
    if (doc.processing_error) return <AlertCircle size={16} className="text-red-500" />
    if (doc.is_processed) return <CheckCircle size={16} className="text-green-500" />
    return <Clock size={16} className="text-yellow-500 animate-spin" />
  }

  const getStatusLabel = (doc: Document) => {
    if (doc.processing_error) return 'Error'
    if (doc.is_processed) return `${doc.num_pages}p · ${doc.num_chunks} chunks`
    return 'Processing...'
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Upload PDF medical documents to enable RAG-powered chat about their contents
        </p>
      </div>

      {/* How it works */}
      <div className="card p-4 flex items-start gap-3 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <Zap size={20} className="text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-400">RAG-Powered Chat</p>
          <p className="text-sm text-primary-600/80 dark:text-primary-400/80 mt-1">
            After uploading, enable the ⚡ RAG toggle in the chat input to ask questions about your documents.
            The AI will search your PDFs and ground its answers in the actual content.
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={classNames(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50',
          uploading ? 'opacity-50 cursor-not-allowed' : '',
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-3">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading... {progress}%</p>
            <div className="w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-primary-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload size={36} className="mx-auto text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF, or click to browse'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF files only · Max 50MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Document list */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Your Documents ({documents.length})
        </h2>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : documents.length === 0 ? (
          <div className="card p-8 text-center">
            <FileText size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No documents yet. Upload your first PDF above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="card px-4 py-3 flex items-center gap-3">
                <FileText size={20} className="text-primary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{doc.original_filename}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getStatusIcon(doc)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">{getStatusLabel(doc)}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{formatFileSize(doc.file_size)}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{formatChatDate(doc.created_at)}</span>
                  </div>
                  {doc.processing_error && (
                    <p className="text-xs text-red-500 mt-1 truncate">{doc.processing_error}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(doc.id, doc.original_filename)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
