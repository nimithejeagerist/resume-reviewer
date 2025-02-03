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
        # Tokenize input
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        
        inputs = {k: v.to(model.device) for k, v in inputs.items()}
        
        # Generate output
        outputs = model.generate(
            **inputs,
            max_new_tokens=100,
            temperature=0.7,
            top_p=0.95
        )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response
        
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return None

def main():
    # Load model and tokenizer
    tokenizer, model, device = load_model()
    
    # Sample prompt
    prompt = "You are an expert career coach. Compare the following resume with the provided job description."
    print()
    print(prompt)
    
    # Generate and print response
    response = generate_response(prompt, tokenizer, model, device)
    if response:
        print("\nGenerated Response:")
        print(response)

if __name__ == "__main__":
    main()