from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Excel Processing API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # CORS settings
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    cors_allow_credentials: bool = True
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]
    
    # Database settings
    database_url: str = "sqlite:///./chat_sessions.db"
    
    # OpenAI settings
    openai_model: str = "gpt-4o"
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"

settings = Settings()