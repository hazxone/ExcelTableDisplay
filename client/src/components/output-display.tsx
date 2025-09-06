import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share, Brain, TrendingUp, BarChart } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { type ChatMessage } from "@shared/schema";
import ReactMarkdown from "react-markdown";

interface OutputDisplayProps {
  currentOutput: ChatMessage | null;
  analysisHistory: ChatMessage[];
}

export function OutputDisplay({ currentOutput, analysisHistory }: OutputDisplayProps) {
  const [selectedTab, setSelectedTab] = useState<'current' | 'history'>('current');

  const renderChart = (chartData: any) => {
    if (!chartData || !chartData.data) return null;

    const { type, data, options = {} } = chartData;
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={data.datasets?.[0]?.data?.map((value: any, index: number) => ({
              name: data.labels?.[index] || `Item ${index + 1}`,
              value: value
            })) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={colors[0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.datasets?.[0]?.data?.map((value: any, index: number) => ({
              name: data.labels?.[index] || `Item ${index + 1}`,
              value: value
            })) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.datasets?.[0]?.data?.map((value: any, index: number) => ({
                  name: data.labels?.[index] || `Item ${index + 1}`,
                  value: value
                })) || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.datasets?.[0]?.data?.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const renderTable = (tableData: any) => {
    if (!tableData || !tableData.headers || !tableData.rows) return null;

    return (
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {tableData.headers.map((header: string, index: number) => (
                <th key={index} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {tableData.rows.map((row: any, rowIndex: number) => (
              <tr key={rowIndex}>
                {tableData.headers.map((header: string, colIndex: number) => (
                  <td key={colIndex} className="px-4 py-3 text-sm text-foreground">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const exportCurrentOutput = () => {
    if (!currentOutput) return;

    const exportData = {
      timestamp: currentOutput.timestamp,
      content: currentOutput.content,
      outputType: currentOutput.outputType,
      chartData: currentOutput.chartData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareCurrentOutput = async () => {
    if (!currentOutput) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Excel Data Analysis',
          text: currentOutput.content,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(currentOutput.content);
      // You could show a toast here
    }
  };

  const assistantMessages = analysisHistory.filter(msg => msg.sender === 'assistant');

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Analysis Output</h3>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportCurrentOutput}
              disabled={!currentOutput}
              data-testid="button-export"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={shareCurrentOutput}
              disabled={!currentOutput}
              data-testid="button-share"
            >
              <Share className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          <Button
            variant={selectedTab === 'current' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('current')}
            data-testid="tab-current"
          >
            Current Analysis
          </Button>
          <Button
            variant={selectedTab === 'history' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('history')}
            data-testid="tab-history"
          >
            History ({assistantMessages.length})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto scrollbar-thin p-0">
        {selectedTab === 'current' ? (
          <div className="p-6">
            {currentOutput ? (
              <div className="space-y-6">
                {/* Output Type Badge */}
                <div className="flex items-center space-x-2">
                  {currentOutput.outputType === 'chart' && <BarChart className="w-4 h-4" />}
                  {currentOutput.outputType === 'table' && <TrendingUp className="w-4 h-4" />}
                  {currentOutput.outputType === 'text' && <Brain className="w-4 h-4" />}
                  <Badge variant="outline">
                    {currentOutput.outputType === 'chart' && 'Data Visualization'}
                    {currentOutput.outputType === 'table' && 'Data Table'}
                    {currentOutput.outputType === 'text' && 'AI Analysis'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(currentOutput.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Chart Display */}
                {currentOutput.outputType === 'chart' && currentOutput.chartData && (
                  <div className="bg-background border border-border rounded-lg p-4">
                    {renderChart(currentOutput.chartData)}
                  </div>
                )}

                {/* Table Display */}
                {currentOutput.outputType === 'table' && currentOutput.chartData && (
                  renderTable(currentOutput.chartData)
                )}

                {/* Text Analysis */}
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{currentOutput.content}</ReactMarkdown>
                </div>

                {/* AI Analysis Footer */}
                {currentOutput.outputType !== 'text' && (
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-2 flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-primary" />
                      AI Analysis
                    </h5>
                    <div className="text-sm text-foreground">
                      <ReactMarkdown>{currentOutput.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">No Analysis Yet</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Start a conversation with the AI assistant to see analysis results here
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Upload an Excel file and select tables</p>
                  <p>• Ask questions about your data</p>
                  <p>• View charts, tables, and insights here</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <h4 className="text-base font-medium text-foreground mb-4">Analysis History</h4>
            {assistantMessages.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No analysis history yet</p>
              </div>
            ) : (
              assistantMessages.map((message) => (
                <Card 
                  key={message.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedTab('current')}
                  data-testid={`history-item-${message.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">
                        {message.outputType === 'chart' && 'Chart'}
                        {message.outputType === 'table' && 'Table'}
                        {message.outputType === 'text' && 'Analysis'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-3">
                      {message.content.slice(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
