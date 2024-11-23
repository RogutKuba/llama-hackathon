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
    def relevant_info(self, documentation: List[str], prompt: str, current_page: str, url: str) -> str:
        pc_index = self.chunking(documentation, url) # Returns pinecone index 
        query = prompt + "\n" + current_page

        query_embed = self.co_client.embed(
            model="embed-english-v3.0",
            input_type="search_query", # Running similarity search
            embedding_types=["float"],
            texts=[query]
        ) 

        similar_embedding = pc_index.query(
            namespace=url, # Look for similar documents only for that website
            vector=query_embed.embeddings.float[0],
            top_k=1,
            include_metadata=True
        )

        return similar_embedding['matches'][0]['metadata']['text']
    
    """
    Takes documents, embeds them, and uploads them to Pinecone so they can be used to run similarity search
    """
    def chunking(self, documentation: List[str], website_url: str) -> Pinecone.Index:
        embeds = self.co_client.embed(
            model="embed-english-v3.0",
            input_type="search_document",
            embedding_types=["float"],
            texts=documentation
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
            namespace=website_url # Used to seperate the embeddings of each website's pages 
        )

        return index
        
