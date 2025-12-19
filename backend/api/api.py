import os
import requests
import json
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class MatchRequest(BaseModel):
    resume: str
    job_description: str

app = FastAPI()
SERVER_URL = os.getenv("MODEL_URL")

@app.post("/analyze_match")
async def analyze_match(input_data: MatchRequest):
    try:
        prompt = f"""
        You are a careful career coach reviewing a resume against a job description.

        Return ONLY valid JSON. No markdown. No extra text.

        Schema (keys must match exactly):
        {{
          "matchScore": 0,
          "matchingSkills": [],
          "missingSkills": [],
          "improvementSuggestions": ["", "", ""]
        }}

        How to think about this (like a diligent reviewer, not a keyword bot):

        1) Start by understanding the job
        - Identify what the person will actually do day-to-day.
        - Separate what is essential from what is merely preferred.
          Clues: repeated requirements, items tied to core responsibilities, “must/required/you have”, and skills needed to execute the main tasks.
          Preferred/nice-to-have items matter, but they should not dominate the evaluation.

        2) matchingSkills (be conservative and auditable)
        - Only include a skill/technology in matchingSkills when it is explicitly mentioned in BOTH the resume and the job description.
        - Use common-name equivalence when it’s clearly the same thing (e.g., “C plus plus” vs “C++”), but do not “give credit” for related ecosystems.
        - If you’re not sure a skill is explicitly present in both, leave it out. This list should be defensible.
        - Do NOT include skills that only appear in the job description as "matching" (e.g., do not add .NET unless the resume explicitly mentions C#, VB.NET, ASP.NET, or .NET).
        - Do NOT use role plausibility (“a full-stack dev probably knows X”) to populate matchingSkills.


        3) missingSkills (prioritize what matters)
        - List the most consequential gaps relative to the job’s essential requirements.
        - Do not list every possible missing item; choose the missing skills that would most likely prevent success in the role or a strong interview.
        - It is acceptable to omit minor or purely “nice-to-have” items even if they are absent, especially if the resume fits the core needs.
        - Keep missingSkills focused: think “top gaps”, not “complete difference set”.
        - Do NOT list broad foundational skills (e.g., Git, SQL, OOP, data structures/algorithms) as missing if the resume shows practical evidence of them (projects, tools used, repositories, database work), even if the exact phrase is not stated.
        - Only list a foundational skill as missing if there is clear absence of evidence AND it is essential to the role.
        - Limit missingSkills to the top 3–6 most consequential gaps.


        4) matchScore (calibrated judgement)
        - Score based on readiness for THIS role, not general talent.   
        - A few missing essentials should noticeably lower the score.
        - Missing mostly preferred items should lower the score only modestly.
        - Evidence matters: strong, relevant experience can outweigh a missing keyword; weak or purely adjacent experience should not.
        - Do not inflate the score by inventing overlap.

        5) improvementSuggestions (exactly 3, highest leverage)
        - Give exactly 3 concise suggestions aimed at the biggest missingSkills items or the biggest weaknesses in evidence (impact, scope, proof).
        - Prefer suggestions that can realistically be addressed: add a project, emphasize a relevant section, quantify impact, or learn a specific tool required by the role.

        Resume:
        {input_data.resume}

        Job Description:
        {input_data.job_description}

        END_JSON
        """
        
        # Add this line to see the full prompt
        print(f"DEBUG - Full prompt being sent:\n{prompt}\n")

        r = requests.post(SERVER_URL + "/completion", json={
            "prompt": prompt,
            "temperature": 0.2,
            "top_k": 15,
            "top_p": 0.6,
            "n_predict": 512,
            "stop": ["END_JSON"],
            "repeat_penalty": 1.15
        })


        if r.status_code != 200:
            print(f"Error: Received status code {r.status_code}")
            raise Exception(f"Status Code: {r.status_code} - {r.text}")

        data = r.json()
        text = data.get("content", "").strip()

        try:
            analysis = json.loads(text)
        except json.JSONDecodeError:
            analysis = {
                "error": "Model returned invalid JSON",
                "rawText": text
            }

        return { "response": analysis }
    except Exception as e:
        print("Error during generation:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": True, "device": "cuda" if torch.cuda.is_available() else "cpu"}