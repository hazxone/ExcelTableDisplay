import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUpload } from "@/components/file-upload";
import { TableSelectionSidebar } from "@/components/table-selection-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { OutputDisplay } from "@/components/output-display";
import { Button } from "@/components/ui/button";
import { Moon, Sun, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { type ExcelFile, type ChatSession, type ChatMessage, type TablesData } from "@shared/schema";

export default function Dashboard() {
  const [currentFile, setCurrentFile] = useState<ExcelFile | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Load mock file on component mount
  useEffect(() => {
    const loadMockFile = async () => {
      try {
        const response = await apiRequest('GET', '/api/files');
        const files = await response.json();
        if (files.length > 0) {
          setCurrentFile(files[0]);
          // Auto-select first two tables
          const tableKeys = Object.keys(files[0].tables || {});
          setSelectedTables(tableKeys.slice(0, 2));
        }
      } catch (error) {
        console.error('Failed to load mock file:', error);
      }
    };

    loadMockFile();
  }, []);

  // Create chat session when file is loaded
  const createSessionMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest('POST', '/api/chat/sessions', {
        fileId,
        messages: [],
        selectedTables: []
      });
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, message, selectedTables }: { sessionId: string; message: string; selectedTables: any }) => {
      const response = await apiRequest('POST', `/api/chat/sessions/${sessionId}/messages`, {
        message,
        selectedTables
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (currentSession) {
        const updatedMessages = [
          ...((currentSession.messages as ChatMessage[]) || []),
          data.userMessage,
          data.assistantMessage
        ];
        setCurrentSession({
          ...currentSession,
          messages: updatedMessages
        });
      }
    }
  });

  // Get suggestions mutation
  const getSuggestionsMutation = useMutation({
    mutationFn: async (tables: TablesData) => {
      const response = await apiRequest('POST', '/api/insights/suggestions', { tables });
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
    }
  });

  useEffect(() => {
    if (currentFile && !currentSession) {
      createSessionMutation.mutate(currentFile.id);
    }
  }, [currentFile]);

  useEffect(() => {
    // Toggle dark mode class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFileUploaded = (file: ExcelFile) => {
    setCurrentFile(file);
    setSelectedTables([]);
    setCurrentSession(null);
  };

  const handleTableToggle = (tableKey: string, selected: boolean) => {
    setSelectedTables(prev => {
      if (selected) {
        return [...prev, tableKey];
      } else {
        return prev.filter(key => key !== tableKey);
      }
    });
  };

  const handleGenerateContext = () => {
    if (!currentFile || !currentFile.tables) return;

    const selectedTablesData: TablesData = {};
    selectedTables.forEach(tableKey => {
      if ((currentFile.tables as any)[tableKey]) {
        selectedTablesData[tableKey] = (currentFile.tables as any)[tableKey];
      }
    });

    getSuggestionsMutation.mutate(selectedTablesData);
  };

  const handleSendMessage = (message: string) => {
    if (!currentSession || !currentFile) return;

    const selectedTablesData: TablesData = {};
    selectedTables.forEach(tableKey => {
      if ((currentFile.tables as any)[tableKey]) {
        selectedTablesData[tableKey] = (currentFile.tables as any)[tableKey];
      }
    });

    sendMessageMutation.mutate({
      sessionId: currentSession.id,
      message,
      selectedTables: selectedTablesData
    });
  };

  const currentMessages = (currentSession?.messages as ChatMessage[]) || [];
  const currentOutput = currentMessages.length > 0 
    ? currentMessages[currentMessages.length - 1] 
    : null;

  const isTyping = sendMessageMutation.isPending;

  return (
    <div className="flex h-screen bg-background">
      {/* Table Selection Sidebar */}
      {currentFile && (
        <TableSelectionSidebar
          tables={(currentFile.tables as TablesData) || {}}
          selectedTables={selectedTables}
          onTableToggle={handleTableToggle}
          onGenerateContext={handleGenerateContext}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Excel Data Analysis</h1>
              <p className="text-sm text-muted-foreground">Upload, analyze, and chat with your data</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span data-testid="file-status">
                  {currentFile ? `${currentFile.originalName} loaded` : 'No file loaded'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                data-testid="button-theme-toggle"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden">
          {/* Left Column - File Upload & Chat */}
          <div className="flex flex-col space-y-6">
            {/* File Upload Section */}
            {!currentFile && (
              <FileUpload
                onFileUploaded={handleFileUploaded}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            )}

            {/* Chat Interface */}
            {currentFile && (
              <ChatInterface
                messages={currentMessages}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                suggestions={suggestions}
              />
            )}
          </div>

          {/* Right Column - Output Display */}
          <OutputDisplay
            currentOutput={currentOutput?.sender === 'assistant' ? currentOutput : null}
            analysisHistory={currentMessages}
          />
        </div>
      </div>
    </div>
  );
}
