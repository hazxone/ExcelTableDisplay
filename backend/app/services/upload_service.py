from typing import Dict, Any
from ..core.excel_agent import process_excel_file

def upload_and_process_excel(filename: str) -> Dict[str, Any]:
    """
    Upload and process an Excel file using the Excel processing agent
    
    Args:
        filename: Name of the uploaded file
    
    Returns:
        Dictionary matching the UploadResponse structure
    """
    return process_excel_file(filename)

def get_available_files() -> list[Dict[str, Any]]:
    """
    Get list of available files (mock implementation)
    
    Returns:
        List of available file information
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