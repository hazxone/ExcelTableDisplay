import { type User, type InsertUser, type ExcelFile, type InsertExcelFile, type ChatSession, type InsertChatSession, type TablesData, type ChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createExcelFile(file: InsertExcelFile): Promise<ExcelFile>;
  getExcelFile(id: string): Promise<ExcelFile | undefined>;
  getExcelFiles(): Promise<ExcelFile[]>;
  
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  getChatSessionsByFileId(fileId: string): Promise<ChatSession[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private excelFiles: Map<string, ExcelFile>;
  private chatSessions: Map<string, ChatSession>;

  constructor() {
    this.users = new Map();
    this.excelFiles = new Map();
    this.chatSessions = new Map();
    
    // Initialize with mock data
    this.initializeMockData();
  }

  private async initializeMockData() {
    // Mock excel file with transit data
    const mockFile: ExcelFile = {
      id: "mock-file-1",
      filename: "transit_data.xlsx",
      originalName: "transit_data.xlsx",
      uploadedAt: new Date(),
      tables: {
        "redLinePerformanceSummary": {
          "title": "Red Line Performance Summary",
          "headers": ["Metric", "Value"],
          "rows": [
            { "Metric": "TSA", "Value": "✔️ 100.000%" },
            { "Metric": "TSP", "Value": "✔️ 100.000%" },
            { "Metric": "Trips not punctual", "Value": 0 },
            { "Metric": "Cancelled", "Value": 0 }
          ]
        },
        "greenLinePerformanceSummary": {
          "title": "Green Line Performance Summary",
          "headers": ["Metric", "Value"],
          "rows": [
            { "Metric": "TSA", "Value": "✔️ 100.000%" },
            { "Metric": "TSP", "Value": "✔️ 99.478%" },
            { "Metric": "Trips not punctual", "Value": 2 },
            { "Metric": "Cancelled", "Value": 0 }
          ]
        },
        "blueLineIncidents": {
          "title": "Blue Line Incidents",
          "headers": ["Time", "Type", "Duration", "Impact"],
          "rows": [
            { "Time": "08:15", "Type": "Signal Issue", "Duration": "15 min", "Impact": "Minor delay" },
            { "Time": "14:30", "Type": "Maintenance", "Duration": "45 min", "Impact": "Service suspension" },
            { "Time": "18:45", "Type": "Equipment failure", "Duration": "20 min", "Impact": "Reduced capacity" }
          ]
        },
        "monthlyRidership": {
          "title": "Monthly Ridership Data",
          "headers": ["Month", "Passengers", "Revenue", "Growth"],
          "rows": [
            { "Month": "Jan 2024", "Passengers": 2450000, "Revenue": "$4,900,000", "Growth": "5.2%" },
            { "Month": "Feb 2024", "Passengers": 2380000, "Revenue": "$4,760,000", "Growth": "3.8%" },
            { "Month": "Mar 2024", "Passengers": 2620000, "Revenue": "$5,240,000", "Growth": "7.1%" }
          ]
        },
        "stationCapacityAnalysis": {
          "title": "Station Capacity Analysis",
          "headers": ["Station", "Capacity", "Current Usage", "Utilization"],
          "rows": [
            { "Station": "Central Station", "Capacity": 50000, "Current Usage": 42000, "Utilization": "84%" },
            { "Station": "North Terminal", "Capacity": 35000, "Current Usage": 28000, "Utilization": "80%" },
            { "Station": "South Hub", "Capacity": 40000, "Current Usage": 35000, "Utilization": "87.5%" }
          ]
        }
      }
    };
    
    this.excelFiles.set(mockFile.id, mockFile);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createExcelFile(insertFile: InsertExcelFile): Promise<ExcelFile> {
    const id = randomUUID();
    const file: ExcelFile = { 
      ...insertFile, 
      id, 
      uploadedAt: new Date() 
    };
    this.excelFiles.set(id, file);
    return file;
  }

  async getExcelFile(id: string): Promise<ExcelFile | undefined> {
    return this.excelFiles.get(id);
  }

  async getExcelFiles(): Promise<ExcelFile[]> {
    return Array.from(this.excelFiles.values());
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = { 
      ...insertSession, 
      id, 
      createdAt: new Date() 
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getChatSessionsByFileId(fileId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(
      (session) => session.fileId === fileId
    );
  }
}

export const storage = new MemStorage();
