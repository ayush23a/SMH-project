from langchain_core.prompts import ChatPromptTemplate
# from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import OllamaLLM
from langserve import add_routes
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn


load_dotenv()

class SimpleInput(BaseModel):
    input : str

# Load KB from file
with open("knowledge1.txt", "r") as f:
    knowledge_text = f.read()


# LOAD api key 
# os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

app = FastAPI(
    title = "Langchain Server", 
    version = "1.0.0",
    description= "A simple API server"
)

# add_routes(
#     app,
#     ChatGoogleGenerativeAI(model="gemini-2.0-flash"),
#     path = "/gemini",
#     input_type = SimpleInput
# )

# model = ChatGoogleGenerativeAI(model="gemini-2.0-flash")


prompt = ChatPromptTemplate.from_messages([
    ("system", f"You are a platform-specific chatbot. "
               f"Only answer questions based on the following knowledge base:\n\n{knowledge_text}"),
    ("human", "{input}")
])


#ollama model
llm = OllamaLLM(model= "gemma2:2b")


add_routes(
    app,
    prompt | llm | StrOutputParser(),
    path = "/platform"
)



