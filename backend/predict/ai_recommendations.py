from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_treatment(disease_name: str):
    prompt = f"""
    You are an expert plant pathologist.

    The detected plant disease is: **{disease_name}**.

    Provide a structured treatment guide with:

    1. Cause of the disease
    2. Symptoms
    3. Immediate actions (remove leaves, isolate plant)
    4. Recommended organic treatments
    5. Recommended chemical treatments (safe dosage)
    6. Preventive measures
    7. Expected results timeline
    """
    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    return response.choices[0].message.content
