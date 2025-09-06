import OpenAI from "openai";
import { type TablesData, type ChatMessage } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AnalysisRequest {
  query: string;
  selectedTables: TablesData;
  conversationHistory: ChatMessage[];
}

export interface AnalysisResponse {
  content: string;
  outputType: 'text' | 'chart' | 'table';
  chartData?: any;
  tableData?: any;
}

export async function analyzeDataWithAI(request: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    const contextString = JSON.stringify(request.selectedTables, null, 2);
    
    const systemPrompt = `You are an expert data analyst specializing in Excel data analysis. You help users understand their data through insights, visualizations, and calculations.

Context Data:
${contextString}

Instructions:
1. Analyze the provided data tables to answer user questions
2. Provide clear, actionable insights
3. When appropriate, suggest visualizations (charts) or create summary tables
4. Always base your analysis on the actual data provided
5. Be specific and cite actual numbers from the data
6. Format your response as JSON with the following structure:
{
  "content": "Your analysis text (can include markdown formatting)",
  "outputType": "text|chart|table",
  "chartData": { // Only if outputType is "chart"
    "type": "bar|line|pie|scatter",
    "data": {
      "labels": ["Label1", "Label2"],
      "datasets": [{
        "label": "Dataset Name",
        "data": [1, 2, 3],
        "backgroundColor": ["#color1", "#color2"]
      }]
    },
    "options": {}
  },
  "tableData": { // Only if outputType is "table"
    "headers": ["Column1", "Column2"],
    "rows": [{"Column1": "Value1", "Column2": "Value2"}]
  }
}`;

    const conversationMessages = request.conversationHistory.slice(-5).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant' as const,
      content: msg.content
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationMessages,
        { role: "user", content: request.query }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      content: result.content || "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.",
      outputType: result.outputType || 'text',
      chartData: result.chartData,
      tableData: result.tableData
    };

  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      content: "I'm sorry, but I encountered an error while analyzing your data. Please check your API configuration and try again.",
      outputType: 'text'
    };
  }
}

export async function generateInsightSuggestions(tablesData: TablesData): Promise<string[]> {
  try {
    const contextString = JSON.stringify(tablesData, null, 2);
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{
        role: "user",
        content: `Based on this data, suggest 3-5 interesting questions or analysis ideas that would provide valuable insights. Return as JSON array of strings.

Data:
${contextString}

Format: ["Question 1", "Question 2", "Question 3"]`
      }],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || '[]');
    return Array.isArray(result) ? result : Object.values(result).flat();

  } catch (error) {
    console.error('Suggestions Error:', error);
    return [
      "Compare performance metrics across different lines",
      "Analyze trends in the data over time",
      "Identify patterns or anomalies in the dataset",
      "Calculate key performance indicators",
      "Generate a summary report of the main findings"
    ];
  }
}
