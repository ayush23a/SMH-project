from langchain_core.prompts import ChatPromptTemplate
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
    input: str

# Load KB from file
with open("knowledge1.txt", "r") as f:
    knowledge_text = f.read()

app = FastAPI(
    title="Langchain Server",
    version="1.0.0",
    description="A simple API server"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", f"You are a platform-specific chatbot. "
               f"Provide only that much details that is asked. "
               f"Only answer questions based on the following knowledge base:\n\n{knowledge_text}"),
    ("human", "{input}")
])

# Ollama model
llm = OllamaLLM(model="gemma2:2b")

# Add routes for LangServe
add_routes(
    app,
    prompt | llm | StrOutputParser(),
    path="/platform"
)


for route in app.routes:
    if hasattr(route, "body_field") and route.body_field:
        model = route.body_field.type_
        if hasattr(model, "model_rebuild"):
            try:
                model.model_rebuild()
            except Exception:
                pass  # skip if already built

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
