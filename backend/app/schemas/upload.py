from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class DataTypeInfo(BaseModel):
    """Information about data types for each column"""
    type: str

class TableInfo(BaseModel):
    """Information about a specific table in the Excel file"""
    title: str
    headers: List[str]
    rows: List[Dict[str, Any]]
    rowCount: int
    columnCount: int
    dataType: Dict[str, str]

class UploadResponse(BaseModel):
    """Response structure for Excel file upload"""
    fileId: str
    filename: str
    originalName: str
    uploadedAt: str
    tables: Dict[str, TableInfo]

class ExcelProcessingRequest(BaseModel):
    """Request structure for Excel processing"""
    filename: str
    fileContent: str  # Base64 encoded file content or file path
    processingInstructions: Optional[str] = "Analyze the Excel file and extract all tables with their data"