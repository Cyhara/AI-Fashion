# Python + FastAPI + claid AI

# IMPORTS

# FastAPI creates our backend API
from fastapi import FastAPI, UploadFile, File

from pydantic import BaseModel

# Allows frontend and backend to communicate
from fastapi.middleware.cors import CORSMiddleware

# Loads values from the env. file
from dotenv import load_dotenv

# Used to access environment variables
import os

# Ued to communicate with claid
import requests

import cloudinary
import cloudinary.uploader

# LOAD ENVIRONMENT VARIABLES
load_dotenv()

# Get claid API key
CLAID_API_KEY = os.getenv("CLAID_API_KEY")

# CLOUDINARY CONFIGURATION
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# DATA RECEIVED FROM THE FRONTEND
class OutfitRequest(BaseModel):
    model_image_url: str
    clothing_image_url: str

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
async def generate_outfit(outfit: OutfitRequest):

    # CHECK API KEY
    if not CLAID_API_KEY:
        return {
            "success": False,
            "message": "Claid API key is missing."
        }

    # CHECK THAT BOTH URLS COME FROM CLOUDINARY
    if not outfit.model_image_url.startswith(
        "https://res.cloudinary.com/"
    ):
        return {
            "success": False,
            "message": "Invalid model image URL."
        }

    if not outfit.clothing_image_url.startswith(
        "https://res.cloudinary.com/"
    ):
        return {
            "success": False,
            "message": "Invalid clothing image URL."
        }

    # CLAID REQUEST HEADERS
    headers = {
        "Authorization": f"Bearer {CLAID_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # REQUEST DATA
    payload = {
        "input": {
            "model": outfit.model_image_url,
            "clothing": [
                outfit.clothing_image_url
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

        if response.status_code >= 400:
            return {
                "success": False,
                "status_code": response.status_code,
                "message": response.text
            }

        result = response.json()

        # GET TASK INFORMATION
        task_data = result.get("data", {})

        return {
            "success": True,
            "message": "Outfit generation started.",
            "task_id": task_data.get("id"),
            "status": task_data.get("status"),
            "result_url": task_data.get("result_url")
        }

    except requests.RequestException as error:
        return {
            "success": False,
            "message": "Could not connect to Claid.",
            "error": str(error)
        }


# CHECK GENERATED OUTFIT
@app.get("/generate-outfit/{task_id}")
def get_outfit(task_id: int):

    # CHECK API KEY
    if not CLAID_API_KEY:
        return {
            "success": False,
            "message": "Claid API key is missing."
        }

    headers = {
        "Authorization": f"Bearer {CLAID_API_KEY}",
        "Accept": "application/json"
    }

    try:
        response = requests.get(
            f"{CLAID_URL}/{task_id}",
            headers=headers,
            timeout=60
        )

        if response.status_code >= 400:
            return {
                "success": False,
                "status_code": response.status_code,
                "message": response.text
            }

        result = response.json()

        # GET TASK DATA
        task_data = result.get("data", {})
        status = task_data.get("status")

        # CHECK IF GENERATION FAILED
        if status == "ERROR":
            return {
                "success": False,
                "status": status,
                "message": "Claid could not generate the outfit.",
                "errors": task_data.get("errors", [])
            }

        # CHECK IF GENERATION IS COMPLETE
        if status == "DONE":

            output_objects = (
                task_data.get("result", {})
                .get("output_objects", [])
            )

            if not output_objects:
                return {
                    "success": False,
                    "status": status,
                    "message": "Generation finished, but no output image was returned."
                }

            # GET GENERATED IMAGE URL
            image_url = output_objects[0].get("tmp_url")

            return {
                "success": True,
                "status": status,
                "message": "Outfit generated successfully.",
                "image_url": image_url
            }

        # STILL PROCESSING
        return {
            "success": True,
            "status": status,
            "message": "Your outfit is still being generated.",
            "image_url": None
        }

    except requests.RequestException as error:
        return {
            "success": False,
            "message": "Could not connect to Claid.",
            "error": str(error)
        }

# UPLOAD IMAGES TO CLOUDINARY
@app.post("/upload-images")
async def upload_images(
    model_image: UploadFile = File(...),
    clothing_image: UploadFile = File(...)
):

    # Allowed image formats
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "image/avif"
    }

    # Check model image
    if model_image.content_type not in allowed_types:
        return {
            "success": False,
            "message": "Unsupported model image format."
        }

    # Check clothing image
    if clothing_image.content_type not in allowed_types:
        return {
            "success": False,
            "message": "Unsupported clothing image format."
        }

    try:

        # Read model image
        model_content = await model_image.read()

        # Read clothing image
        clothing_content = await clothing_image.read()

        # Upload model image to Cloudinary
        model_result = cloudinary.uploader.upload(
            model_content,
            folder="styleai/models",
            resource_type="image"
        )

        # Upload clothing image to Cloudinary
        clothing_result = cloudinary.uploader.upload(
            clothing_content,
            folder="styleai/clothing",
            resource_type="image"
        )

        # Return uploaded image URLs
        return {
            "success": True,
            "message": "Images uploaded successfully.",

            "model_image": {
                "filename": model_image.filename,
                "url": model_result["secure_url"]
            },

            "clothing_image": {
                "filename": clothing_image.filename,
                "url": clothing_result["secure_url"]
            }
        }

    except Exception as error:

        return {
            "success": False,
            "message": "Image upload failed.",
            "error": str(error)
        }