from langchain import hub
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
import re
from model.agent import annotate
from model.schema import AgentState, SystemMessage
from model.build_graph import update_scratchpad
from langchain_core.runnables import RunnableLambda

from langgraph.graph import END, START, StateGraph
from model.tools import click, go_back, scroll, to_google, type_text, wait, TOOLS
from model.agent import annotate, format_descriptions, parse, open_browser, call_agent
from model.build_graph import update_scratchpad, select_tool
from dotenv import load_dotenv

load_dotenv()

def initialize_agent():
    prompt = hub.pull("wfh/web-voyager")
    print(prompt.messages[0].prompt[0].template)
    breakpoint()
    llm = ChatOpenAI(model="gpt-4o", max_tokens=4096)
    agent = annotate | RunnablePassthrough.assign(
        prediction=format_descriptions | prompt | llm | StrOutputParser() | parse
    )
    return agent

def initialize_graph():
    agent = initialize_agent()
    graph_builder = StateGraph(AgentState)

    graph_builder.add_node("agent", agent)
    graph_builder.add_edge(START, "agent")

    graph_builder.add_node("update_scratchpad", update_scratchpad)
    graph_builder.add_edge("update_scratchpad", "agent")

    # Adding tools as nodes
    for node_name, tool in TOOLS.items():
        graph_builder.add_node(
            node_name,
            RunnableLambda(tool) | (lambda observation: {"observation": observation}),
        )
        graph_builder.add_edge(node_name, "update_scratchpad")  # Connect to update_scratchpad

    graph_builder.add_conditional_edges("agent", select_tool)

    return graph_builder.compile()

async def fetch_page_content_and_query(user_question: str, graph: StateGraph, page):
    def capture_raw_prompt(graph):
        # Add debugging logic here to extract the raw prompt from the graph or agent
        # This assumes the graph/agent exposes the LLM prompt template
        # Adjust according to your implementation's specifics
        if hasattr(graph, "debug_prompt"):
            return graph.debug_prompt
        return "Raw prompt capture not implemented."

    raw_prompt = capture_raw_prompt(graph)
    print("RAW PROMPT USED:", raw_prompt)  # Debugging output
    response = await call_agent(graph, user_question, page)
    # TODO: I want to see the raw prompt used to prompt the llm every time
    
    return response

async def main(test_question):
    page = await open_browser()
    print("PAGE OPENED")
    graph = initialize_graph()
    # Fetch the content and query
    result = await fetch_page_content_and_query(test_question, graph, page)
    print("Agent Response:", result)
    # close the browser:
    await page.context.close()




if __name__ == "__main__":
    import asyncio
    test_question = "What are some of the latest news from CBC?"
    asyncio.run(main(test_question))
    # python -m model.main


