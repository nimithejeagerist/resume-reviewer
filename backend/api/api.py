from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

class MatchRequest(BaseModel):
    resume: str
    job_description: str

app = FastAPI()

# Load model and tokenizer directly instead of using pipeline
model_path = "./Meta-Llama-3-8B"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16,
    device_map="auto",
    load_in_4bit=True,  # Enable 4-bit quantization for faster inference
)

@app.post("/analyze_match")
async def analyze_match(input_data: MatchRequest):
    try:
        prompt = f"""You are an expert career coach. Analyze this resume against the job description and provide a structured response.

Resume:
{input_data.resume}

Job Description:
{input_data.job_description}

Provide your analysis in this exact format:
1. Match Score (0-100): Give a score based on overall fit
2. Matching Skills: List all skills that appear in both resume and job description
3. Missing Skills: List important skills from job description that are missing from resume
4. Improvement Suggestions: Give 3 specific suggestions to improve resume for this role

Focus on technical skills, experience, and qualifications. Be specific and concise."""

        # Tokenize the input
        inputs = tokenizer(prompt, return_tensors="pt", max_length=2048, truncation=True).to(model.device)
        
        # Generate text with optimized parameters
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=512,
                temperature=0.7,
                top_p=0.95,
                do_sample=True
            )
        
        # Decode the generated text
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)

        return {"response": response}
    except Exception as e:
        print("Error during generation:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None, "device": "cuda" if torch.cuda.is_available() else "cpu"}