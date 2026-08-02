import { useState } from 'react'
import { X, Plus, AlertOctagon, Search } from 'lucide-react'
import { medicalService } from '../../services/chat'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'

export default function DrugInteraction() {
  const [drugs, setDrugs] = useState<string[]>([])
  const [newDrug, setNewDrug] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const addDrug = () => {
    const d = newDrug.trim()
    if (d && !drugs.includes(d)) {
      setDrugs([...drugs, d])
      setNewDrug('')
    }
  }

  const removeDrug = (d: string) => setDrugs(drugs.filter((x) => x !== d))

  const handleCheck = async () => {
    if (drugs.length < 2) { toast.error('Add at least 2 medications'); return }
    setLoading(true)
    setResult('')
    try {
      const data = await medicalService.checkDrugInteractions(drugs)
      setResult(data.result)
    } catch {
      toast.error('Failed to check drug interactions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg text-sm">
        <AlertOctagon size={16} />
        <span>Drug interactions can be serious. Always consult your pharmacist or doctor before combining medications.</span>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={newDrug}
            onChange={(e) => setNewDrug(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDrug()}
            placeholder="Enter medication name (e.g. Aspirin, Warfarin)"
            className="flex-1"
          />
          <Button onClick={addDrug} icon={<Plus size={16} />}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {drugs.map((d) => (
            <span key={d} className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
              {d}
              <button onClick={() => removeDrug(d)}><X size={14} /></button>
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Add {Math.max(0, 2 - drugs.length)} more medication{drugs.length < 1 ? 's' : ''} to check interactions.</p>
      </div>

      <Button onClick={handleCheck} loading={loading} disabled={drugs.length < 2} icon={<Search size={16} />} className="w-full">
        Check Interactions ({drugs.length} medications)
      </Button>

      {result && (
        <div className="card p-5 prose-medical animate-fade-in">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
