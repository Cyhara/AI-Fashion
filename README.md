# StyleAI

StyleAI is a fashion-focused web application that helps users discover personal style inspiration and generate outfit visuals using AI. The project combines a polished landing page with a FastAPI backend that integrates with the Claid AI image-generation service.

## What it does

- Showcases fashion styles such as Casual, Elegant, and Streetwear
- Presents a modern landing page for a personal AI fashion stylist brand
- Allows users to upload a model image and clothing image
- Sends the images to Claid AI to generate a styled outfit result
- Provides endpoints for health checks and image-generation status

## Project structure

- `frontend/styleai/` — HTML, CSS, and JavaScript for the website interface
- `backend/main.py` — FastAPI API server and AI integration logic
- `backend/requirements.txt` — Python dependencies
- `backend/.env` — environment variables (such as `CLAID_API_KEY`)

## Tech stack

- Python
- FastAPI
- Uvicorn
- JavaScript
- HTML5
- CSS3
- Claid AI API
- python-dotenv
- requests
- python-multipart

## Prerequisites

- Python 3.10+
- A working internet connection
- A Claid API key

## Setup

1. Open a terminal in the project root.
2. Move into the backend folder:

   ```bash
   cd backend
   ```

3. Create or activate a virtual environment if needed:

   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file inside `backend/` with your API key:

   ```env
   CLAID_API_KEY=your_api_key_here
   ```

## Run the app

Start the backend:

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

Then open the frontend in a browser:

```bash
cd frontend/styleai
python -m http.server 8000
```

Then visit:

- `http://localhost:8000` for the frontend
- `http://localhost:8000/docs` for the FastAPI Swagger docs if serving from the backend on the default port 8000

If you are running the backend separately, the API will typically be available at:1

- `http://localhost:8000`

## Main API endpoints

- `GET /` — home route
- `GET /health` — backend health status
- `GET /claid-test` — confirms API key setup
- `POST /generate-outfit` — generates an outfit from uploaded model/clothing images
- `GET /generate-outfit/{task_id}` — checks generation status
- `POST /upload-images` — receives uploaded image files

## Notes

- The frontend is a static page using plain HTML/CSS/JS.
- The backend is responsible for connecting to the external AI service.