import { useState } from 'react'
import { FileSearch, AlertTriangle } from 'lucide-react'
import { medicalService } from '../../services/chat'
import Button from '../ui/Button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'

const REPORT_TYPES = [
  { value: 'blood', label: '🩸 Blood Test' },
  { value: 'ecg', label: '🫀 ECG/EKG' },
  { value: 'mri', label: '🧠 MRI' },
  { value: 'ct', label: '🫁 CT Scan' },
  { value: 'general', label: '📋 General Report' },
]

export default function ReportAnalyzer() {
  const [reportText, setReportText] = useState('')
  const [reportType, setReportType] = useState('blood')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!reportText.trim()) { toast.error('Paste your report text first'); return }
    setLoading(true)
    setResult('')
    try {
      const data = await medicalService.analyzeReport(reportText, reportType)
      setResult(data.result)
    } catch {
      toast.error('Failed to analyze report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-lg text-sm">
        <AlertTriangle size={16} />
        <span>AI analysis is not a substitute for professional medical interpretation. Discuss results with your doctor.</span>
      </div>

      {/* Report type selector */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Report Type</label>
        <div className="grid grid-cols-5 gap-2">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setReportType(type.value)}
              className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all duration-150 ${
                reportType === type.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-300'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report text */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paste Report Text</label>
        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="Paste the text content of your medical report here..."
          rows={8}
          className="input-field resize-none text-sm font-mono"
        />
      </div>

      <Button onClick={handleAnalyze} loading={loading} icon={<FileSearch size={16} />} className="w-full">
        Analyze Report
      </Button>

      {result && (
        <div className="card p-5 prose-medical animate-fade-in">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
