from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# Load the model and tokenizer
model_path = "./Llama-2-7b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path)

# Request Schema
class ResumeRequest(BaseModel):
    resume_text: str
    job_description: str

@app.post("/analyze_resume")
async def analyze_resume(input_data: ResumeRequest):
    try:
        prompt = """
        You are an expert career coach. Compare the following resume with the provided job description.

        - Provide a **match score** from 0 to 100 based on how well the resume fits the job description.
        - List the **skills that match** between the resume and the job description.
        - Identify **missing skills or qualifications** from the job description that aren't in the resume.
        - Give **2-3 suggestions** on how the candidate can improve their resume to better fit the role.

        Resume: {input_data.resume_text}

        Job Description: {input_data.job_description}

        Be concise and professional and try your best not to hallucinate.
        """
        
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        outputs = model.generate(**inputs, max_length=512, temperature=0.3, top_p=0.85, do_sample=True)
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)

        return {"response": response}
    except Exception as e:
        return {"error": str(e)}
