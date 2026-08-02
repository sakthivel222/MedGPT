import httpx
import json
import asyncio
from typing import AsyncGenerator, List, Dict
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = httpx.Timeout(120.0, connect=10.0)

    def _build_messages(self, history: List[Dict], system_prompt: str = None) -> List[Dict]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.extend(history)
        return messages

    async def chat(
        self,
        messages: List[Dict],
        system_prompt: str = None,
        temperature: float = 0.7,
    ) -> str:
        all_messages = self._build_messages(messages, system_prompt)
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": all_messages,
                    "stream": False,
                    "options": {"temperature": temperature},
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["message"]["content"]

    async def chat_stream(
        self,
        messages: List[Dict],
        system_prompt: str = None,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        all_messages = self._build_messages(messages, system_prompt)
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": all_messages,
                    "stream": True,
                    "options": {"temperature": temperature},
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line)
                            if not data.get("done"):
                                content = data.get("message", {}).get("content", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue

    async def generate_embeddings(self, text: str) -> List[float]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/embed",
                json={"model": settings.OLLAMA_EMBED_MODEL, "input": text},
            )
            response.raise_for_status()
            data = response.json()
            return data["embeddings"][0]

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False


# Medical system prompts
MEDICAL_SYSTEM_PROMPT = """You are MedGPT, an advanced AI medical assistant. You provide helpful, accurate, and evidence-based medical information.

Important guidelines:
1. Always recommend consulting a qualified healthcare professional for personal medical advice
2. Be empathetic, clear, and use accessible language
3. Provide evidence-based information when available
4. Never diagnose conditions definitively; provide possibilities and suggest professional evaluation
5. For emergencies, immediately direct users to call emergency services (911 in US)
6. Be honest about the limitations of AI in medical contexts
7. Structure your responses clearly with sections when appropriate

You can help with:
- Medical information and education
- Symptom analysis (not diagnosis)
- Medication information and interactions
- Medical report interpretation
- Health and wellness guidance
- Understanding medical procedures
"""

REPORT_ANALYSIS_PROMPT = """You are a medical AI specializing in analyzing medical reports. 
Analyze the provided report and give:
1. Key findings summary
2. Notable values (high/low/normal)
3. Clinical significance
4. Recommendations for follow-up
5. Patient-friendly explanation

Always remind the patient to discuss results with their doctor."""

llm_service = OllamaService()
