import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeDataWithAI, generateInsightSuggestions } from "./services/openai";
import { insertExcelFileSchema, insertChatSessionSchema, chatMessageSchema, tablesSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all excel files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getExcelFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Get specific excel file with tables
  app.get("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getExcelFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  // Upload and process excel file
  app.post("/api/files/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Mock Excel processing - in real implementation, use libraries like xlsx
      const mockTables = {
        "uploadedTable1": {
          "title": `Data from ${req.file.originalname}`,
          "headers": ["Column1", "Column2", "Column3"],
          "rows": [
            { "Column1": "Sample", "Column2": "Data", "Column3": "123" },
            { "Column1": "More", "Column2": "Information", "Column3": "456" }
          ]
        }
      };

      const fileData = {
        filename: req.file.filename || `uploaded_${Date.now()}.xlsx`,
        originalName: req.file.originalname,
        tables: mockTables
      };

      const validatedData = insertExcelFileSchema.parse(fileData);
      const createdFile = await storage.createExcelFile(validatedData);
      
      res.json(createdFile);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to process file" });
    }
  });

  // Create new chat session
  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  // Get chat session
  app.get("/api/chat/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Send message and get AI response
  app.post("/api/chat/sessions/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { message, selectedTables } = req.body;

      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const file = await storage.getExcelFile(session.fileId);
      if (!file) {
        return res.status(404).json({ message: "Associated file not found" });
      }

      // Validate message
      const userMessage = chatMessageSchema.parse({
        id: `msg_${Date.now()}_user`,
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      });

      // Filter selected tables
      const validatedSelectedTables = tablesSchema.parse(selectedTables || {});
      const filteredTables: any = {};
      Object.keys(validatedSelectedTables).forEach(tableKey => {
        if (file.tables && (file.tables as any)[tableKey]) {
          filteredTables[tableKey] = (file.tables as any)[tableKey];
        }
      });

      // Get AI response
      const aiResponse = await analyzeDataWithAI({
        query: message,
        selectedTables: filteredTables,
        conversationHistory: (session.messages as any[]) || []
      });

      const assistantMessage = chatMessageSchema.parse({
        id: `msg_${Date.now()}_assistant`,
        content: aiResponse.content,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        outputType: aiResponse.outputType,
        chartData: aiResponse.chartData
      });

      // Update session with new messages
      const updatedMessages = [
        ...((session.messages as any[]) || []),
        userMessage,
        assistantMessage
      ];

      await storage.updateChatSession(sessionId, {
        messages: updatedMessages,
        selectedTables: Object.keys(filteredTables)
      });

      res.json({
        userMessage,
        assistantMessage
      });

    } catch (error) {
      console.error('Message error:', error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Get suggested questions for tables
  app.post("/api/insights/suggestions", async (req, res) => {
    try {
      const { tables } = req.body;
      const validatedTables = tablesSchema.parse(tables);
      
      const suggestions = await generateInsightSuggestions(validatedTables);
      res.json({ suggestions });
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({ 
        suggestions: [
          "Compare performance metrics across different categories",
          "Analyze trends and patterns in the data",
          "Identify key insights and anomalies",
          "Generate summary statistics",
          "Create visualizations for better understanding"
        ]
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
