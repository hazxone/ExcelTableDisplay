### **Refactoring Plan: Backend (FastAPI)**

Your current backend is a single, large file. The primary goal here is to break it down into a logical structure that separates API endpoints, business logic, data models, and configuration.

#### **1. Implement a Scalable Project Structure**

**Problem:** All code—FastAPI app, Pydantic models, agent logic, and endpoints—resides in one file. This is difficult to navigate and maintain.

**Plan:**
Create a directory structure that separates concerns.

```text
/your-project
├── app/
│   ├── __init__.py
│   ├── main.py             # App entry point, middleware, router includes
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── chat.py         # Endpoints related to chat sessions
│   │   └── files.py        # Endpoints for file uploads, etc.
│   ├── services/
│   │   ├── __init__.py
│   │   └── chat_service.py # Core business logic for chat processing
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── chat.py         # All Pydantic models/schemas
│   ├── core/
│   │   ├── __init__.py
│   │   ├── agent.py        # Agno agent setup and configuration
│   │   └── config.py       # Environment variables and settings
│   └── utils/
│       ├── __init__.py
│       └── prompt_builder.py # Helper for creating the enhanced prompt
├── chat_sessions.db        # SQLite database
└── requirements.txt
```

**Execution Steps:**
1.  Create the directory structure as shown above.
2.  Move the FastAPI app instantiation (`app = FastAPI(...)`), middleware configuration, and router includes into `app/main.py`.
3.  Move all Pydantic models (`ChartDataset`, `AnalysisResponse`, etc.) into `app/schemas/chat.py`.
4.  Move the Agno agent creation and configuration logic into `app/core/agent.py`. This file will export a single, configured `agent` instance.
5.  Split the API endpoints:
    *   Move `@app.post("/api/chat/...")` and `@app.delete("/api/chat/...")` into `app/routers/chat.py`. Use `APIRouter` from FastAPI.
    *   Move `@app.post("/api/upload/...")` and other file-related endpoints into `app/routers/files.py`.
6.  In `app/main.py`, import and include these routers using `app.include_router(...)`.

#### **2. Decouple Business Logic from API Endpoints**

**Problem:** The `/api/chat/sessions/{session_id}/messages` endpoint is doing too much: building context strings, creating prompts, calling the agent, parsing the response, and formatting the final JSON. This makes it hard to test and reuse.

**Plan:**
Create a "service layer" to handle the core business logic. The API endpoint's only job should be to handle the HTTP request/response cycle and call the service.

**Execution Steps:**
1.  Create a new file: `app/services/chat_service.py`.
2.  Create a function within it, for example, `process_chat_message(session_id: str, user_message: str, selected_tables: dict) -> dict:`.
3.  Move the entire logic from inside the `send_chat_message` endpoint into this new service function. This includes:
    *   Building the `table_context`.
    *   Calling `create_enhanced_prompt`.
    *   Running `agent.run(...)`.
    *   The entire `try...except` block for parsing the agent's response.
    *   Formatting the final response dictionary (`chatResponse`, `analysisOutput`).
4.  The endpoint function in `app/routers/chat.py` will now become very simple:
    *   It will receive the request body.
    *   It will call `chat_service.process_chat_message(...)` with the necessary data.
    *   It will return the dictionary it receives from the service.

**Why this is better:**
*   **Testability:** You can now write unit tests for `chat_service.py` without needing to simulate HTTP requests.
*   **Reusability:** If you ever need to trigger this logic from another part of the system (e.g., a background job), you can just call the service function.
*   **Clarity:** The endpoint file (`chat.py`) becomes a clean, readable map of your API routes.

#### **3. Isolate Prompt Engineering**

**Problem:** The `create_enhanced_prompt` function is business logic mixed with the API layer.

**Plan:**
Move this helper function to a dedicated utility module.

**Execution Steps:**
1.  Create the file `app/utils/prompt_builder.py`.
2.  Move the `create_enhanced_prompt` function into this file.
3.  The `chat_service.py` will now import this function from `app.utils.prompt_builder`.

