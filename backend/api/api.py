from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import json
import re

RESUME_SUMMARY_PROMPT = """You are an expert resume analyzer. Create a comprehensive and detailed summary of this resume.
Your analysis will be used for further matching and recommendations, so please be thorough and specific.
Focus on capturing all relevant experience, skills, achievements, and qualifications.

Resume:
{text}

Provide a detailed analysis covering:
- Educational background and certifications with years
- Total years of relevant experience
- Technical skills, tools, and languages (be specific)
- Most significant achievements and responsibilities
- Industries worked in
- Notable projects and their outcomes
"""

JOB_SUMMARY_PROMPT = """You are an expert job description analyzer. Create a detailed structured summary of this job posting.
Your analysis will be used for candidate matching, so please be thorough and specific about requirements and preferences.

Job Description:
{text}

Provide a detailed analysis covering:
- Required education and certifications
- Required years of experience
- Essential technical skills and qualifications
- Preferred/nice-to-have skills
- Key responsibilities and expectations
- Industry context and domain requirements
"""

ANALYSIS_PROMPT = """You are an expert AI career coach. Analyze how well this candidate matches the job requirements.
Provide a thorough analysis of the fit between the candidate's profile and the position requirements.

Resume Summary: {resume_summary}
Job Summary: {job_summary}

Provide a comprehensive analysis covering:
- Overall assessment of the candidate's fit
- Areas where the candidate strongly matches requirements
- Identified gaps or missing qualifications
- Specific recommendations for improving candidacy
- Key experiences and achievements to highlight in interviews
"""

class RequestData(BaseModel):
    text: str

class MatchRequest(BaseModel):
    resume_summary: str
    job_summary: str

class ModelManager:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.tokenizer = None
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.initialize_model()

    def initialize_model(self):
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                torch_dtype=torch.float16,
                device_map="auto",
                low_cpu_mem_usage=True
            )
            torch.cuda.empty_cache()
        except Exception as e:
            raise RuntimeError(f"Failed to initialize model: {str(e)}")

    def generate_response(self, prompt: str) -> dict:
        try:
            inputs = self.tokenizer(prompt, return_tensors="pt", max_length=2048, truncation=True).to(self.device)
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=1024,
                temperature=0.4,
                top_p=0.9,
                repetition_penalty=1.2,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )

            # Extract only the response part, removing the original prompt
            full_response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Find where the actual response begins (after the prompt)
            response_start = full_response.find(prompt) + len(prompt)
            actual_response = full_response[response_start:].strip()
            
            return {"analysis": actual_response}
            
        except Exception as e:
            raise RuntimeError(f"Error generating response: {str(e)}")

app = FastAPI()
model_manager = ModelManager("./Llama-2-7b-chat-hf")

@app.post("/summarize_resume")
async def summarize_resume(data: RequestData):
    prompt = RESUME_SUMMARY_PROMPT.format(text=data.text)
    return model_manager.generate_response(prompt)

@app.post("/summarize_job")
async def summarize_job(data: RequestData):
    prompt = JOB_SUMMARY_PROMPT.format(text=data.text)
    return model_manager.generate_response(prompt)

@app.post("/analyze_match")
async def analyze_match(data: MatchRequest):
    prompt = ANALYSIS_PROMPT.format(
        resume_summary=data.resume_summary,
        job_summary=data.job_summary
    )
    return model_manager.generate_response(prompt)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "device": model_manager.device}