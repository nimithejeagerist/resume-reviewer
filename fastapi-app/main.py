import os
import requests
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from schemas import Resume, JobDescription
from dotenv import load_dotenv
from helpers import download_blob, extract_text_from_pdf

class ResumeExtractRequest(BaseModel):
    resumeUrl: str

class JobDescriptionExtractRequest(BaseModel):
    jobDescUrl: str

class InferenceRequest(BaseModel):
    resume: Resume
    jobDesc: JobDescription

app = FastAPI()

@app.post("/extract/resume")
async def extract_resume(request: ResumeExtractRequest):
    pdf_bytes = download_blob(request.resumeUrl)
    raw_text = extract_text_from_pdf(pdf_bytes)
    
    # Placeholder
    return {"text": raw_text}

@app.post("/extract/jobdesc")
async def extract_jobdesc(request: JobDescriptionExtractRequest):
    txt_bytes = download_blob(request.jobDescUrl)
    raw_text =  txt_bytes.decode('utf-8')
    return {"text": raw_text}

@app.post("/infer")
async def inference(request: InferenceRequest):
    resume = request.resume
    jobDesc = request.jobDesc
    
    print(resume.name)
    print(jobDesc.title)
    return {"status": "received", "resume": resume.name, "jobDesc": jobDesc.title}
