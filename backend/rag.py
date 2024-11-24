import os
import cohere
from typing import *
from dotenv import load_dotenv
load_dotenv()
from pinecone import Pinecone
import uuid 

class RagPipeline:
    def __init__(self, COHERE_KEY: str, PINECONE_KEY: str):
        self.co_client = cohere.ClientV2(COHERE_KEY) # Cohere initialization
        self.pc = Pinecone(api_key=PINECONE_KEY) # Pinecone initialization

    """
    documentation - documentation of how the website works, (eg: what each button does)
    prompt - determines what the person is looking for (part of the query for RAG)
    current_page - information in the page you have to sort through (part of the query for RAG)
    """
    def relevant_info(self, prompt: str, site_id: str) -> str:
        pc_index = self.pc.Index("llamathon-11-23-24")
        query = prompt 

        query_embed = self.co_client.embed(
            model="embed-english-v3.0",
            input_type="search_query", # Running similarity search
            embedding_types=["float"],
            texts=[query]
        ) 

        similar_embedding = pc_index.query(
            namespace=str(site_id), # Look for similar documents only for that website
            vector=query_embed.embeddings.float[0],
            top_k=1,
            include_metadata=True
        )

        # Maybe add rerank later

        return similar_embedding['matches'][0]['metadata']['text']
    
    """
    Takes documents, embeds them, and uploads them to Pinecone so they can be used to run similarity search
    """
    def chunking(self, documentation: List[str], site_id: str) -> bool:
        docs = []
        for element in documentation:

            # Chunking by characters
            old_count = 0
            element_len = len(element['content'])
            over_limit = False
            for i in range(element_len):
                if over_limit and element['content'][i] == " ":
                    docs.append(element['content'][old_count:i])
                    old_count = i
                    over_limit = False
                if i % 500 == 0:
                    over_limit = True
                i += 1
            docs.append(element['content'][old_count:i])

            # -------
            # Chunking by Tokens

            # response = self.co_client.tokenize(
            #     text=element['content'],
            #     model='command-r-plus-08-2024'
            # )

            # print(response)

            # breakpoint()
            
            # i = 0
            # final_str = ""
            # for token_str in response['token_strings']:
            #     final_str += token_str
            #     i += len(token_str)
            #     if i > 500:
            #         docs.append(final_str)
            #         final_str = ""
            #         i = 0
            
            # if final_str:
            #     docs.append(final_str)

        embeds = self.co_client.embed(
            model="embed-english-v3.0",
            input_type="search_document",
            embedding_types=["float"],
            texts=docs
        )
        pc_embeds = [] # Pinecone embeds
        for i in range(len(embeds.embeddings.float)):
            pc_embeds.append({
                "id": str(uuid.uuid4()),
                "values": embeds.embeddings.float[i],
                "metadata": {"text": embeds.texts[i]} # Store the original text value in the metadata
            })

        index = self.pc.Index("llamathon-11-23-24")
        index.upsert(
            vectors=pc_embeds,
            namespace=str(site_id) # Used to seperate the embeddings of each website's pages 
        )

        return True
        
