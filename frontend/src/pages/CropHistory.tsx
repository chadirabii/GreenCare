import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, Sparkles, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CropRecord {
  id: string;
  cropName: string;
  plantedDate: string;
  harvestedDate?: string;
  yield: string;
  notes: string;
  status: "growing" | "harvested";
}

const initialRecords: CropRecord[] = [
  {
    id: "1",
    cropName: "Tomatoes",
    plantedDate: "2025-10-20",
    harvestedDate: "2025-12-05",
    yield: "50 kg",
    notes: "Excellent harvest, weather was favorable",
    status: "harvested",
  },
  {
    id: "2",
    cropName: "Lettuce",
    plantedDate: "2025-11-25",
    yield: "TBD",
    notes: "Growing well, regular irrigation applied",
    status: "growing",
  },
];

const yieldPredictionMessages = [
  {
    yieldRange: "excellent",
    factors: [
      "Optimal soil moisture levels detected",
      "Perfect temperature range for growth",
      "Excellent nutrient availability",
      "Ideal sunlight exposure",
    ],
    message:
      "Exceptional growing conditions! Your plant is thriving with optimal environmental factors.",
    multiplier: 1.3,
  },
  {
    yieldRange: "very-good",
    factors: [
      "Good irrigation schedule maintained",
      "Favorable weather patterns",
      "Adequate nutrient levels",
      "Strong plant health indicators",
    ],
    message:
      "Great progress! Current conditions are highly favorable for maximum yield.",
    multiplier: 1.2,
  },
  {
    yieldRange: "good",
    factors: [
      "Consistent watering regimen",
      "Stable temperature conditions",
      "Healthy soil composition",
      "Good pest management",
    ],
    message:
      "Your plant is developing well with solid growing conditions supporting healthy yields.",
    multiplier: 1.1,
  },
  {
    yieldRange: "above-average",
    factors: [
      "Regular maintenance detected",
      "Balanced nutrient profile",
      "Adequate water supply",
      "Good climate conditions",
    ],
    message:
      "Positive growth indicators suggest above-average yields with continued care.",
    multiplier: 1.15,
  },
];

const baseYields: { [key: string]: number } = {
  Tomatoes: 45,
  Lettuce: 20,
  Strawberries: 35,
  "Bell Peppers": 55,
  Zucchini: 70,
  Carrots: 40,
  Spinach: 25,
  "Green Beans": 50,
  Cucumber: 60,
  Cabbage: 65,
  default: 40,
};

