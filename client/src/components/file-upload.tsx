import { useState, useRef, useCallback } from "react";
import { Upload, File, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onFileUploaded: (file: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export function FileUpload({ onFileUploaded, isProcessing, setIsProcessing }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiRequest('POST', '/api/files/upload', formData);
      const uploadedFile = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onFileUploaded(uploadedFile);
        setIsProcessing(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }, [onFileUploaded, setIsProcessing]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Upload Excel File</h3>
        
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          data-testid="file-upload-dropzone"
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <File className="text-primary text-xl" />
            </div>
            <div>
              <p className="text-foreground font-medium">Drop your Excel file here</p>
              <p className="text-muted-foreground text-sm mt-1">or click to browse files</p>
            </div>
            <p className="text-xs text-muted-foreground">Supports .xlsx, .xls files up to 10MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileInputChange}
            data-testid="file-input"
          />
        </div>

        {isProcessing && (
          <div className="mt-4">
            <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-md">
              <div className="animate-spin">
                <Upload className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Processing Excel file...</p>
                <p className="text-xs text-muted-foreground">Extracting tables and data</p>
                <Progress value={uploadProgress} className="mt-2" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
