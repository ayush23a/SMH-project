import streamlit as st
from langchain.prompts import ChatPromptTemplate
from langchain_ollama import OllamaLLM
from langchain_core.output_parsers import StrOutputParser

# Load KB from file
with open("knowledge1.txt", "r") as f:
    knowledge_text = f.read()


# Create prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", f"You are a platform-specific chatbot. "
               f"Only answer questions based on the following knowledge base:\n\n{knowledge_text}"),
    ("human", "{input}")
])

# Load Ollama model (gemma3:latest)
llm = OllamaLLM(model="gemma2:2b")

# Streamlit UI
st.set_page_config(page_title="Grab Super App Chatbot", page_icon="🤖")
st.title("UniLink Super App Chatbot")

# Keep chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Show chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# User input
if user_input := st.chat_input("Ask me something about this app..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # Run LLM
    chain = prompt | llm | StrOutputParser()
    response = chain.invoke({"input": user_input})

    # Add assistant message
    st.session_state.messages.append({"role": "assistant", "content": response})
    with st.chat_message("assistant"):
        st.markdown(response)
