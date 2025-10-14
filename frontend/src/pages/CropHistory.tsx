import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CropRecord {
  id: string;
  cropName: string;
  plantedDate: string;
  harvestedDate?: string;
  yield: string;
  notes: string;
  status: 'growing' | 'harvested';
}

const initialRecords: CropRecord[] = [
  {
    id: '1',
    cropName: 'Tomatoes',
    plantedDate: '2025-01-15',
    harvestedDate: '2025-03-10',
    yield: '50 kg',
    notes: 'Excellent harvest, weather was favorable',
    status: 'harvested',
  },
  {
    id: '2',
    cropName: 'Lettuce',
    plantedDate: '2025-02-01',
    yield: 'TBD',
    notes: 'Growing well, regular irrigation applied',
    status: 'growing',
  },
];

const CropHistory = () => {
  const [records, setRecords] = useState<CropRecord[]>(initialRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cropName: '',
    plantedDate: '',
    harvestedDate: '',
    yield: '',
    notes: '',
    status: 'growing' as 'growing' | 'harvested',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = { ...formData, id: Date.now().toString() };
    setRecords([newRecord, ...records]);
    toast({ title: 'Crop record added successfully' });
    setIsDialogOpen(false);
    setFormData({
      cropName: '',
      plantedDate: '',
      harvestedDate: '',
      yield: '',
      notes: '',
      status: 'growing',
    });
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
            <p className="text-muted-foreground">Track your planting and harvest records</p>
          </div>
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
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    required
                  />
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
                <div>
                  <Label htmlFor="harvestedDate">Harvested Date (optional)</Label>
                  <Input
                    id="harvestedDate"
                    type="date"
                    value={formData.harvestedDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        harvestedDate: e.target.value,
                        status: e.target.value ? 'harvested' : 'growing',
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
                    onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                      record.status === 'harvested'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {record.status === 'harvested' ? 'Harvested' : 'Growing'}
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
                  <p className="font-medium">{new Date(record.plantedDate).toLocaleDateString()}</p>
                </div>
                {record.harvestedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Harvested</p>
                    <p className="font-medium">{new Date(record.harvestedDate).toLocaleDateString()}</p>
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
