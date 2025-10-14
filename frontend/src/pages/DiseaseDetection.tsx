import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Scan, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DetectionResult {
  status: 'healthy' | 'diseased';
  disease?: string;
  confidence: number;
  recommendations: string[];
}

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    
    // Mock AI analysis - in production, this would call your AI microservice
    setTimeout(() => {
      const mockResults: DetectionResult[] = [
        {
          status: 'healthy',
          confidence: 95,
          recommendations: ['Continue regular care', 'Monitor for changes', 'Maintain current irrigation schedule'],
        },
        {
          status: 'diseased',
          disease: 'Early Blight',
          confidence: 87,
          recommendations: [
            'Remove affected leaves immediately',
            'Apply fungicide treatment',
            'Improve air circulation around plants',
            'Avoid overhead watering',
          ],
        },
      ];

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setResult(randomResult);
      setIsAnalyzing(false);
      
      toast({
        title: 'Analysis Complete',
        description: `Detected: ${randomResult.status === 'healthy' ? 'Healthy Plant' : randomResult.disease}`,
      });
    }, 2000);
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disease Detection</h1>
          <p className="text-muted-foreground">Upload a photo of your crop for AI-powered disease analysis</p>
        </div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="border-2 border-dashed rounded-lg p-8"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            {!selectedImage ? (
              <>
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium mb-1">Upload Crop Photo</p>
                  <p className="text-sm text-muted-foreground">
                    Take a clear photo of the affected plant or leaf
                  </p>
                </div>
                <label htmlFor="image-upload">
                  <Button asChild>
                    <span>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose Photo
                    </span>
                  </Button>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </>
            ) : (
              <div className="w-full space-y-4">
                <img
                  src={selectedImage}
                  alt="Uploaded crop"
                  className="w-full max-h-96 object-contain rounded-lg border"
                />
                <div className="flex gap-3">
                  <label htmlFor="image-upload-2" className="flex-1">
                    <Button variant="outline" className="w-full" asChild>
                      <span>Change Photo</span>
                    </Button>
                  </label>
                  <input
                    id="image-upload-2"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <Scan className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Scan className="h-4 w-4 mr-2" />
                        Analyze Photo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Results Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 border-2 ${
              result.status === 'healthy'
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30'
                : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30'
            }`}
          >
            <div className="flex items-start gap-4">
              {result.status === 'healthy' ? (
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">
                  {result.status === 'healthy' ? 'Healthy Plant Detected' : `Disease Detected: ${result.disease}`}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Confidence: {result.confidence}%
                </p>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Detections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Recent Detections</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Tomato Plant</p>
                <p className="text-sm text-muted-foreground">Analyzed 2 days ago</p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Lettuce</p>
                <p className="text-sm text-muted-foreground">Analyzed 5 days ago</p>
              </div>
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm">
                Powdery Mildew
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Cucumber</p>
                <p className="text-sm text-muted-foreground">Analyzed 1 week ago</p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                Healthy
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default DiseaseDetection;
