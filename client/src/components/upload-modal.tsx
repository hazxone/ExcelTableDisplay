import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Upload, FileText, CheckCircle } from "lucide-react";

interface UploadModalProps {
  progress: number;
  fileName?: string;
  onCancel: () => void;
}

export function UploadModal({ progress, fileName, onCancel }: UploadModalProps) {
  const getUploadStage = () => {
    if (progress === 0) return { icon: Upload, text: "Preparing upload...", color: "text-muted-foreground" };
    if (progress < 30) return { icon: Upload, text: "Uploading file...", color: "text-blue-500" };
    if (progress < 70) return { icon: FileText, text: "Processing file...", color: "text-orange-500" };
    if (progress < 100) return { icon: FileText, text: "Finalizing upload...", color: "text-green-500" };
    return { icon: CheckCircle, text: "Upload complete!", color: "text-green-500" };
  };

  const stage = getUploadStage();
  const IconComponent = stage.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Uploading File</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* File Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {fileName || "Excel file"}
              </p>
              <p className="text-xs text-muted-foreground">
                {progress < 100 ? "Uploading..." : "Ready"}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3 py-2">
            <IconComponent className={`w-5 h-5 ${stage.color}`} />
            <span className="text-sm font-medium">{stage.text}</span>
          </div>

          {/* Upload Details */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>File type:</span>
              <span>Excel (.xlsx/.xls)</span>
            </div>
            <div className="flex justify-between">
              <span>Processing:</span>
              <span>Auto-detecting tables</span>
            </div>
          </div>

          {/* Cancel Button */}
          {progress < 100 && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full"
            >
              Cancel Upload
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}