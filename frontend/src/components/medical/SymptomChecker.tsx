import { useState } from 'react'
import { X, Plus, Search, AlertTriangle } from 'lucide-react'
import { medicalService } from '../../services/chat'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [newSymptom, setNewSymptom] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [duration, setDuration] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const addSymptom = () => {
    const s = newSymptom.trim()
    if (s && !symptoms.includes(s)) {
      setSymptoms([...symptoms, s])
      setNewSymptom('')
    }
  }

  const removeSymptom = (s: string) => setSymptoms(symptoms.filter((x) => x !== s))

  const handleCheck = async () => {
    if (!symptoms.length) { toast.error('Add at least one symptom'); return }
    setLoading(true)
    setResult('')
    try {
      const data = await medicalService.checkSymptoms({
        symptoms,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        duration: duration || undefined,
        additional_info: additionalInfo || undefined,
      })
      setResult(data.result)
    } catch {
      toast.error('Failed to analyze symptoms')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-lg text-sm">
        <AlertTriangle size={16} />
        <span>This is for informational purposes only. Always consult a healthcare professional.</span>
      </div>

      {/* Symptom input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={newSymptom}
            onChange={(e) => setNewSymptom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSymptom()}
            placeholder="Type a symptom (e.g. headache, fever)"
            className="flex-1"
          />
          <Button onClick={addSymptom} icon={<Plus size={16} />} size="md">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {symptoms.map((s) => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium">
              {s}
              <button onClick={() => removeSymptom(s)}><X size={14} /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Optional" />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field text-sm">
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Input label="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 3 days" />
        <Input label="Additional Info" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Any other context" />
      </div>

      <Button onClick={handleCheck} loading={loading} icon={<Search size={16} />} className="w-full">
        Analyze Symptoms
      </Button>

      {result && (
        <div className="card p-5 prose-medical animate-fade-in">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
