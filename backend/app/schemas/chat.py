from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ChartDataset(BaseModel):
    label: str
    data: List[Any]
    backgroundColor: str

class ChartData(BaseModel):
    type: Optional[str] = None  # "bar", "line", "pie"
    labels: List[str]
    datasets: List[ChartDataset]

class TableData(BaseModel):
    headers: List[str]
    rows: List[Dict[str, Any]]

class AnalysisResponse(BaseModel):
    content: str
    output_type: str  # "text", "chart", "table"
    chart_data: Optional[ChartData] = None
    table_data: Optional[TableData] = None
    title: str

class ChatResponse(BaseModel):
    content: str
    follow_up_suggestions: Optional[List[str]] = None

class StructuredAgentResponse(BaseModel):
    chat_response: ChatResponse
    analysis_response: AnalysisResponse