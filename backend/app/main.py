import os
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List
from langchain.schema.document import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.messages import BaseMessage
from pathlib import Path
from openai import OpenAI
import aiofiles
import httpx
import time
import glob

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain.prompts import PromptTemplate

load_dotenv()

app = FastAPI()

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create the static directory if it does not exist
if not os.path.exists("static"):
    os.makedirs("static")

# Mount the static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

class QueryRequest(BaseModel):
    question: str
    filename: str

class AudioRequest(BaseModel):
    text: str

class CreateBookRequest(BaseModel):
    filename: str

class ScanRequest(BaseModel):
    filename: str

load_dotenv()
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
EMBEDDING = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
MODEL: str = "gpt-3.5-turbo"

CHUNK_SIZE: int = 4000
CHUNK_OVERLAP: int = 300
NUM_CONTEXTS: int = 3
TEMPERATURE: float = 0.1

# Initialize the LLM at startup
llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, temperature=TEMPERATURE, model=MODEL)

PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""^
    Du bist ein hilfreicher KI Assistent, der Kindern hilft, indem er Fragen zu Kinderbüchern beantwortet.
    Gib deine Antworten freundlich und tue so, als ob du eine Geschichten erzählende Eule bist.
    Stelle Nachfragen wie 'Was würde dich sonst noch interessieren?'
    Verwende nur die folgenden Informationen, um die Frage am Ende zu beantworten. 
    Halluziniere keine Informationen, die nicht im Text stehen - nur dieser Text! 
    Wenn eine Information nicht im Buch ist, schreibe "In dem Buch sind leider keine Antworten auf deine Frage."
    Ausnahmslos alle Antworten müssen in deutscher Sprache verfasst sein.

    QUESTION:
    {question}

    CONTEXT:
    {context}
    
    Answer:""",
)

@app.get("/")
async def welcome():
    return {"answer": "Hi, welcome to the API! :-)"}

@app.post("/create-book", status_code=status.HTTP_201_CREATED)
async def create_book(request: CreateBookRequest):
    filename = request.filename
    doc_path = f"./books/{filename}"
    store_path = f"./stores/{filename.split('.')[0]}"
    
    if os.path.exists(store_path):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vector store already exists")

    if not os.path.exists(doc_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF file not found")

    print(f"[INFO] Creating Vector Store for {filename}...")
    loader = PyPDFLoader(doc_path)
    document: List[Document] = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    split_documents = splitter.split_documents(document)

    db = FAISS.from_documents(documents=split_documents, embedding=EMBEDDING)
    db.save_local(store_path)

    return {"status": f"Vector store created successfully for {filename}"}

@app.post("/query-book", status_code=status.HTTP_200_OK)
async def query_book(request: QueryRequest):
    filename = request.filename
    store_path = f"./stores/{filename.split('.')[0]}"
    
    if not os.path.exists(store_path):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vector store does not exist. Please create it first.")
    
    print(f"[INFO] Loading Vector Store for {filename}...")
    db = FAISS.load_local(store_path, embeddings=EMBEDDING, allow_dangerous_deserialization=True)
    
    QUERY = request.question
    
    with open(f"logs/bookscanner.log", "a") as f:
        f.write(f"{QUERY}\n")
    
    context = db.similarity_search_with_relevance_scores(query=QUERY, k=NUM_CONTEXTS)
    context_text = "\n\n".join([doc.page_content for doc, score in context])
    
    messages = [SystemMessage(content=PROMPT.format(question=QUERY, context=context_text))]
    print(messages)
    answer: BaseMessage = llm.invoke(messages)
    print(answer.content)
    return {"answer": answer.content}

@app.get("/receive-books")
async def receive_books():
    books = []
    for filename in os.listdir("./books"):
        books.append(filename)

    return {"books": books}

@app.get("/receive-intro-audio")
async def receive_intro_audio():
    # stream the audio file
    return {"audio_file": "/static/intro.mp3"}

@app.post('/scan-book', status_code=status.HTTP_201_CREATED)
async def scan_book(request: ScanRequest):
    # Get the latest (by time) file in the books directory, this is the latest book.
    # Rename this book to the requested filename
    
    filename = request.filename
    doc_path = f"./books/{filename}"
    
    if os.path.exists(doc_path):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Book already exists")
    
    latest_file = glob.glob(f'./books/*')
    # get just the file that was created last
    latest_file = max(latest_file, key=os.path.getctime)
    latest_file_path = latest_file

    print(f"[INFO] Scanning {latest_file_path}...")

    # Add .pdf to file name in case it is not already

    if not doc_path.endswith(".pdf"):
        doc_path = doc_path + ".pdf"

    os.rename(latest_file_path, doc_path)
    return {"status": f"Book {latest_file} scanned successfully and saved as {filename}"}


@app.post("/generate-audio", status_code=status.HTTP_201_CREATED)
async def generate_audio(request: AudioRequest):
    client = OpenAI()
    timestamp = int(time.time())
    speech_file_path = f"./static/speech_{timestamp}.mp3"
    
    response = client.audio.speech.create(
        model="tts-1",
        voice="echo",
        input=request.text
    )

    async with aiofiles.open(speech_file_path, 'wb') as out_file:
        content = await response.aread()
        await out_file.write(content)
    
    return {"audio_file": f"/static/speech_{timestamp}.mp3"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
