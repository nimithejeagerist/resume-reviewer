from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import pipeline

class MatchRequest(BaseModel):
    resume: str
    job_description: str

app = FastAPI()
pipe = pipeline(
    "text-generation",
    model="./Meta-Llama-3-8B",
    torch_dtype=torch.float16,
    device_map="auto",
)

@app.post("/analyze_match")
async def analyze_match(data: MatchRequest):
    try:
        test_prompt = "Hello, I am a"
        print("Sending test prompt to model...")
        response = pipe(
            test_prompt, 
            max_length=512,
            min_length=100,
            num_return_sequences=1,
            do_sample=True,
            temperature=0.7
        )
        print("Raw response from model:", response)
        return {"analysis": response[0]['generated_text']}
    except Exception as e:
        print("Error during generation:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "device": "cuda" if torch.cuda.is_available() else "cpu"}