import { useState } from 'react'
import { medicalService } from '../../services/chat'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'
import { Calculator } from 'lucide-react'
import { classNames } from '../../utils/helpers'

const BMI_CATEGORIES = [
  { label: 'Underweight', range: '< 18.5', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  { label: 'Normal', range: '18.5 – 24.9', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
  { label: 'Overweight', range: '25 – 29.9', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
  { label: 'Obese', range: '≥ 30', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
]

export default function BMICalculator() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [result, setResult] = useState<{ bmi: number; category: string; analysis: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    if (!weight || !height) { toast.error('Enter weight and height'); return }
    setLoading(true)
    try {
      const data = await medicalService.calculateBMI({
        weight_kg: parseFloat(weight),
        height_cm: parseFloat(height),
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
      })
      setResult(data)
    } catch {
      toast.error('Failed to calculate BMI')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Weight (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
        <Input label="Height (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
        <Input label="Age (optional)" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="35" />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender (optional)</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field text-sm">
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* BMI categories reference */}
      <div className="grid grid-cols-4 gap-2">
        {BMI_CATEGORIES.map((cat) => (
          <div key={cat.label} className={classNames('rounded-lg p-2 text-center', cat.bg)}>
            <p className={classNames('text-xs font-semibold', cat.color)}>{cat.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{cat.range}</p>
          </div>
        ))}
      </div>

      <Button onClick={handleCalculate} loading={loading} icon={<Calculator size={16} />} className="w-full">
        Calculate BMI & Get Analysis
      </Button>

      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-6 text-center">
            <p className="text-5xl font-bold text-primary-600 dark:text-primary-400">{result.bmi}</p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-2">{result.category}</p>
          </div>
          <div className="card p-5 prose-medical">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
