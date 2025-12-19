# Resume Reviewer
A full-stack system that evaluates how well a resume aligns with a specific job description by combining document parsing, structured analysis, and local language models.

This project was built as an end-to-end exercise in system design, model orchestration, and real-world data handling, not as a production SaaS product.

[▶ Watch demo video](assets/demo.mp4)

## Motivation
Resume screening is often shallow, opaque, and overly keyword-driven.  
I wanted to explore whether a more structured and auditable approach, combining explicit skill overlap with contextual reasoning, could produce more meaningful feedback.

The goal was not to “score resumes”, but to surface:
- where a resume clearly aligns,
- where critical gaps exist,
- and how those gaps relate to the actual responsibilities of a role.

## System Overview
The system is composed of three loosely coupled services:
- **Frontend (Next.js)**  
  Provides a simple UI for uploading a resume, pasting a job description, and viewing structured results.
- **Backend (Node.js)**  
  Handles file uploads, document parsing, text cleaning, and orchestration between services.
- **Analysis API (FastAPI + local LLM)**  
  Performs the resume–job comparison using a local language model, returning structured JSON output.

External services are used only where appropriate (e.g. document extraction), while model inference runs locally.

## Design Considerations
A few deliberate choices shaped this project:
- **Structured output over free-form text**  
  The model is constrained to return strict JSON to make the analysis auditable and UI-friendly.
- **Explicit vs contextual reasoning**  
  Skill overlap is treated as a strict intersection, while overall fit and scoring allow contextual judgement.
- **Local inference**  
  Running models locally avoids external APIs and exposes real constraints around latency, output control, and prompt robustness.
- **Noise reduction**  
  Resume and job description text is cleaned before analysis to reduce hallucinated overlap.

## What This Demonstrates
This project touches multiple layers of modern software systems:
- frontend state management and UI composition,
- backend orchestration and cloud services (Azure),
- document processing and data cleaning,
- prompt design for constrained, structured LLM output,
- reasoning about correctness vs usefulness in model-driven systems.

It is intentionally not over-engineered, but aims to be conceptually honest and technically sound.
