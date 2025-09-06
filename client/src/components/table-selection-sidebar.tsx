import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronDown, ChevronRight, Eye, Table } from "lucide-react";
import { type TablesData, type TableData } from "@shared/schema";

interface TableSelectionSidebarProps {
  tables: TablesData;
  selectedTables: string[];
  onTableToggle: (tableKey: string, selected: boolean) => void;
  onGenerateContext: () => void;
}

export function TableSelectionSidebar({ 
  tables, 
  selectedTables, 
  onTableToggle, 
  onGenerateContext 
}: TableSelectionSidebarProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const tableEntries = Object.entries(tables);

  const getTablePreview = (rows: any[]) => {
    if (!rows || rows.length === 0) return [];
    
    // Get unique values from first few rows for preview
    const values = new Set<string>();
    rows.slice(0, 3).forEach(row => {
      Object.values(row).forEach(value => {
        if (typeof value === 'string' && value.length < 20) {
          values.add(value);
        } else if (typeof value === 'number') {
          values.add(value.toString());
        }
      });
    });
    
    return Array.from(values).slice(0, 3);
  };

  const getStatusColor = (preview: string[]) => {
    // Simple logic to determine status based on preview content
    if (preview.some(p => p.includes('✔️') || p.includes('100'))) {
      return 'bg-accent/10 text-accent-foreground';
    }
    if (preview.some(p => p.includes('delay') || p.includes('issue') || p.includes('incident'))) {
      return 'bg-destructive/10 text-destructive-foreground';
    }
    return 'bg-muted text-muted-foreground';
  };

  const toggleTableExpansion = (tableKey: string) => {
    setExpandedTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tableKey)) {
        newSet.delete(tableKey);
      } else {
        newSet.add(tableKey);
      }
      return newSet;
    });
  };

  const clearAllSelections = () => {
    selectedTables.forEach(tableKey => {
      onTableToggle(tableKey, false);
    });
  };

  const TablePreview = ({ tableData, isCompact = true }: { tableData: TableData; isCompact?: boolean }) => {
    const displayRows = isCompact ? tableData.rows.slice(0, 3) : tableData.rows;
    const displayHeaders = tableData.headers.slice(0, isCompact ? 4 : tableData.headers.length);
    
    return (
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              {displayHeaders.map((header, index) => (
                <th key={index} className="px-2 py-1 text-left font-medium text-muted-foreground truncate">
                  {header}
                </th>
              ))}
              {isCompact && tableData.headers.length > 4 && (
                <th className="px-2 py-1 text-left font-medium text-muted-foreground">...</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-muted/30">
                {displayHeaders.map((header, colIndex) => (
                  <td key={colIndex} className="px-2 py-1 text-foreground truncate max-w-[80px]">
                    {String(row[header] || '')}
                  </td>
                ))}
                {isCompact && tableData.headers.length > 4 && (
                  <td className="px-2 py-1 text-muted-foreground">...</td>
                )}
              </tr>
            ))}
            {isCompact && tableData.rows.length > 3 && (
              <tr>
                <td colSpan={displayHeaders.length + (tableData.headers.length > 4 ? 1 : 0)} className="px-2 py-1 text-center text-muted-foreground text-xs">
                  ... {tableData.rows.length - 3} more rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground mb-1">Available Tables</h2>
        <p className="text-sm text-muted-foreground">Select tables to include in your analysis</p>
      </div>

      {/* Table List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {tableEntries.map(([tableKey, tableData]) => {
          const isSelected = selectedTables.includes(tableKey);
          const isExpanded = expandedTables.has(tableKey);
          const preview = getTablePreview(tableData.rows);
          const statusColor = getStatusColor(preview);

          return (
            <Card key={tableKey} className={`hover:border-primary/50 transition-colors ${isSelected ? 'border-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={tableKey}
                    checked={isSelected}
                    onCheckedChange={(checked) => onTableToggle(tableKey, Boolean(checked))}
                    className="mt-1"
                    data-testid={`checkbox-${tableKey}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <label 
                        htmlFor={tableKey} 
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        {tableData.title}
                      </label>
                      <div className="flex items-center space-x-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              data-testid={`button-view-full-${tableKey}`}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <Table className="h-5 w-5" />
                                <span>{tableData.title}</span>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <div className="mb-4 text-sm text-muted-foreground">
                                {tableData.rows.length} rows • {tableData.headers.length} columns
                              </div>
                              <TablePreview tableData={tableData} isCompact={false} />
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTableExpansion(tableKey)}
                          className="h-6 w-6 p-0"
                          data-testid={`button-expand-${tableKey}`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tableData.rows.length} rows • {tableData.headers.join(', ')}
                    </p>
                    {preview.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {preview.map((item, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className={`text-xs ${statusColor}`}
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Expanded Table Preview */}
                    {isExpanded && (
                      <div className="mt-3">
                        <TablePreview tableData={tableData} isCompact={true} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span data-testid="selection-count">
            {selectedTables.length} of {tableEntries.length} selected
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllSelections}
            className="text-primary hover:text-primary/80 font-medium p-0 h-auto"
            data-testid="button-clear-all"
          >
            Clear all
          </Button>
        </div>
        <Button 
          className="w-full" 
          onClick={onGenerateContext}
          disabled={selectedTables.length === 0}
          data-testid="button-generate-context"
        >
          Generate Context <span className="text-xs ml-1">({selectedTables.length} tables)</span>
        </Button>
      </div>
    </div>
  );
}
