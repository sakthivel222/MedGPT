import { useState } from 'react'
import { Search, Pill } from 'lucide-react'
import { medicalService } from '../../services/chat'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'

const POPULAR = ['Aspirin', 'Metformin', 'Lisinopril', 'Atorvastatin', 'Amoxicillin', 'Omeprazole']

export default function MedicineInfo() {
  const [medicine, setMedicine] = useState('')
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (med?: string) => {
    const m = med || medicine.trim()
    if (!m) { toast.error('Enter a medicine name'); return }
    setLoading(true)
    setResult('')
    try {
      const data = await medicalService.getMedicineInfo(m, question || undefined)
      setResult(data.result)
      if (med) setMedicine(med)
    } catch {
      toast.error('Failed to get medicine information')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Popular */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Common medications:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map((m) => (
            <button
              key={m}
              onClick={() => handleSearch(m)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
            >
              <Pill size={12} /> {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Input
          label="Medicine name"
          value={medicine}
          onChange={(e) => setMedicine(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. Warfarin, Ibuprofen"
          icon={<Pill size={16} />}
        />
        <Input
          label="Specific question (optional)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What are the side effects?"
        />
      </div>

      <Button onClick={() => handleSearch()} loading={loading} icon={<Search size={16} />} className="w-full">
        Get Information
      </Button>

      {result && (
        <div className="card p-5 prose-medical animate-fade-in">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
