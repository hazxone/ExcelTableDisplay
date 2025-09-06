from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.storage.sqlite import SqliteStorage
from agno.tools.calculator import CalculatorTools
from ..schemas.chat import StructuredAgentResponse
from .config import settings

agent = Agent(
    name="Excel Analysis Assistant",
    model=OpenAIChat(id=settings.openai_model),
    tools=[
        CalculatorTools(
            add=True,
            subtract=True,
            multiply=True,
            divide=True,
            exponentiate=True,
            factorial=True,
            is_prime=True,
            square_root=True,
        )
    ],
    show_tool_calls=True,
    response_model=StructuredAgentResponse,
    use_json_mode=True,
    storage=SqliteStorage(table_name="chat_sessions", db_file=settings.database_url.replace("sqlite:///", "")),
    add_history_to_messages=True,
    markdown=True,
    num_history_responses=5,
)