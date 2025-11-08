import { useEffect, useState } from 'react';
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

interface PlantWatering {
  id?: number;
  plant_name: string;
  watering_date: string;
  next_watering_date?: string;
  amount_ml: number;
  notes?: string;
  is_completed: boolean;
}

const Watering = () => {
  const [waterings, setWaterings] = useState<PlantWatering[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWatering, setEditingWatering] = useState<PlantWatering | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<PlantWatering>({
    plant_name: '',
    watering_date: '',
    next_watering_date: '',
    amount_ml: 0,
    notes: '',
    is_completed: false,
  });

  // Récupération des données depuis l'API Django
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/plant-watering/')
      .then((res) => res.json())
      .then((data) => setWaterings(data))
      .catch((err) => console.error('Error fetching waterings:', err));
  }, []);

  const filteredWaterings = waterings.filter((w) =>
    w.plant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWatering) {
      // PUT request pour mettre à jour un arrosage
      const res = await fetch(`http://127.0.0.1:8000/api/plant-watering/${editingWatering.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const updated = await res.json();
      setWaterings(waterings.map((w) => (w.id === editingWatering.id ? updated : w)));
      toast({ title: 'Watering updated successfully' });
    } else {
      // POST request pour créer un nouvel arrosage
      const res = await fetch('http://127.0.0.1:8000/api/plant-watering/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const newWatering = await res.json();
      setWaterings([...waterings, newWatering]);
      toast({ title: 'Watering added successfully' });
    }

    setIsDialogOpen(false);
    setEditingWatering(null);
    setFormData({
      plant_name: '',
      watering_date: '',
      next_watering_date: '',
      amount_ml: 0,
      notes: '',
      is_completed: false,
    });
  };

  const handleEdit = (w: PlantWatering) => {
    setEditingWatering(w);
    setFormData(w);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await fetch(`http://127.0.0.1:8000/api/plant-watering/${id}/`, {
      method: 'DELETE',
    });
    setWaterings(waterings.filter((w) => w.id !== id));
    toast({ title: 'Watering deleted successfully', variant: 'destructive' });
  };

  return (
    <div>
      {/* Ici tu peux mettre ton formulaire et tableau comme avant */}
    </div>
  );
};

export default Watering;