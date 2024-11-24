from model.agent import open_browser, format_descriptions
from model.annotate_page import mark_page_default
from search.constants import PREAMBLE
from openai import OpenAI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv


load_dotenv()

PROMPT_TEMPLATE = """
{user_input}
{bbox_descriptions}
""".strip()

client = OpenAI()


def parse(response: str) -> dict:
    action_prefix = "Action: "
    if not response.strip().split("\n")[-1].startswith(action_prefix):
        return {"action": "retry", "args": f"Could not parse LLM Output: {response}"}
    action_block = response.strip().split("\n")[-1]

    action_str = action_block[len(action_prefix) :]
    split_output = action_str.split(" ", 1)
    if len(split_output) == 1:
        action, action_input = split_output[0], None
    else:
        action, action_input = split_output
    action = action.strip()
    if action_input is not None:
        action_input = [
            inp.strip().strip("[]") for inp in action_input.strip().split(";")
        ]
    return {"action": action, "args": action_input}


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
                    "url": f"data:image/jpeg;base64,{base64_image}",
                },
                },
            ],
            }
        ],
        max_tokens=300,
    )
    print(response.choices[0])
    return response.choices[0].message.content



async def search_action(url, user_prompt):
    """
    (Pdb) parsed_response
    {'action': 'Click', 'args': ['11']}
    """
    page = await open_browser(url)
    # TODO: get total pixel of the page:

    print("PAGE OPENED")
    annotated_page = await mark_page_default(page)
    state = format_descriptions(annotated_page)
    
    model_prompt = PROMPT_TEMPLATE.format(
        user_input=user_prompt,
        bbox_descriptions=state["bbox_descriptions"]
    )
    
    response = prompt_llm(model_prompt, annotated_page['img'])
    print(response)
    parsed_response = parse(response)
    action, args = parsed_response['action'], parsed_response['args']

    print(action, args)  # 'action' and 'args'
    chosen_element = state['bboxes'][int(args[0])]
    print(chosen_element)
    result = {
        'action': action,
        'args': args,
        **chosen_element
    }
#     """
#     - Click [Numerical_Label] 
# - Type [Numerical_Label]; [Content] 
# - Scroll [Numerical_Label or WINDOW]; [up or down] 
# - Wait 
# - GoBack
# - Google
# - ANSWER; [content]
#     """
    # close the page:
    # await page.context.close()
    return result



# FastAPI application setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model for API input
class SearchRequest(BaseModel):
    url: str
    user_prompt: str

# API endpoint
@app.post("/search")
async def search_endpoint(request: SearchRequest):
    result = await search_action(request.url, request.user_prompt)
    return {"status": "success", "result": result}





if __name__ == "__main__":
    uvicorn.run(app)
    # python -m search.main