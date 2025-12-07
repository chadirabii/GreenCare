import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { marked } from "marked";

interface DetectionResult {
  id: number;
  status: "healthy" | "diseased";
  disease: string | null;
  confidence: number;
  recommendations: string[];
  image_url: string;
  created_at?: string;
}

const HistoryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/predict/${id}/history_detail/`);
        setResult(response.data);
      } catch (err) {
        console.error("Failed to fetch history detail:", err);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <p className="text-muted-foreground mt-4 text-center">Loading...</p>
      </AppLayout>
    );
  }

  if (!result) {
    return (
      <AppLayout>
        <p className="text-muted-foreground mt-4 text-center">
          History entry not found.
        </p>
        <div className="text-center mt-4">
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </AppLayout>
    );
  }

  if (result.status === "healthy") {
    return (
      <AppLayout>
        <p className="text-muted-foreground mt-4 text-center">
          No detailed history for healthy plants.
        </p>
        <div className="text-center mt-4">
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Disease Details</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>

        <div className="rounded-lg p-6 border-2 bg-orange-50 border-orange-200">
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold">Disease: {result.disease}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Confidence: {result.confidence.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Detected at: {new Date(result.created_at ?? "").toLocaleString()}
              </p>

              {result.image_url && (
                <img
                  src={result.image_url}
                  alt="Detected crop"
                  className="w-full max-h-96 object-contain rounded-lg border my-4"
                />
              )}

              <h4 className="font-semibold mt-3 mb-1">Recommendations:</h4>
              <ul className="space-y-2">
                {result.recommendations.length > 0 ? (
                  result.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
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
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default HistoryDetails;
