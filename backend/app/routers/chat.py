from fastapi import APIRouter, Depends
from typing import Dict, Any
from ..services.chat_service import create_chat_session, process_chat_message, clear_chat_session, get_insights_suggestions

router = APIRouter()

@router.post("/sessions")
async def create_chat_session_endpoint(request: Dict[str, Any]):
    """
    Create a new chat session - Agno handles sessions automatically
    """
    file_id = request.get("fileId", "")
    selected_tables = request.get("selectedTables", [])
    
    return create_chat_session(file_id, selected_tables)

@router.post("/sessions/{session_id}/messages")
async def send_chat_message_endpoint(session_id: str, request: Dict[str, Any]):
    """
    Process a chat message and return AI response using Agno agent
    """
    message = request.get("message", "")
    selected_tables = request.get("selectedTables", {})
    
    return process_chat_message(session_id, message, selected_tables)

@router.delete("/sessions/{session_id}")
async def clear_chat_session_endpoint(session_id: str):
    """
    Clear a chat session's history (Agno handles session persistence automatically)
    """
    return clear_chat_session(session_id)

@router.post("/insights/suggestions")
async def get_insights_suggestions_endpoint(request: Dict[str, Any]):
    """
    Generate insight suggestions based on provided tables
    """
    tables = request.get("tables", {})
    
    return get_insights_suggestions(tables)