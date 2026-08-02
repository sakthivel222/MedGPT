import { useState } from 'react'
import { Stethoscope, Pill, Calculator, FileSearch, Info } from 'lucide-react'
import SymptomChecker from '../components/medical/SymptomChecker'
import DrugInteraction from '../components/medical/DrugInteraction'
import BMICalculator from '../components/medical/BMICalculator'
import ReportAnalyzer from '../components/medical/ReportAnalyzer'
import MedicineInfo from '../components/medical/MedicineInfo'
import { classNames } from '../utils/helpers'

const TABS = [
  { id: 'symptoms', label: 'Symptom Checker', icon: Stethoscope, component: SymptomChecker },
  { id: 'drugs', label: 'Drug Interactions', icon: Pill, component: DrugInteraction },
  { id: 'bmi', label: 'BMI Calculator', icon: Calculator, component: BMICalculator },
  { id: 'report', label: 'Report Analyzer', icon: FileSearch, component: ReportAnalyzer },
  { id: 'medicine', label: 'Medicine Info', icon: Info, component: MedicineInfo },
]

export default function MedicalPage() {
  const [activeTab, setActiveTab] = useState('symptoms')
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component ?? SymptomChecker

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Medical Tools</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">AI-powered medical utilities for information and analysis</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={classNames(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap shrink-0',
              activeTab === id
                ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
            )}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Active tool */}
      <div className="card p-6 animate-fade-in">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">
          {TABS.find((t) => t.id === activeTab)?.label}
        </h2>
        <ActiveComponent />
      </div>
    </div>
  )
}
