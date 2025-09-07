from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import OllamaLLM
from langserve import add_routes
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn
from contextlib import asynccontextmanager

load_dotenv()

# --- FastAPI Lifespan Management ---
# This function will run once when the application starts.
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup: Initializing resources...")
    
    # Load knowledge base
    try:
        with open("knowledge1.txt", "r") as f:
            knowledge_text = f.read()
    except FileNotFoundError:
        knowledge_text = "Default knowledge base: No file found."
        print("Warning: knowledge1.txt not found.")

    # Define prompt and LLM
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"You are a platform-specific chatbot. "
                   f"Provide only that much details that is asked. "
                   f"Only answer questions based on the following knowledge base:\n\n{knowledge_text}"),
        ("human", "{input}")
    ])
    
    # Ensure OLLAMA_BASE_URL is set in your Render environment if Ollama is a separate service
    llm = OllamaLLM(model="gemma2:2b")

    # Add LangServe routes
    print("Adding LangServe routes...")
    add_routes(
        app,
        prompt | llm | StrOutputParser(),
        path="/platform",
        input_type=SimpleInput
    )
    print("LangServe routes added.")

    # --- THE CRITICAL FIX ---
    # Rebuild Pydantic models after routes are added
    print("Rebuilding Pydantic models...")
    for route in app.routes:
        if hasattr(route, "body_field") and route.body_field:
            model = route.body_field.type_
            if hasattr(model, "model_rebuild"):
                try:
                    model.model_rebuild()
                    print(f"Successfully rebuilt model: {model.__name__}")
                except Exception as e:
                    print(f"Could not rebuild model {model.__name__}: {e}")
    print("Model rebuilding complete.")
    
    yield
    
    # Code below yield runs on shutdown
    print("Application shutdown.")

# --- Pydantic Input Model ---
class SimpleInput(BaseModel):
    input: str

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Langchain Server",
    version="1.0.0",
    description="A simple API server for a platform-specific chatbot.",
    lifespan=lifespan  # Hook the lifespan event handler
)

# This is for local development; Render uses the Gunicorn command
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

