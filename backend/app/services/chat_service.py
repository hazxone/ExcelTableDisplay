import uuid
from typing import Dict, Any
from ..core.agent import agent
from ..utils.prompt_builder import create_enhanced_prompt
from ..schemas.chat import StructuredAgentResponse

def process_chat_message(session_id: str, message: str, selected_tables: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process a chat message and return AI response using Agno agent
    """
    # Create context about selected tables for the agent
    table_context = ""
    if selected_tables:
        table_context = "The user has selected the following tables for analysis:\n"
        for table_name, table_info in selected_tables.items():
            table_context += f"- {table_name}: {table_info.get('title', 'Unknown')}\n"
            table_context += f"  Columns: {', '.join(table_info.get('headers', []))}\n"
            table_context += f"  Rows: {table_info.get('rowCount', 0)}\n"
            
            # Include complete table data for analysis
            rows = table_info.get('rows', [])
            if rows:
                table_context += "  Complete table data:\n"
                for i, row in enumerate(rows):
                    table_context += f"    Row {i+1}: "
                    row_data = []
                    for header in table_info.get('headers', []):
                        row_data.append(f"{header}: {row.get(header, 'N/A')}")
                    table_context += " | ".join(row_data) + "\n"
            table_context += "\n"
    
    # Create enhanced prompt for structured output
    enhanced_prompt = create_enhanced_prompt(message, table_context, selected_tables)
    
    print(f"Enhanced prompt sent to agent: {enhanced_prompt}")
    
    # Use Agno agent to generate structured response
    try:
        response = agent.run(
            message=enhanced_prompt,
            session_id=session_id,
            stream=False
        )
        
        # Process the RunResponse from the agent
        print("RunResponse content type:", response.content_type)
        print("RunResponse content:", response.content)
        
        # Extract structured data from RunResponse.content
        if response.content:
            if hasattr(response.content, 'chat_response') and hasattr(response.content, 'analysis_response'):
                # Content contains the StructuredAgentResponse object
                structured_response = response.content
                chat_response = structured_response.chat_response
                analysis_response = structured_response.analysis_response
            elif isinstance(response.content, dict):
                # Content is a dictionary, convert to Pydantic models
                try:
                    structured_response = StructuredAgentResponse(**response.content)
                    chat_response = structured_response.chat_response
                    analysis_response = structured_response.analysis_response
                    print("Converted dict to Pydantic models")
                except Exception as e:
                    print(f"Failed to convert dict to Pydantic: {e}")
                    # Fallback to simple response
                    response_text = str(response.content)
                    chat_response = type('ChatResponse', (), {
                        'content': "I've analyzed your request. Check the analysis panel for results.",
                        'follow_up_suggestions': None
                    })()
                    analysis_response = type('AnalysisResponse', (), {
                        'content': response_text,
                        'output_type': 'text',
                        'title': 'Analysis Result',
                        'chart_data': None
                    })()
            else:
                # Unexpected content format
                print("Unexpected content format:", type(response.content))
                response_text = str(response.content)
                chat_response = type('ChatResponse', (), {
                    'content': "I've analyzed your request. Check the analysis panel for results.",
                    'follow_up_suggestions': None
                })()
                analysis_response = type('AnalysisResponse', (), {
                    'content': response_text,
                    'output_type': 'text',
                    'title': 'Analysis Result',
                    'chart_data': None
                })()
        else:
            # No content in response
            print("No content in response")
            chat_response = type('ChatResponse', (), {
                'content': "I apologize, but I couldn't generate a response.",
                'follow_up_suggestions': None
            })()
            analysis_response = type('AnalysisResponse', (), {
                'content': "No response content available.",
                'output_type': 'text',
                'title': 'Error',
                'chart_data': None
            })()
        
        # Convert chart data to dict if present
        chart_data_dict = None
        if analysis_response.chart_data:
            # Wrap the chart data in the expected format for the frontend
            chart_data_dict = {
                "type": analysis_response.chart_data.type or "bar",  # Use dynamic chart type
                "data": {
                    "labels": analysis_response.chart_data.labels,
                    "datasets": []
                },
                "options": {}
            }
            for dataset in analysis_response.chart_data.datasets:
                dataset_dict = {
                    "label": dataset.label,
                    "data": dataset.data,
                }
                
                # Handle backgroundColor based on chart type
                if isinstance(dataset.backgroundColor, list):
                    # For pie charts, backgroundColor is a list of colors
                    dataset_dict["backgroundColor"] = dataset.backgroundColor
                else:
                    # For bar/line charts, backgroundColor is a single string
                    dataset_dict["backgroundColor"] = dataset.backgroundColor
                
                # Special handling for pie charts to ensure colors are provided
                if chart_data_dict["type"] == "pie":
                    if isinstance(dataset_dict["backgroundColor"], str):
                        # Convert single color to list for pie chart
                        default_colors = ["#FF6B35", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#FF8C94", "#A8E6CF"]
                        dataset_dict["backgroundColor"] = default_colors[:len(dataset.data)]
                    elif not dataset_dict["backgroundColor"] or len(dataset_dict["backgroundColor"]) != len(dataset.data):
                        # Ensure we have enough colors for all pie slices
                        default_colors = ["#FF6B35", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#FF8C94", "#A8E6CF"]
                        dataset_dict["backgroundColor"] = default_colors[:len(dataset.data)]
                
                chart_data_dict["data"]["datasets"].append(dataset_dict)
            print("Chart data converted:", chart_data_dict)
        
        # Convert table data to dict if present
        table_data_dict = None
        if analysis_response.table_data:
            table_data_dict = {
                "headers": analysis_response.table_data.headers,
                "rows": analysis_response.table_data.rows
            }
            print("Table data converted:", table_data_dict)
        
        print("Chat response:", chat_response)
        print("Analysis response:", analysis_response)
        
        return {
            "chatResponse": {
                "userMessage": {
                    "id": str(uuid.uuid4()),
                    "content": message,
                    "sender": "user",
                    "timestamp": "2024-03-17T10:00:00Z"
                },
                "assistantMessage": {
                    "id": str(uuid.uuid4()),
                    "content": chat_response.content,
                    "sender": "assistant",
                    "timestamp": "2024-03-17T10:00:01Z"
                }
            },
            "analysisOutput": {
                "id": str(uuid.uuid4()),
                "type": analysis_response.output_type,
                "title": analysis_response.title,
                "content": analysis_response.content,
                "chartData": chart_data_dict,
                "tableData": table_data_dict,
                "timestamp": "2024-03-17T10:00:01Z"
            }
        }
    
    except Exception as e:
        # Fallback response if Agno fails
        error_message = f"I apologize, but I encountered an error processing your request: {str(e)}"
        return {
            "chatResponse": {
                "userMessage": {
                    "id": str(uuid.uuid4()),
                    "content": message,
                    "sender": "user",
                    "timestamp": "2024-03-17T10:00:00Z"
                },
                "assistantMessage": {
                    "id": str(uuid.uuid4()),
                    "content": error_message,
                    "sender": "assistant",
                    "timestamp": "2024-03-17T10:00:01Z"
                }
            },
            "analysisOutput": {
                "id": str(uuid.uuid4()),
                "type": "text",
                "title": "Error",
                "content": f"## Processing Error\n\nUnable to complete the analysis due to a technical issue. Please try again.",
                "chartData": None,
                "timestamp": "2024-03-17T10:00:01Z"
            }
        }

def create_chat_session(file_id: str = "", selected_tables: list = None) -> Dict[str, Any]:
    """
    Create a new chat session - Agno handles sessions automatically
    """
    session_id = str(uuid.uuid4())
    
    # Initialize the session with Agno by sending a welcome message
    try:
        welcome_response = agent.run(
            message="Hello! I'm your Excel analysis assistant. I'm ready to help you analyze your data.",
            session_id=session_id,
            stream=False
        )
    except Exception:
        # If Agno fails, continue without initializing the session
        pass
    
    return {
        "id": session_id,
        "fileId": file_id,
        "messages": [],
        "selectedTables": selected_tables or [],
        "createdAt": "2024-03-17T10:00:00Z"
    }

def clear_chat_session(session_id: str) -> Dict[str, Any]:
    """
    Clear a chat session's history (Agno handles session persistence automatically)
    """
    # Note: Agno manages session persistence automatically
    # This endpoint provides a way to signal that a session should be reset
    # The actual session history will be cleared when a new session with the same ID is created
    return {"status": "cleared", "session_id": session_id}

def get_insights_suggestions(tables: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate insight suggestions based on provided tables
    """
    suggestions = [
        "What is the total revenue by region?",
        "Which product has the highest sales?",
        "Show me the monthly revenue trend",
        "What's the average order value per customer?",
        "Compare performance across different regions",
        "Analyze customer spending patterns",
        "What are the top-selling products by revenue?",
        "How does customer count correlate with revenue?"
    ]
    
    return {"suggestions": suggestions}