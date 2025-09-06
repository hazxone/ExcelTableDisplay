import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  onUpload: (file: File) => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.name.toLowerCase().endsWith('.xlsx') || 
      file.name.toLowerCase().endsWith('.xls')
    );
    
    if (excelFile) {
      onUpload(excelFile);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  return (
    <div className="flex items-center justify-center min-h-[600px] p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
            </div>
            
            {/* Title and Description */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Upload Your Excel File
              </h2>
              <p className="text-muted-foreground">
                Upload an Excel file to start analyzing your data with AI
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/2'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">
                    Drag and drop your Excel file here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>

                {/* File Requirements */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Supported formats: .xlsx, .xls</p>
                  <p>• Maximum file size: 10MB</p>
                  <p>• Multiple sheets will be detected automatically</p>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />

                {/* Browse Button */}
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full"
                  size="lg"
                >
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-4 h-4 text-accent-foreground" />
                </div>
                <p className="text-sm font-medium">Easy Upload</p>
                <p className="text-xs text-muted-foreground">Drag & drop or click</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="w-4 h-4 text-accent-foreground" />
                </div>
                <p className="text-sm font-medium">Auto Detect</p>
                <p className="text-xs text-muted-foreground">Tables & sheets</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-4 h-4 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">AI Analysis</p>
                <p className="text-xs text-muted-foreground">Chat with your data</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}