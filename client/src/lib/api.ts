// API configuration for FastAPI backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Regular API requests
export const apiRequest = async (method: string, endpoint: string, data?: any) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response;
};

// File upload function
export const uploadFile = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/api/upload/excel`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Health check
export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
};

// Chat session management
export const createChatSession = async (fileId: string, selectedTables: any[] = []) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileId, selectedTables }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create chat session');
  }
  
  return response.json();
};

// Send chat message
export const sendChatMessage = async (sessionId: string, message: string, selectedTables: any) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, selectedTables }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
};

// Get insight suggestions
export const getInsightSuggestions = async (tables: any) => {
  const response = await fetch(`${API_BASE_URL}/api/insights/suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tables }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get suggestions');
  }
  
  return response.json();
};