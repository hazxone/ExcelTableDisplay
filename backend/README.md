# FastAPI Backend for Excel Processing

This is a FastAPI backend that provides mock Excel file processing for the Excel Table Display frontend.

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the FastAPI Server

```bash
# Run from the backend directory
uvicorn main:app --reload --port 8000

# Or run directly with Python
python main.py
```

### 3. Access the API

The server will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

## API Endpoints

### `POST /api/upload/excel`
Mock Excel file upload endpoint that returns sample table data.

**Request:**
- Multipart form data with `file` field

**Response:**
```json
{
  "fileId": "uuid-string",
  "filename": "uploaded-file.xlsx",
  "originalName": "uploaded-file.xlsx",
  "uploadedAt": "2024-03-17T10:00:00Z",
  "tables": {
    "SalesData": {
      "title": "Sales Data",
      "headers": ["Month", "Revenue", "Units", "Region", "Product"],
      "rows": [...],
      "rowCount": 9,
      "columnCount": 5,
      "dataType": {...}
    },
    "CustomerData": {
      "title": "Customer Analytics",
      "headers": ["CustomerID", "Name", "Email", "TotalOrders", "TotalSpent", "LastOrder"],
      "rows": [...],
      "rowCount": 6,
      "columnCount": 6,
      "dataType": {...}
    }
  }
}
```

### `GET /api/health`
Health check endpoint.

### `GET /api/files`
Mock endpoint to return available files (for frontend compatibility).

## Frontend Configuration

The frontend is configured to connect to this backend at `http://localhost:8000`. 

To run the full application:

1. **Terminal 1 - Start FastAPI backend:**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

2. **Terminal 2 - Start React frontend:**
   ```bash
   cd client
   npm run dev
   ```

3. **Open browser to:** `http://localhost:3000`

## Features

- ✅ Mock Excel processing with realistic sample data
- ✅ CORS configured for React frontend
- ✅ Auto-generated API documentation
- ✅ File upload handling (without actual file processing)
- ✅ Sample tables: Sales Data and Customer Analytics
- ✅ Compatible with existing frontend upload flow

## Future Enhancements

To implement real Excel processing:
1. Add `pandas` and `openpyxl` to requirements.txt
2. Parse the actual uploaded file in the `upload_excel` endpoint
3. Extract real table data from Excel sheets
4. Add data validation and error handling