import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Loader2, CheckCircle, FileSpreadsheet, Brain, BarChart3, Database } from "lucide-react";

interface ProcessingScreenProps {
  step?: string;
  onCancel?: () => void;
}

const PROCESSING_STEPS = [
  { 
    key: 'validating', 
    text: 'Validating Excel file...', 
    icon: FileSpreadsheet,
    duration: 800,
    color: 'text-blue-500'
  },
  { 
    key: 'reading', 
    text: 'Reading workbook structure...', 
    icon: FileSpreadsheet,
    duration: 1000,
    color: 'text-blue-500'
  },
  { 
    key: 'parsing', 
    text: 'Parsing table data...', 
    icon: Database,
    duration: 1200,
    color: 'text-orange-500'
  },
  { 
    key: 'analyzing', 
    text: 'Analyzing data relationships...', 
    icon: Brain,
    duration: 1000,
    color: 'text-purple-500'
  },
  { 
    key: 'preparing', 
    text: 'Preparing for AI analysis...', 
    icon: BarChart3,
    duration: 800,
    color: 'text-green-500'
  },
  { 
    key: 'complete', 
    text: 'Analysis ready!', 
    icon: CheckCircle,
    duration: 500,
    color: 'text-green-500'
  }
];

export function ProcessingScreen({ step, onCancel }: ProcessingScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = PROCESSING_STEPS.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;
    
    const interval = setInterval(() => {
      elapsed += 100;
      setProgress(Math.min((elapsed / totalDuration) * 100, 100));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentStepIndex >= PROCESSING_STEPS.length) return;

    const currentStep = PROCESSING_STEPS[currentStepIndex];
    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => prev + 1);
    }, currentStep.duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  const currentStep = PROCESSING_STEPS[Math.min(currentStepIndex, PROCESSING_STEPS.length - 1)];
  const IconComponent = currentStep.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Processing Your File</CardTitle>
          {onCancel && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main Progress */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              {currentStepIndex < PROCESSING_STEPS.length - 1 ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {currentStep.text}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStepIndex < PROCESSING_STEPS.length - 1 
                  ? "This may take a few moments..." 
                  : "Your data is ready for analysis!"
                }
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Progress */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Processing Steps:</p>
            <div className="space-y-2">
              {PROCESSING_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div 
                    key={step.key}
                    className={`flex items-center space-x-3 py-1 transition-all duration-300 ${
                      isCurrent ? 'opacity-100' : isCompleted ? 'opacity-75' : 'opacity-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-100' 
                        : isCurrent 
                        ? 'bg-primary/10' 
                        : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <StepIcon className={`w-3 h-3 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <span className={`text-sm ${
                      isCurrent ? 'font-medium text-foreground' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estimated Time */}
          {currentStepIndex < PROCESSING_STEPS.length - 1 && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Estimated time remaining: {Math.ceil((100 - progress) / 10)} seconds
              </p>
            </div>
          )}

          {/* Cancel Button */}
          {onCancel && currentStepIndex < PROCESSING_STEPS.length - 1 && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full"
            >
              Cancel Processing
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}