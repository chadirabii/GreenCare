import { getPlants } from "@/services/wateringService";
import { Plant } from "@/services/types"; // optional if you want typing
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PlantWatering } from "@/services/types";
import {
  getWaterings,
  addWatering,
  updateWatering,
  deleteWatering,
} from "@/services/wateringService";

import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Watering = () => {
  const [waterings, setWaterings] = useState<PlantWatering[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [plants, setPlants] = useState([]); 
  const [editingWatering, setEditingWatering] = useState<PlantWatering | null>(
    null
  );
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<PlantWatering>>({
    plant: undefined,
    plant_name: "", 
    watering_date: "",
    next_watering_date: "",
    amount_ml: 0,
    notes: "",
    is_completed: false,
  });

  useEffect(() => {
    fetchWaterings();
    fetchPlants();
  }, []);

  const fetchWaterings = async () => {
    try {
      const data = await getWaterings();
      setWaterings(data);
    } catch (err) {
      toast({ title: "Failed to load waterings", variant: "destructive" });
    }
  };

  const fetchPlants = async () => {
    try {
      const data = await getPlants();
      setPlants(data);
    } catch (err) {
      toast({ title: "Failed to load plants", variant: "destructive" });
    }
  };

  const filteredWaterings = waterings.filter((w) =>
    w.plant_name?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWatering && editingWatering.id) {
        const updated = await updateWatering({
          ...(formData as PlantWatering),
          id: editingWatering.id,
        });
        setWaterings(waterings.map((w) => (w.id === updated.id ? updated : w)));
        toast({ title: "Watering updated successfully" });
      } else {
        const created = await addWatering(formData as PlantWatering);
        setWaterings([...waterings, created]);
        toast({ title: "Watering added successfully" });
      }
      setIsDialogOpen(false);
      setEditingWatering(null);
      setFormData({
        plant: undefined,
        plant_name: "",
        watering_date: "",
        next_watering_date: "",
        amount_ml: 0,
        notes: "",
        is_completed: false,
      });
    } catch (err) {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const handleEdit = (w: PlantWatering) => {
    setEditingWatering(w);
    setFormData(w);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await deleteWatering(id);
      setWaterings(waterings.filter((w) => w.id !== id));
      toast({ title: "Watering deleted successfully", variant: "destructive" });
    } catch (err) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
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
            <h1 className="text-3xl font-bold tracking-tight">
              Watering Management
            </h1>
            <p className="text-muted-foreground">
              Track and schedule plant waterings
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() =>
                  setFormData({
                    plant: undefined,
                    plant_name: "",
                    watering_date: "",
                    next_watering_date: "",
                    amount_ml: 0,
                    notes: "",
                    is_completed: false,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Watering
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingWatering ? "Edit Watering" : "Add New Watering"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/*<div>
                <Label htmlFor="plant_name">Plant Name</Label>
                  <Input id="plant_name" value={formData.plant_name || ''} onChange={(e) => setFormData({ ...formData, plant_name: e.target.value })} required />
                </div>*/}
                <div>
                  <Label htmlFor="plant">Plant</Label>
                  <select
                    id="plant"
                    value={formData.plant ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, plant: Number(e.target.value) })
                    }
                    required
                  >
                    <option value="">Select a plant</option>
                    {plants.map((plant) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="watering_date">Watering Date</Label>
                  <Input
                    id="watering_date"
                    type="date"
                    value={formData.watering_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        watering_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="next_watering_date">Next Watering Date</Label>
                  <Input
                    id="next_watering_date"
                    type="date"
                    value={formData.next_watering_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        next_watering_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="amount_ml">Amount (ml)</Label>
                  <Input
                    id="amount_ml"
                    type="number"
                    value={formData.amount_ml ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount_ml: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingWatering ? "Update Watering" : "Add Watering"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search waterings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Plant</th>
                  <th className="text-left p-4 font-medium">Watering Date</th>
                  <th className="text-left p-4 font-medium">Next Watering</th>
                  <th className="text-left p-4 font-medium">Amount (ml)</th>
                  <th className="text-left p-4 font-medium">Completed</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWaterings.map((w, index) => (
                  <motion.tr
                    key={w.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4 font-medium">{w.plant_name}</td>
                    <td className="p-4">
                      {w.watering_date
                        ? new Date(w.watering_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4">
                      {w.next_watering_date
                        ? new Date(w.next_watering_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4">{w.amount_ml ?? "-"}</td>
                    <td className="p-4">{w.is_completed ? "Yes" : "No"}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          id="edit"
                          onClick={() => handleEdit(w)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          id="delete"
                          onClick={() => handleDelete(w.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Watering;
