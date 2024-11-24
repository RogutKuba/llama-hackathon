from search.constants import PREAMBLE
from openai import OpenAI

client = OpenAI()

def prompt_llm(prompt, base64_image):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            { 'role': "system", 'content': PREAMBLE},
            {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
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
    print(response.choices[0])
    return response.choices[0].message.content