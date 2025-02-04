from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import sys

def load_model():
    # Path to your model directory
    model_path = "./ai-model/Llama-2-7b-chat-hf"
    
    try:
        # Check if CUDA is available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")
        
        # Load the tokenizer
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        
        # Load the model with appropriate settings
        print("Loading model...")
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16,
            device_map="auto",
            low_cpu_mem_usage=True
        )
        
        return tokenizer, model, device
        
    except ImportError as e:
        print(f"Error: Missing required packages. {str(e)}")
        print("Please install required packages using:")
        print("pip install 'accelerate>=0.26.0'")
        sys.exit(1)
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        sys.exit(1)

def generate_response(prompt, tokenizer, model, device):
    try:
        # T5 expects input in format: "summarize: " or "translate: " etc.
        formatted_prompt = f"analyze resume: {prompt}"
        
        # Tokenize input
        inputs = tokenizer(formatted_prompt, return_tensors="pt", max_length=512, truncation=True)
        inputs = {k: v.to(model.device) for k, v in inputs.items()}
        
        # Generate output
        outputs = model.generate(
            **inputs,
            max_length=512,
            temperature=0.3,
            top_p=0.85,
            do_sample=True
        )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response
        
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return None

def main():
    # Load model and tokenizer
    tokenizer, model, device = load_model()

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

    # Generate and print response
    response = generate_response(prompt, tokenizer, model, device)
    if response:
        print("\nGenerated Response:")
        print(response)

if __name__ == "__main__":
    main()