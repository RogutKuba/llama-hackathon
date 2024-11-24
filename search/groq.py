from groq import Groq
from search.constants import PREAMBLE

client = Groq()

def prompt_llm(prompt, base64_image):
    response = client.chat.completions.create(
        model="llama-3.2-90b-vision-preview",
        messages=[
            {
            "role": "user",
            "content": [
                {"type": "text", "text": PREAMBLE + prompt},
                {
                "type": "image_url",
                "image_url": {
                    "url": f"{base64_image}",
                },
                },
            ],
            }
        ],
        max_tokens=300,
    )
    return response.choices[0].message.content

