# Tale Owl AI

## Description
Tale Owl AI is a reserach project developed for the [Long Night of Reserach](https://langenachtderforschung.at/station/3682).
The aim of the project is to show reading books changes in times of generative AI.
Instead of reading a book from cover to cover readers can ask question, clarify things, ask for differente language, etc.
Users can load books into the system's library (e.g. PDFs or scanned books) and switch between books. 
After a book is loaded, users can chat with the book.
The system is using OpenAIs TTS (text-to-speech) models to generate an audio output. 

The project consists of two components, a frontend and a backend. 
The frontend is developed in TypeScript and uses the [Three.js](threejs.org) library to visualize 3d objects and make the syste more engaging. 
The backend is a Python-based stack, using FastAPI to create a REST API. 
Using GPT 3.5 Turbo (via OpenAI API) the questions were answered based on the input files. 
Langchain's PromptTemplate class was used to retrieve the corresponding answers from the provided document. 

> [!NOTE] 
> This project is based on our reserach on the ALiVE system: Steinmaurer A., Dengel A., Comanici M., Buchner J., Memminger J., and Gütl C., (in press). Immersive Learning in History Education: Exploring the Capabilities of Virtual Avatars and Large Language Models. In: Proceedings of the International Conference of the Immersive Learning Research Network (iLRN) 2024.


## Installation

The backend and frontend are set up using Docker. 
To install both components Docker has to be installed. 

### Backend

The books should be uploaded in the ``books`` directory as PDFs.
Within the ``static`` folder all audio files are generated.
The vector stores are created in the ``stores`` directory. 

Check the ``.env`` file to put your OpenAI API Key.

```
cd backend
docker-compose build
docker-compose up -d
```

After the container is up, the backend can be accessed via ``http://localhost:8000``. 
All routes are listed in the ``backend/app/main.py`` directory. 

### Frontend

The frontend can be installed similar to the backend:

```
cd frontend
docker-compose build
docker-compose up -d
```

To access the frontend use ``http://localhost:3000``.