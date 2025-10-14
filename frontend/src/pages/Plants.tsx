import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Plant {
  id: string;
  name: string;
  type: string;
  soilType: string;
  plantedDate: string;
}

const initialPlants: Plant[] = [
  { id: '1', name: 'Tomatoes', type: 'Vegetable', soilType: 'Loamy', plantedDate: '2025-01-15' },
  { id: '2', name: 'Roses', type: 'Flower', soilType: 'Sandy', plantedDate: '2025-01-20' },
  { id: '3', name: 'Lettuce', type: 'Vegetable', soilType: 'Clay', plantedDate: '2025-02-01' },
];

const Plants = () => {
  const [plants, setPlants] = useState<Plant[]>(initialPlants);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    soilType: '',
    plantedDate: '',
  });

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || plant.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlant) {
      setPlants(plants.map((p) => (p.id === editingPlant.id ? { ...editingPlant, ...formData } : p)));
      toast({ title: 'Plant updated successfully' });
    } else {
      const newPlant = { ...formData, id: Date.now().toString() };
      setPlants([...plants, newPlant]);
      toast({ title: 'Plant added successfully' });
    }
    setIsDialogOpen(false);
    setEditingPlant(null);
    setFormData({ name: '', type: '', soilType: '', plantedDate: '' });
  };

  const handleEdit = (plant: Plant) => {
    setEditingPlant(plant);
    setFormData({
      name: plant.name,
      type: plant.type,
      soilType: plant.soilType,
      plantedDate: plant.plantedDate,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPlants(plants.filter((p) => p.id !== id));
    toast({ title: 'Plant deleted successfully', variant: 'destructive' });
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
            <h1 className="text-3xl font-bold tracking-tight">Plant Management</h1>
            <p className="text-muted-foreground">Manage your plants and crops</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData({ name: '', type: '', soilType: '', plantedDate: '' })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Plant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPlant ? 'Edit Plant' : 'Add New Plant'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Plant Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetable">Vegetable</SelectItem>
                      <SelectItem value="Fruit">Fruit</SelectItem>
                      <SelectItem value="Flower">Flower</SelectItem>
                      <SelectItem value="Herb">Herb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Select value={formData.soilType} onValueChange={(value) => setFormData({ ...formData, soilType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Loamy">Loamy</SelectItem>
                      <SelectItem value="Sandy">Sandy</SelectItem>
                      <SelectItem value="Clay">Clay</SelectItem>
                      <SelectItem value="Peaty">Peaty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plantedDate">Planted Date</Label>
                  <Input
                    id="plantedDate"
                    type="date"
                    value={formData.plantedDate}
                    onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingPlant ? 'Update Plant' : 'Add Plant'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Vegetable">Vegetable</SelectItem>
              <SelectItem value="Fruit">Fruit</SelectItem>
              <SelectItem value="Flower">Flower</SelectItem>
              <SelectItem value="Herb">Herb</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Soil Type</th>
                  <th className="text-left p-4 font-medium">Planted Date</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlants.map((plant, index) => (
                  <motion.tr
                    key={plant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4 font-medium">{plant.name}</td>
                    <td className="p-4">{plant.type}</td>
                    <td className="p-4">{plant.soilType}</td>
                    <td className="p-4">{new Date(plant.plantedDate).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(plant)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(plant.id)}>
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

export default Plants;
