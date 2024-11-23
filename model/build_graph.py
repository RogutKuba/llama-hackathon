from langchain_core.runnables import RunnableLambda

from langgraph.graph import END, START, StateGraph
import re
from model.schema import AgentState, SystemMessage

from model.tools import click, go_back, scroll, to_google, type_text, wait
from model.schema import AgentState

def select_tool(state: AgentState):
    # Any time the agent completes, this function
    # is called to route the output to a tool or
    # to the end user.
    action = state["prediction"]["action"]
    print('*****************')
    print(f"Action: {action}")
    # gpt4o often answers with "ANSWER;"
    if action.startswith("ANSWER"):
        return END
    if action == "retry":
        return "agent"
    return action

def update_scratchpad(state: AgentState):
    """After a tool is invoked, we want to update
    the scratchpad so the agent is aware of its previous steps"""
    old = state.get("scratchpad")
    if old:
        txt = old[0].content
        last_line = txt.rsplit("\n", 1)[-1]
        step = int(re.match(r"\d+", last_line).group()) + 1
    else:
        txt = "Previous action observations:\n"
        step = 1
    txt += f"\n{step}. {state['observation']}"

    return {**state, "scratchpad": [SystemMessage(content=txt)]}