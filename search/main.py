from model.agent import open_browser, format_descriptions_default
from model.annotate_page import mark_page_default
from search.constants import PREAMBLE
from openai import OpenAI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
import base64

load_dotenv()

PROMPT_TEMPLATE = """
{user_input}
{bbox_descriptions}
You have performed the following actions so far:
{trajectory}
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



async def search_action(user_prompt: str, coordinates: list[dict], screenshot: str, trajectory: list):
    ALL_ACTIONS = ['click', 'type', 'scroll', 'wait', 'answer;']
    REQUIRES_ELEMENT = ['click', 'type']
    MAX_RETRIES = 3  # Maximum number of retries allowed
    bbox_descriptions = format_descriptions_default(coordinates)

    print('trajectory', trajectory)
    
    trajectory_str = '\n'.join(trajectory)
    model_prompt = PROMPT_TEMPLATE.format(
        user_input=user_prompt,
        bbox_descriptions=bbox_descriptions,
        trajectory=trajectory_str,
    )
    for attempt in range(MAX_RETRIES):
        try:
            print(f'Attempt {attempt + 1}')
            response = prompt_llm(model_prompt, screenshot)
            print(f'Response: {response}')
            parsed_response = parse(response)
            action, args = parsed_response['action'], parsed_response['args']
            print(f'Action: {action}\nArgs: {args}')
            
            if action.lower() in REQUIRES_ELEMENT:
                if not args:
                    raise ValueError(f'Action {action} requires an element in args')
                chosen_element = coordinates[int(args[0])]
                print(f'Chosen Element: {chosen_element}')
            else:
                chosen_element = {}

            # Validate the action
            if action.lower() not in ALL_ACTIONS:
                raise ValueError(f'Invalid action: {action}')
            
            trajectory.append(response)
            # If all validations pass, return the result
            result = {
                'action': action,
                'args': args,
                'trajectory': trajectory,
                **chosen_element
            }
            return result
        except Exception as e:
            print(f'Error on attempt {attempt + 1}: {e}')
            if attempt < MAX_RETRIES - 1:
                print('Retrying...')
            else:
                print('Maximum retries reached. Failing gracefully.')
                return {
                    'error': 'Unable to process action',
                    'details': str(e)
                }
            
# REQUIRES_ELEMENT = ['click', 'type']
#     """
#     - Click [Numerical_Label] 
# - Type [Numerical_Label]; [Content] 
# - Scroll [Numerical_Label or WINDOW]; [up or down] 
# - Wait 
# - GoBack
# - ANSWER; [content]
#     """
    # close the page:
    # await page.context.close()



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
    # url: str
    user_prompt: str
    coordinates: list
    screenshot: str
    trajectory: list

    #   screenshot: string;
#   coordinates: {
#     x: number;
#     y: number;
#     type: string;
#     text: string;
#     ariaLabel: string;
#   }[];

# API endpoint
@app.post("/search")
async def search_endpoint(request: SearchRequest):
    result = await search_action(request.user_prompt, request.coordinates, request.screenshot, request.trajectory)
    return {"status": "success", "result": result}





if __name__ == "__main__":
    uvicorn.run(app)
    # python -m search.main