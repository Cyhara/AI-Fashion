# Python + FastAPI + claid AI

# IMPORTS

# FastAPI creates our backend API
from fastapi import FastAPI, UploadFile, File

# Allows frontend and backend to communicate
from fastapi.middleware.cors import CORSMiddleware

# Loads values from the env. file
from dotenv import load_dotenv

# Used to access environment variables
import os

# Ued to communicate with claid
import requests

# LOAD ENVIRONMENT VARIABLES
load_dotenv()

# Get claid API key
CLAID_API_KEY = os.getenv("CLAID_API_KEY")

# CREATE FASTAPI APPLICATION
app = FastAPI(
    title="StyleAI API",
    description="AI-powered fashion styling API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,

    # Development setting
    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)

# CLAID API SETTINGS
CLAID_URL = (
    "https://api.claid.ai/v1/image/"
    "ai-fashion-models"
)

# HOME ROUTE
@app.get("/")
def home():

    return {
        "message": "welcome to StyleAI!",
        "status": "Backend is running"
    }

# HEALTH CHECK
@app.get("/health")
def health_check():

    return {
        "status": "healthy",

        # True means the API key was found
        "claid_configured": bool(CLAID_API_KEY)
    }

# TEST CLAID CONNECTION
@app.get("/claid-test")
def claid_test():

    # Check whether the API key exists
    if not CLAID_API_KEY:

        return {
            "success": False,
            "message": "CLAID_API_KEY is missing."
        }

    return {
        "success": True,
        "message": "claid API key is configured."
    }

# GENERATE OUTFIT
@app.post("/generate-outfit")
async def generate_outfit(
    model_image: UploadFile,
    clothing_image: UploadFile
):

    # CHECK API KEY
    if not CLAID_API_KEY:

        return {
            "success": False,
            "message": "claid API key is missing."
        }

    # CLAID REQUEST HEADERS
    headers = {

        # Claid requires Bearer Authentication
        "Authorization": f"Bearer {CLAID_API_KEY}",

        # Tell claid we are sending JSON data
        "content-Type": "application/json",
        "Accept": "application/json"
    }

    # REQUEST DATA
    payload = {
        "input": {
            "model": model_image,
            "clothing": [
                clothing_image
            ]
        },
        "options": {
            "pose": "full body, front view, neutral stance, arms relaxed",
            "background": "minimalistic studio background",
            "aspect_ratio": "3:4"
        },
        "output": {
            "format": "png",
            "number_of_images": 1
        }
    }

    # SEND REQUEST TO CLAID
    try:

        response = requests.post(
            CLAID_URL,
            headers=headers,
            json=payload,
            timeout=60
        )

        # CHECK RESPONSE
        if response.status_code >= 400:

            return {
                "success": False,
                "status_code": response.status_code,
                "message": response.text
            }

        # Convert claid response to JSON
        result = response.json()

        # RETURN RESULT TO FRONTEND
        return {
            "success": True,
            "result": result
        }

    # HANDLE CONNECTION ERRORS
    except requests.RequestException as error:

        return {
            "success": False,
            "message": "Could not connect to Claid.",
            "error": str(error)
        }

@app.get("/generate-outfit/{task_id}")
def get_outfit(task_id: int):
    # Check that the API key exists
    if not CLAID_API_KEY:
        return {
            "success": False,
            "message": "Claid API key is missing."
        }

    # Headers for Claid
    headers = {
        "Authorization": f"Bearer {CLAID_API_KEY}",
        "Accept": "application/json"
    }

    try:
        # Ask Claid for the status of the generation
        response = requests.get(
            f"{CLAID_URL}/{task_id}",
            headers=headers,
            timeout=60
        )

        # Return Claid error
        if response.status_code >= 400:
            return {
                "success": False,
                "status_code": response.status_code,
                "message": response.text
            }

        # Convert response to JSON
        result = response.json()

        return {
            "success": True,
            "result": result
        }

    except requests.RequestException as error:
        return {
            "success": False,
            "message": "Could not connect to Claid.",
            "error": str(error)
        }

@app.post("/upload-images")
async def upload_images(
    model_image: UploadFile = File(...),
    clothing_image: UploadFile = File(...)
):
    """
    Receives the model photo and clothing photo
    from the StyleAI frontend.
    """

    # Allowed image formats
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
        "image/bmp",
        "image/avif",
        "image/heic"
    }

    # Check model image type
    if model_image.content_type not in allowed_types:
        return {
            "success": False,
            "message": f"Model image type is not supported: {model_image.content_type}"
        }

    # Check clothing image type
    if clothing_image.content_type not in allowed_types:
        return {
            "success": False,
            "message": f"Clothing image type is not supported: {clothing_image.content_type}"
        }

    return {
        "success": True,
        "message": "Images uploaded successfully.",
        "model_image": {
            "filename": model_image.filename,
            "content_type": model_image.content_type
        },
        "clothing_image": {
            "filename": clothing_image.filename,
            "content_type": clothing_image.content_type
        }
    }