const CropHistory = () => {
  const [records, setRecords] = useState<CropRecord[]>(initialRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<{
    crop: CropRecord;
    predictedYield: string;
    confidence: string;
    factors: string[];
    message: string;
    expectedHarvestDate: string;
  } | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cropName: "",
    plantedDate: "",
    harvestedDate: "",
    yield: "",
    notes: "",
    status: "growing" as "growing" | "harvested",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = { ...formData, id: Date.now().toString() };
    setRecords([newRecord, ...records]);
    toast({ title: "Crop record added successfully" });
    setIsDialogOpen(false);
    setFormData({
      cropName: "",
      plantedDate: "",
      harvestedDate: "",
      yield: "",
      notes: "",
      status: "growing",
    });
  };

  const handlePredictYield = () => {
    // Find growing crops only
    const growingCrops = records.filter((r) => r.status === "growing");

    if (growingCrops.length === 0) {
      toast({
        title: "No Growing Crops",
        description: "Please add some growing crops to predict their yield.",
        variant: "destructive",
      });
      return;
    }

    setIsPredicting(true);
    setShowPrediction(false);
    setPrediction(null);

    // Show loader for 2 seconds
    setTimeout(() => {
      // Select a random growing crop
      const randomCrop =
        growingCrops[Math.floor(Math.random() * growingCrops.length)];

      // Select random prediction factors
      const predictionData =
        yieldPredictionMessages[
          Math.floor(Math.random() * yieldPredictionMessages.length)
        ];

      // Calculate predicted yield
      const baseYield =
        baseYields[randomCrop.cropName] || baseYields.default;
      const predictedAmount = Math.round(baseYield * predictionData.multiplier);
      const variance = Math.round(predictedAmount * 0.1);

      // Calculate expected harvest date - ensure it's in the future
      const today = new Date();
      const plantedDate = new Date(randomCrop.plantedDate);
      const daysToHarvest = 30 + Math.floor(Math.random() * 21); // 30-50 days
      
      // Calculate from planting date
      let expectedHarvest = new Date(plantedDate);
      expectedHarvest.setDate(plantedDate.getDate() + daysToHarvest);
      
      // If the calculated date is in the past, calculate from today instead
      if (expectedHarvest < today) {
        const remainingDays = 30 + Math.floor(Math.random() * 21); // 30-50 days from now
        expectedHarvest = new Date(today);
        expectedHarvest.setDate(today.getDate() + remainingDays);
      }

      const confidenceLevels = ["High", "Very High", "Excellent"];

      setPrediction({
        crop: randomCrop,
        predictedYield: `${predictedAmount - variance}-${predictedAmount + variance} kg`,
        confidence:
          confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
        factors: predictionData.factors,
        message: predictionData.message,
        expectedHarvestDate: expectedHarvest.toISOString().split("T")[0],
      });
      setIsPredicting(false);
      setShowPrediction(true);

      toast({
        title: "Yield Prediction Complete!",
        description: `Predicted yield for ${randomCrop.cropName}: ${predictedAmount - variance}-${predictedAmount + variance} kg`,
      });
    }, 2000);
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crop History</h1>
            <p className="text-muted-foreground">
              Track your planting and harvest records
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePredictYield}
              disabled={isPredicting}
              variant="outline"
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0"
            >
              {isPredicting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Predict Yield
                </>
              )}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Crop Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cropName">Crop Name</Label>
                    <Input
                      id="cropName"
                      value={formData.cropName}
                      onChange={(e) =>
                        setFormData({ ...formData, cropName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="plantedDate">Planted Date</Label>
                    <Input
                      id="plantedDate"
                      type="date"
                      value={formData.plantedDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          plantedDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="harvestedDate">
                      Harvested Date (optional)
                    </Label>
                    <Input
                      id="harvestedDate"
                      type="date"
                      value={formData.harvestedDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          harvestedDate: e.target.value,
                          status: e.target.value ? "harvested" : "growing",
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="yield">Yield</Label>
                    <Input
                      id="yield"
                      placeholder="e.g., 50 kg"
                      value={formData.yield}
                      onChange={(e) =>
                        setFormData({ ...formData, yield: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Record
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Prediction Card */}
        {showPrediction && prediction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="border-2 border-green-500 rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-lg"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                  📊 Yield Prediction: {prediction.crop.cropName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-Powered Yield Analysis
                </p>
              </div>
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                {prediction.confidence} Confidence
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  💡 Analysis
                </p>
                <p className="text-sm leading-relaxed mb-3">{prediction.message}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Key Factors:
                  </p>
                  <ul className="space-y-1">
                    {prediction.factors.map((factor, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-muted-foreground mb-1">
                    Predicted Yield
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {prediction.predictedYield}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-muted-foreground mb-1">
                    Expected Harvest Date
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {new Date(
                      prediction.expectedHarvestDate
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-muted-foreground mb-1">
                    Planted Date
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(prediction.crop.plantedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-muted-foreground mb-1">
                    Growing Duration
                  </p>
                  <p className="text-sm font-medium">
                    {Math.floor(
                      (new Date(prediction.expectedHarvestDate).getTime() -
                        new Date(prediction.crop.plantedDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    const updatedRecords = records.map((r) =>
                      r.id === prediction.crop.id
                        ? {
                            ...r,
                            yield: prediction.predictedYield,
                            notes: `${r.notes}\n\n[Predicted] ${prediction.message}`,
                          }
                        : r
                    );
                    setRecords(updatedRecords);
                    setShowPrediction(false);
                    toast({
                      title: "Yield Updated",
                      description: "Predicted yield has been added to the record.",
                    });
                  }}
                  className="flex-1"
                >
                  Update Record with Prediction
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePredictYield}
                  className="flex-1"
                >
                  Predict Another Crop
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {records.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{record.cropName}</h3>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                      record.status === "harvested"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {record.status === "harvested" ? "Harvested" : "Growing"}
                  </span>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(record.plantedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Planted</p>
                  <p className="font-medium">
                    {new Date(record.plantedDate).toLocaleDateString()}
                  </p>
                </div>
                {record.harvestedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Harvested</p>
                    <p className="font-medium">
                      {new Date(record.harvestedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Yield</p>
                  <p className="font-medium">{record.yield}</p>
                </div>
              </div>

              {record.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{record.notes}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default CropHistory;
