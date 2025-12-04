import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  History,
  Image as ImageIcon,
  Scan,
  Upload,
} from "lucide-react";
import { marked } from "marked";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface DetectionResult {
  id: number;
  status: "healthy" | "diseased";
  disease: string | null;
  confidence: number;
  recommendations: string[];
  image_url: string;
  created_at?: string;
}

const DiseaseDetection = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const { toast } = useToast();

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get("/predict/history/");
      if (Array.isArray(response.data)) {
        setHistory(response.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(uploadedFile);

    setFile(uploadedFile);
  };

  const analyzeImage = async () => {
    if (!file) return;

    try {
      setIsAnalyzing(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/predict/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data as DetectionResult;
      setResult(data);

      toast({
        title: "Analysis Complete",
        description:
          data.status === "healthy"
            ? "Healthy Plant Detected"
            : `Disease: ${data.disease}`,
      });

      fetchHistory();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to analyze the image.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disease Detection</h1>
          <p className="text-muted-foreground">
            Upload a crop image and get instant plant disease identification.
          </p>
        </div>

        {/* UPLOAD SECTION */}
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
                <p className="text-lg font-medium">Upload Crop Photo</p>
                <p className="text-sm text-muted-foreground">
                  Clear close-up of leaf or affected area
                </p>

                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button asChild>
                    <span>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose Photo
                    </span>
                  </Button>
                </label>
              </>
            ) : (
              <div className="w-full space-y-4">
                <img
                  src={selectedImage}
                  alt="Uploaded crop"
                  className="w-full max-h-96 object-contain rounded-lg border"
                />

                <div className="flex gap-3">
                  {/* CHANGE PHOTO BUTTON */}
                  <input
                    id="image-upload-2"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button asChild variant="outline" className="flex-1">
                    <label htmlFor="image-upload-2" className="w-full cursor-pointer">
                      Change Photo
                    </label>
                  </Button>

                  <Button
                    className="flex-1"
                    disabled={isAnalyzing}
                    onClick={analyzeImage}
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

        {/* RESULT */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 border-2 ${
              result.status === "healthy"
                ? "bg-green-50 border-green-200"
                : "bg-orange-50 border-orange-200"
            }`}
          >
            <div className="flex gap-4 items-start">
              {result.status === "healthy" ? (
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-orange-100 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {result.status === "healthy"
                    ? "Healthy Plant"
                    : `Disease: ${result.disease}`}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Confidence: {result.confidence.toFixed(1)}%
                </p>

                <h4 className="font-semibold mt-3 mb-1">Recommendations:</h4>
                <ul className="space-y-2">
                  {result.recommendations.length > 0 ? (
                    result.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="text-sm flex gap-2"
                        dangerouslySetInnerHTML={{ __html: marked(rec) }}
                      />
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">
                      No recommendations available.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* HISTORY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <History className="h-5 w-5" /> Diagnosis History
          </h2>

          {loadingHistory ? (
            <p className="text-muted-foreground mt-3">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground mt-3">
              No previous analyses found.
            </p>
          ) : (
            <div className="space-y-3 mt-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between py-3 border-b ${
                    item.status === "diseased" ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    if (item.status === "diseased") {
                      navigate(`/history/${item.id}`);
                    }
                  }}
                >
                  <div>
                    <p className="font-medium">{item.disease ?? "Healthy Plant"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.created_at ?? "").toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.status === "healthy"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.status === "healthy" ? "Healthy" : item.disease || "Disease"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default DiseaseDetection;
