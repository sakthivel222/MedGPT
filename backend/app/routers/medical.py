from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.models.user import User
from app.utils.auth import get_current_user
from app.services.llm import llm_service, REPORT_ANALYSIS_PROMPT
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class SymptomRequest(BaseModel):
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None
    duration: Optional[str] = None
    additional_info: Optional[str] = None


class DrugInteractionRequest(BaseModel):
    drugs: List[str]


class BMIRequest(BaseModel):
    weight_kg: float
    height_cm: float
    age: Optional[int] = None
    gender: Optional[str] = None


class ReportRequest(BaseModel):
    report_text: str
    report_type: str  # blood, ecg, mri, ct, general


class MedicineRequest(BaseModel):
    medicine_name: str
    question: Optional[str] = None


class DiseaseRequest(BaseModel):
    disease_name: str


@router.post("/symptom-checker")
async def symptom_checker(
    body: SymptomRequest,
    current_user: User = Depends(get_current_user),
):
    prompt = f"""Patient information:
- Age: {body.age or 'Not specified'}
- Gender: {body.gender or 'Not specified'}  
- Symptoms: {', '.join(body.symptoms)}
- Duration: {body.duration or 'Not specified'}
- Additional info: {body.additional_info or 'None'}

Please analyze these symptoms and provide:
1. Possible conditions (from most to least likely)
2. Red flags to watch for
3. Recommended actions
4. When to seek immediate medical attention

Remember to recommend consulting a healthcare professional."""

    response = await llm_service.chat(
        [{"role": "user", "content": prompt}],
        system_prompt="You are a medical AI assistant specialized in symptom analysis. Always be thorough but remind users to consult real doctors.",
    )
    return {"result": response, "symptoms": body.symptoms}


@router.post("/drug-interaction")
async def drug_interaction(
    body: DrugInteractionRequest,
    current_user: User = Depends(get_current_user),
):
    if len(body.drugs) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least 2 medications")
    prompt = f"""Check for interactions between these medications: {', '.join(body.drugs)}

For each pair, provide:
1. Interaction severity (None/Minor/Moderate/Major/Contraindicated)
2. Mechanism of interaction
3. Clinical effects
4. Management recommendations

Format clearly and always recommend consulting a pharmacist or physician."""
    response = await llm_service.chat(
        [{"role": "user", "content": prompt}],
        system_prompt="You are a clinical pharmacology AI assistant. Provide accurate drug interaction information.",
    )
    return {"result": response, "drugs": body.drugs}


@router.post("/bmi-calculator")
async def bmi_calculator(
    body: BMIRequest,
    current_user: User = Depends(get_current_user),
):
    bmi = body.weight_kg / ((body.height_cm / 100) ** 2)
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal weight"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"

    prompt = f"""Patient BMI Analysis:
- Weight: {body.weight_kg} kg
- Height: {body.height_cm} cm
- BMI: {bmi:.1f} ({category})
- Age: {body.age or 'Not specified'}
- Gender: {body.gender or 'Not specified'}

Provide:
1. Health implications of this BMI
2. Associated health risks
3. Personalized recommendations for diet and exercise
4. Target healthy weight range"""
    response = await llm_service.chat([{"role": "user", "content": prompt}])
    return {"bmi": round(bmi, 1), "category": category, "analysis": response,
            "weight_kg": body.weight_kg, "height_cm": body.height_cm}


@router.post("/report-analyzer")
async def analyze_report(
    body: ReportRequest,
    current_user: User = Depends(get_current_user),
):
    type_context = {
        "blood": "blood test/laboratory report",
        "ecg": "ECG/EKG cardiac report",
        "mri": "MRI imaging report",
        "ct": "CT scan report",
        "general": "medical report",
    }.get(body.report_type, "medical report")

    prompt = f"""Please analyze this {type_context}:\n\n{body.report_text}"""
    response = await llm_service.chat(
        [{"role": "user", "content": prompt}],
        system_prompt=REPORT_ANALYSIS_PROMPT,
    )
    return {"result": response, "report_type": body.report_type}


@router.post("/medicine-info")
async def medicine_info(
    body: MedicineRequest,
    current_user: User = Depends(get_current_user),
):
    question = body.question or f"Provide comprehensive information about {body.medicine_name}"
    prompt = f"""Medicine: {body.medicine_name}
Question: {question}

Please provide:
1. Drug class and mechanism of action
2. Indications (what it treats)
3. Common dosages
4. Side effects (common and serious)
5. Contraindications
6. Drug interactions
7. Important warnings"""
    response = await llm_service.chat([{"role": "user", "content": prompt}])
    return {"medicine": body.medicine_name, "result": response}


@router.post("/disease-info")
async def disease_info(
    body: DiseaseRequest,
    current_user: User = Depends(get_current_user),
):
    prompt = f"""Provide comprehensive medical information about: {body.disease_name}

Include:
1. Definition and overview
2. Causes and risk factors
3. Signs and symptoms
4. Diagnosis methods
5. Treatment options
6. Prevention strategies
7. Prognosis and complications"""
    response = await llm_service.chat([{"role": "user", "content": prompt}])
    return {"disease": body.disease_name, "result": response}
