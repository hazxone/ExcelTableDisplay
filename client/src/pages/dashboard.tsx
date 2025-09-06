import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUpload } from "@/components/file-upload";
import { TableSelectionSidebar } from "@/components/table-selection-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { OutputDisplay } from "@/components/output-display";
import { EmptyState } from "@/components/empty-state";
import { UploadModal } from "@/components/upload-modal";
import { ProcessingScreen } from "@/components/processing-screen";
import { Button } from "@/components/ui/button";
import { Moon, Sun, CheckCircle2, Upload, X } from "lucide-react";
import { apiRequest, uploadFile } from "@/lib/api";
import { type ExcelFile, type ChatSession, type ChatMessage, type TablesData } from "@shared/schema";

interface DashboardState {
  status: 'empty' | 'uploading' | 'processing' | 'ready';
  uploadProgress?: number;
  processingStep?: string;
  showUploadModal?: boolean;
}

export default function Dashboard() {
  const [dashboardState, setDashboardState] = useState<DashboardState>({ status: 'empty' });
  const [currentFile, setCurrentFile] = useState<ExcelFile | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Initialize dashboard state
  useEffect(() => {
    // Start with empty state - user needs to upload a file
    setDashboardState({ status: 'empty' });
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

  const handleFileUpload = async (file: File) => {
    try {
      // Close upload modal and show upload progress
      setDashboardState({ status: 'uploading', uploadProgress: 0, showUploadModal: false });
      
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setDashboardState(prev => ({ ...prev, uploadProgress: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Show processing state
      setDashboardState({ status: 'processing', processingStep: 'Initializing...' });
      
      // Simulate processing steps
      const processingSteps = [
        'Validating Excel file...',
        'Reading workbook structure...',
        'Parsing table data...',
        'Analyzing data relationships...',
        'Preparing for AI analysis...'
      ];
      
      for (const step of processingSteps) {
        setDashboardState(prev => ({ ...prev, processingStep: step }));
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // ACTUAL: Send to FastAPI backend
      const result = await uploadFile(file);
      
      // Create file object from FastAPI response
      const newFile: ExcelFile = {
        id: result.fileId,
        filename: result.filename,
        originalName: result.originalName,
        uploadedAt: new Date(result.uploadedAt),
        tables: result.tables
      };
      
      setCurrentFile(newFile);
      
      // Auto-select first two tables
      const tableKeys = Object.keys(result.tables);
      setSelectedTables(tableKeys.slice(0, 2));
      
      // Transition to ready state
      setDashboardState({ status: 'ready' });
    } catch (error) {
      console.error('Upload failed:', error);
      setDashboardState({ status: 'empty' });
    }
  };

  const handleFileUploaded = (file: ExcelFile) => {
    setCurrentFile(file);
    setSelectedTables([]);
    setCurrentSession(null);
    setDashboardState({ status: 'ready' });
  };

  const handleCancelUpload = () => {
    // If we came from the upload modal, return to ready state
    if (currentFile) {
      setDashboardState({ status: 'ready', showUploadModal: false });
    } else {
      setDashboardState({ status: 'empty' });
    }
  };

  const handleUploadNewFile = () => {
    // Show upload modal without resetting current state
    setDashboardState(prev => ({ ...prev, showUploadModal: true }));
  };

  const handleCloseUploadModal = () => {
    // Close upload modal and return to current dashboard
    setDashboardState(prev => ({ ...prev, showUploadModal: false }));
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

  // Render modals based on state
  const renderModals = () => {
    // Upload modal for new file upload
    if (dashboardState.showUploadModal) {
      return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Close button */}
              <button
                onClick={handleCloseUploadModal}
                className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* EmptyState component as modal content */}
              <EmptyState onUpload={handleFileUpload} />
            </div>
          </div>
        </div>
      );
    }

    if (dashboardState.status === 'uploading') {
      return (
        <UploadModal
          progress={dashboardState.uploadProgress || 0}
          fileName="Uploaded file"
          onCancel={handleCancelUpload}
        />
      );
    }
    
    if (dashboardState.status === 'processing') {
      return (
        <ProcessingScreen
          step={dashboardState.processingStep}
          onCancel={handleCancelUpload}
        />
      );
    }
    
    return null;
  };

  return (
    <>
      {/* Render modals */}
      {renderModals()}
      
      <div className="flex h-screen bg-background">
        {/* Table Selection Sidebar */}
        {currentFile && dashboardState.status === 'ready' && (
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
                {/* Upload New File Button (only show when file is loaded) */}
                {currentFile && dashboardState.status === 'ready' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUploadNewFile}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New File</span>
                  </Button>
                )}
                
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

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-hidden">
            {/* Empty State */}
            {dashboardState.status === 'empty' && (
              <EmptyState onUpload={handleFileUpload} />
            )}

            {/* Ready State - Full Dashboard */}
            {dashboardState.status === 'ready' && currentFile && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Left Column - Chat */}
                <div className="flex flex-col">
                  <ChatInterface
                    messages={currentMessages}
                    onSendMessage={handleSendMessage}
                    isTyping={isTyping}
                    suggestions={suggestions}
                  />
                </div>

                {/* Right Column - Output Display */}
                <div className="flex flex-col">
                  <OutputDisplay
                    currentOutput={currentOutput?.sender === 'assistant' ? currentOutput : null}
                    analysisHistory={currentMessages}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
