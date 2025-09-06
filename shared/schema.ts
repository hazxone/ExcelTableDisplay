import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const excelFiles = pgTable("excel_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  tables: json("tables").notNull(), // Store parsed table data as JSON
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: varchar("file_id").references(() => excelFiles.id).notNull(),
  messages: json("messages").notNull().default([]), // Store chat history
  selectedTables: json("selected_tables").notNull().default([]), // Store selected table names
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertExcelFileSchema = createInsertSchema(excelFiles).omit({
  id: true,
  uploadedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
});

export const tableDataSchema = z.object({
  title: z.string(),
  headers: z.array(z.string()),
  rows: z.array(z.record(z.any())),
});

export const tablesSchema = z.record(tableDataSchema);

export const chatMessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  sender: z.enum(['user', 'assistant']),
  timestamp: z.string(),
  outputType: z.enum(['text', 'chart', 'table']).optional(),
  chartData: z.any().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertExcelFile = z.infer<typeof insertExcelFileSchema>;
export type ExcelFile = typeof excelFiles.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type TableData = z.infer<typeof tableDataSchema>;
export type TablesData = z.infer<typeof tablesSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
