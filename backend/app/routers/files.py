from fastapi import APIRouter, UploadFile, File
from typing import List, Dict, Any
import uuid

router = APIRouter()

@router.post("/upload/excel")
async def upload_excel(file: UploadFile = File(...)):
    """
    Mock Excel upload endpoint that returns sample table data
    without actually processing the uploaded file
    """
    
    # Generate a unique file ID
    file_id = str(uuid.uuid4())
    
    # Mock table data - simulating processed Excel sheets
    mock_tables = {
        "SalesData": {
            "title": "Sales Data",
            "headers": ["Month", "Revenue", "Units", "Region", "Product"],
            "rows": [
                {"Month": "January 2024", "Revenue": 125000, "Units": 1250, "Region": "North", "Product": "Laptop"},
                {"Month": "January 2024", "Revenue": 89000, "Units": 890, "Region": "South", "Product": "Phone"},
                {"Month": "January 2024", "Revenue": 156000, "Units": 780, "Region": "East", "Product": "Tablet"},
                {"Month": "February 2024", "Revenue": 134000, "Units": 1340, "Region": "North", "Product": "Laptop"},
                {"Month": "February 2024", "Revenue": 95000, "Units": 950, "Region": "South", "Product": "Phone"},
                {"Month": "February 2024", "Revenue": 168000, "Units": 840, "Region": "East", "Product": "Tablet"},
                {"Month": "March 2024", "Revenue": 142000, "Units": 1420, "Region": "North", "Product": "Laptop"},
                {"Month": "March 2024", "Revenue": 101000, "Units": 1010, "Region": "South", "Product": "Phone"},
                {"Month": "March 2024", "Revenue": 175000, "Units": 875, "Region": "East", "Product": "Tablet"}
            ],
            "rowCount": 9,
            "columnCount": 5,
            "dataType": {
                "Month": "string",
                "Revenue": "number",
                "Units": "number", 
                "Region": "string",
                "Product": "string"
            }
        },
        "CustomerData": {
            "title": "Customer Analytics",
            "headers": ["CustomerID", "Name", "Email", "TotalOrders", "TotalSpent", "LastOrder"],
            "rows": [
                {"CustomerID": "CUST001", "Name": "John Smith", "Email": "john@email.com", "TotalOrders": 15, "TotalSpent": 12500, "LastOrder": "2024-03-15"},
                {"CustomerID": "CUST002", "Name": "Sarah Johnson", "Email": "sarah@email.com", "TotalOrders": 8, "TotalSpent": 8900, "LastOrder": "2024-03-14"},
                {"CustomerID": "CUST003", "Name": "Mike Wilson", "Email": "mike@email.com", "TotalOrders": 23, "TotalSpent": 15600, "LastOrder": "2024-03-16"},
                {"CustomerID": "CUST004", "Name": "Emily Davis", "Email": "emily@email.com", "TotalOrders": 12, "TotalSpent": 13400, "LastOrder": "2024-03-13"},
                {"CustomerID": "CUST005", "Name": "David Brown", "Email": "david@email.com", "TotalOrders": 6, "TotalSpent": 9500, "LastOrder": "2024-03-12"},
                {"CustomerID": "CUST006", "Name": "Lisa Anderson", "Email": "lisa@email.com", "TotalOrders": 18, "TotalSpent": 16800, "LastOrder": "2024-03-17"}
            ],
            "rowCount": 6,
            "columnCount": 6,
            "dataType": {
                "CustomerID": "string",
                "Name": "string",
                "Email": "string",
                "TotalOrders": "number",
                "TotalSpent": "number",
                "LastOrder": "string"
            }
        }
    }
    
    # Return the mock data as if it was processed from the uploaded file
    return {
        "fileId": file_id,
        "filename": file.filename,
        "originalName": file.filename,
        "uploadedAt": "2024-03-17T10:00:00Z",
        "tables": mock_tables
    }

@router.get("/files")
async def get_files():
    """
    Mock endpoint to return available files (for compatibility with existing frontend)
    """
    return [{
        "id": "mock-file-1",
        "filename": "sample_data.xlsx",
        "originalName": "sample_data.xlsx",
        "uploadedAt": "2024-03-17T10:00:00Z",
        "tables": {
            "SalesData": {
                "title": "Sales Data",
                "headers": ["Month", "Revenue", "Units", "Region", "Product"],
                "rows": [
                    {"Month": "January 2024", "Revenue": 125000, "Units": 1250, "Region": "North", "Product": "Laptop"},
                    {"Month": "January 2024", "Revenue": 89000, "Units": 890, "Region": "South", "Product": "Phone"},
                    {"Month": "January 2024", "Revenue": 156000, "Units": 780, "Region": "East", "Product": "Tablet"}
                ],
                "rowCount": 9,
                "columnCount": 5,
                "dataType": {
                    "Month": "string",
                    "Revenue": "number",
                    "Units": "number", 
                    "Region": "string",
                    "Product": "string"
                }
            }
        }
    }]