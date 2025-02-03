from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
from run_llama import load_model, generate_response

app = FastAPI()

# Load model at startup
print("Loading model...")
tokenizer, model, device = load_model()
print("Model loaded successfully!")

class PromptRequest(BaseModel):
    resume: str
    job_description: str

class PromptResponse(BaseModel):
    response: str
    error: Optional[str] = None

@app.post("/analyze", response_model=PromptResponse)
async def analyze_resume(request: PromptRequest):
    try:
        prompt = f"""You are an expert career coach. Compare the following resume with the provided job description.
        
Resume:
{request.resume}

Job Description:
{request.job_description}

Please provide a detailed analysis."""
        
        response = generate_response(prompt, tokenizer, model, device)
        if response:
            return PromptResponse(response=response)
        else:
            raise HTTPException(status_code=500, detail="Failed to generate response")
            
    except Exception as e:
        return PromptResponse(response="", error=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 