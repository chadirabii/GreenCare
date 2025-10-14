import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sprout, History, Droplets, Scan, Cloud, Thermometer, Droplet, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/AppLayout';

const quickActions = [
  { title: 'Plants', icon: Sprout, url: '/plants', color: 'text-green-600' },
  { title: 'Crop History', icon: History, url: '/crop-history', color: 'text-blue-600' },
  { title: 'Irrigation', icon: Droplets, url: '/irrigation', color: 'text-cyan-600' },
  { title: 'Disease Detection', icon: Scan, url: '/disease-detection', color: 'text-purple-600' },
];

const weatherData = {
  temp: 24,
  humidity: 65,
  rainfall: 12,
  wind: 8,
};

const Dashboard = () => {
  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to GreenCare</p>
        </div>

        {/* Weather Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-6 border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Thermometer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">{weatherData.temp}°C</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg p-6 border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Droplet className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-2xl font-bold">{weatherData.humidity}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg p-6 border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Cloud className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rainfall</p>
                <p className="text-2xl font-bold">{weatherData.rainfall}mm</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 rounded-lg p-6 border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                <Wind className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wind Speed</p>
                <p className="text-2xl font-bold">{weatherData.wind} km/h</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Irrigation Advice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border border-green-200 dark:border-green-900/30"
        >
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-green-600" />
            Today's Irrigation Advice
          </h3>
          <p className="text-muted-foreground">
            Based on current weather conditions, we recommend irrigating your crops for 30 minutes in the evening. Soil moisture levels are optimal.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Link to={action.url}>
                  <Button
                    variant="outline"
                    className="w-full h-24 flex-col gap-2 hover:bg-accent"
                  >
                    <action.icon className={`h-8 w-8 ${action.color}`} />
                    <span className="font-medium">{action.title}</span>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="border rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Recent Crop History</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Tomatoes</p>
                <p className="text-sm text-muted-foreground">Planted 2 weeks ago</p>
              </div>
              <span className="text-sm text-green-600">Growing</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Lettuce</p>
                <p className="text-sm text-muted-foreground">Harvested last week</p>
              </div>
              <span className="text-sm text-blue-600">Harvested</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Carrots</p>
                <p className="text-sm text-muted-foreground">Planted 1 month ago</p>
              </div>
              <span className="text-sm text-green-600">Growing</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
