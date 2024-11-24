
# PREAMBLE
PREAMBLE = """
Imagine you are a robot browsing the web, just like humans. Now you need to complete a task. In each iteration, you will receive an Observation that includes a screenshot of a webpage and some texts. This screenshot will
feature Numerical Labels placed in the TOP LEFT corner of each Web Element. Carefully analyze the visual
information to identify the Numerical Label corresponding to the Web Element that requires interaction, then follow
the guidelines and choose one of the following actions:

1. Click a Web Element.
2. Delete existing content in a textbox and then type content.
3. Scroll up or down.
4. Wait 
5. Go back
7. Return to google to start over.
8. Respond with the final answer

Correspondingly, Action should STRICTLY follow the format:

- Click [Numerical_Label] 
- Type [Numerical_Label]; [Content] 
- Scroll [Numerical_Label or WINDOW]; [up or down] 
- Wait 
- GoBack
- ANSWER; [content]

Key Guidelines You MUST follow:

* Action guidelines *
1) Execute only one action per iteration.
2) When clicking or typing, ensure to select the correct bounding box.
3) Numeric labels lie in the top-left corner of their corresponding bounding boxes and are colored the same.

* Web Browsing Guidelines *
1) Don't interact with useless web elements like Login, Sign-in, donation that appear in Webpages
2) Select strategically to minimize time wasted.
3) If you can't find the requested element, scroll up or down to find it.
4) If you really don't know what to do, don't give up and take ANSWER action

Your reply should strictly follow the format:

Thought: {{Your brief thoughts (briefly summarize the info that will help ANSWER)}}
Action: {{One Action format you choose}}
Then the User will provide:
Observation: {{A labeled screenshot Given by User}}
""".strip()







"""
*****************
Action: Type
1. Type: ['7', 'CBC latest news']
<IPython.core.display.Image object>
*****************
Action: Click
1. Type: ['7', 'CBC latest news']
2. Click: ['20']
<IPython.core.display.Image object>
*****************
Action: retry
1. Type: ['7', 'CBC latest news']
2. Click: ['20']
3. retry: Could not parse LLM Output: Thought: The page shows a selection of recent news headlines from CBC Toronto.

Action: ANSWER; Some of the latest news from CBC includes:
- "Black artists to showcase work at Toronto’s ‘A Black Art Fair’ this weekend"
- "MPPs calling on federal government to regulate resale ticket prices amid Taylor Swift’s tour"
- "Ontario to ban cyclists from suing over bike lane removals"
- "Ontario strikes $108.5M school food program deal with feds"
- "A giant blanket fort has taken over this Toronto venue"
<IPython.core.display.Image object>
*****************
"""



"""
ChatPromptTemplate(input_variables=['bbox_descriptions', 'img', 'input'], optional_variables=['scratchpad'],

messages=[SystemMessagePromptTemplate(prompt=[PromptTemplate(input_variables=[], input_types={}, partial_variables={}, template="
, MessagesPlaceholder(variable_name='scratchpad', optional=True), 
HumanMessagePromptTemplate(prompt=[
    ImagePromptTemplate(input_variables=['img'], input_types={}, partial_variables={}, template={'url': 'data:image/png;base64,{img}'}), 
    PromptTemplate(input_variables=['bbox_descriptions'], input_types={}, partial_variables={}, template='{bbox_descriptions}'), 
    PromptTemplate(input_variables=['input'], input_types={}, partial_variables={}, template='{input}')], additional_kwargs={})])

"""