from fastapi import APIRouter, UploadFile, File
from ..services.upload_service import upload_and_process_excel, get_available_files

router = APIRouter()

@router.post("/upload/excel")
async def upload_excel(file: UploadFile = File(...)):
    """
    Excel upload endpoint that processes the uploaded file using AI agent
    to extract and analyze table data
    """
    # Process the Excel file using the AI agent
    result = upload_and_process_excel(file.filename or "uploaded_file.xlsx")
    
    return result

@router.get("/files")
async def get_files():
    """
    Endpoint to return available files (for compatibility with existing frontend)
    """
    return get_available_files()