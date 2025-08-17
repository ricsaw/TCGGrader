import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, RotateCcw, CheckCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface UploadedImage {
  file: File;
  preview: string;
}

interface AppraisalResult {
  cardName: string;
  grades: {
    centering: number;
    edges: number;
    corners: number;
    surface: number;
  };
  edition: string;
  setname: string;
  overallGrade: number;
  estimatedValue: number;
}

const CardAppraisalApp = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [images, setImages] = useState<{
    front?: UploadedImage;
    back?: UploadedImage;
    topLeft?: UploadedImage;
    bottomRight?: UploadedImage;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AppraisalResult | null>(null);

  // Crop state only for first step
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 50, aspect: undefined }); // free aspect ratio
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [pendingStepKey, setPendingStepKey] = useState<string | null>(null);

  const steps = [
    { key: 'front', label: 'Upload Front of Card', description: 'Take a clear photo of the front side' },
    { key: 'back', label: 'Upload Back of Card', description: 'Take a clear photo of the back side' },
    { key: 'topLeft', label: 'Upload Top-Left Corner', description: 'Focus on the top-left corner for detail' },
    { key: 'bottomRight', label: 'Upload Bottom-Right Corner', description: 'Focus on the bottom-right corner for detail' }
  ];

  // Only use cropping for the 'front' step
  const handleFileSelect = (stepKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Always crop for every step, not just front
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setPendingStepKey(stepKey);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoaded = (img: HTMLImageElement) => {
    imageRef.current = img;
  };

  const handleCropDone = useCallback(() => {
    if (!completedCrop || !imageRef.current || !pendingStepKey) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = completedCrop.width!;
    canvas.height = completedCrop.height!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      imageRef.current,
      completedCrop.x! * scaleX,
      completedCrop.y! * scaleY,
      completedCrop.width! * scaleX,
      completedCrop.height! * scaleY,
      0,
      0,
      completedCrop.width!,
      completedCrop.height!
    );

    canvas.toBlob(blob => {
      if (blob) {
        const preview = URL.createObjectURL(blob);
        const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
        setImages(prev => ({
          ...prev,
          [pendingStepKey]: { file, preview }
        }));
        setShowCropper(false);
        setCropImageSrc(null);
        setPendingStepKey(null);
        toast({
          title: "Image cropped",
          description: `${pendingStepKey} image cropped successfully.`,
        });
      }
    }, 'image/jpeg');
  }, [completedCrop, pendingStepKey, toast]);

  const allImagesUploaded = () => {
    return images.front && images.back && images.topLeft && images.bottomRight;
  };

  const handleAppraise = async () => {
    if (!allImagesUploaded()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('front', images.front!.file);
      formData.append('back', images.back!.file);
      formData.append('topLeft', images.topLeft!.file);
      formData.append('bottomRight', images.bottomRight!.file);

      const response = await fetch('http://127.0.0.1:8000/appraise', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Appraisal failed');
      }

      const data: AppraisalResult = await response.json();
      setResult(data);
      
      toast({
        title: "Appraisal complete!",
        description: `Your card has been appraised. Overall grade: ${data.overallGrade}`,
      });
    } catch (error) {
      toast({
        title: "Appraisal failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
      console.error('Appraisal error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    Object.values(images).forEach(image => {
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    
    setImages({});
    setResult(null);
    setIsLoading(false);
    setCurrentStep(0);
    
    toast({
      title: "Form reset",
      description: "You can now start a new appraisal.",
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const currentStepKey = currentStepData.key as keyof typeof images;
  const isCurrentStepComplete = !!images[currentStepKey];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      {/* Cropper Modal (only shows for front image cropping) */}
      {showCropper && cropImageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full">
            <ReactCrop
              crop={crop}
              onChange={newCrop => setCrop(newCrop)}
              onComplete={setCompletedCrop}
              // No aspect prop for free aspect ratio
            >
              <img src={cropImageSrc} onLoad={e => onImageLoaded(e.currentTarget)} alt="To crop" />
            </ReactCrop>

            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={() => setShowCropper(false)} variant="outline">Cancel</Button>
              <Button onClick={handleCropDone}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6 pt-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">Card Appraisal Tool</h1>
        <p className="text-muted-foreground">Upload photos of your trading card for professional appraisal</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ 
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: 'var(--gradient-primary)'
            }}
          />
        </div>
      </div>

      {/* Current Step */}
      <Card className="p-6 mb-6" style={{ boxShadow: 'var(--shadow-elevated)' }}>
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4
            ${isCurrentStepComplete ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'}`}>
            {isCurrentStepComplete ? <CheckCircle className="w-6 h-6" /> : (currentStep + 1)}
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-2">{currentStepData.label}</h2>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </div>

        {/* Upload Button */}
        <div className="mb-6">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              capture="environment"
              onChange={(e) => handleFileSelect(currentStepData.key, e)}
            />
            <Button 
              variant={isCurrentStepComplete ? "secondary" : "default"}
              className="w-full h-14 text-lg gap-3"
              asChild
            >
              <span>
                {isCurrentStepComplete ? <Upload className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                {isCurrentStepComplete ? 'Change Photo' : 'Take Photo'}
              </span>
            </Button>
          </label>
        </div>
        
        {/* Image Preview */}
        {isCurrentStepComplete && (
          <div className="mb-6">
            <img
              src={images[currentStepKey]?.preview}
              alt={`${currentStepData.label} preview`}
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="flex-1 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isCurrentStepComplete || isLastStep}
            className="flex-1 gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* All Steps Overview (Compact) */}
      <div className="mb-6">
        <div className="flex gap-2">
          {steps.map((step, index) => {
            const isCompleted = !!images[step.key as keyof typeof images];
            const isCurrent = index === currentStep;
            
            return (
              <div
                key={step.key}
                className={`flex-1 h-2 rounded-full transition-all duration-200
                  ${isCompleted ? 'bg-success' : isCurrent ? 'bg-primary' : 'bg-muted'}`}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Front</span>
          <span>Back</span>
          <span>Top-Left</span>
          <span>Bottom-Right</span>
        </div>
      </div>

      {/* Appraise Button */}
      {allImagesUploaded() && (
        <div className="mb-6">
          <Button
            onClick={handleAppraise}
            disabled={isLoading}
            className="w-full h-14 text-lg font-semibold"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Appraise Card'
            )}
          </Button>
        </div>
      )}

      {/* Results Panel */}
      {result && (
        <Card className="p-6 mb-6" style={{ boxShadow: 'var(--shadow-elevated)' }}>
          <h2 className="text-xl font-bold text-foreground mb-4">Appraisal Results</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Card Name</label>
              <p className="text-lg font-semibold text-foreground">{result.cardName}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Centering</label>
                <p className="text-lg font-semibold text-foreground">{result.grades.centering}/10</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Edges</label>
                <p className="text-lg font-semibold text-foreground">{result.grades.edges}/10</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Corners</label>
                <p className="text-lg font-semibold text-foreground">{result.grades.corners}/10</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Surface</label>
                <p className="text-lg font-semibold text-foreground">{result.grades.surface}/10</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-muted-foreground">Edition</label>
                <span className="text-2xl font-bold text-primary">{result.edition}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-muted-foreground">Set Name</label>
                <span className="text-2xl font-bold text-primary">{result.setname}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-muted-foreground">Overall Grade</label>
                <span className="text-2xl font-bold text-primary">{result.overallGrade}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-muted-foreground">Estimated Value</label>
                <span className="text-2xl font-bold text-accent">${result.estimatedValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Reset Button */}
      {(allImagesUploaded() || result) && (
        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Start New Appraisal
        </Button>
      )}
    </div>
  );
};

export default CardAppraisalApp;
