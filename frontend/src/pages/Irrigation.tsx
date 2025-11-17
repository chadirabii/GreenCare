import { motion } from 'framer-motion';
import { Droplets, Cloud, Thermometer, Droplet, Wind, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useEffect, useState } from 'react';
import { getWeather } from '@/services/wateringService';


// Current weather
const Irrigation = () => {
   const [weatherData, setWeatherData] = useState({
      temp: 0,
      humidity: 0,
      rainfall: 0,
      wind: 0,
    });
  
    // Dynamic 5-day forecast
  const [forecast, setForecast] = useState([]);
    useEffect(() => {
      const fetchWeather = async () => {
        try {
          const data = await getWeather();
          console.log('Weather data received:', data);
          if (data) {
             // Current conditions
            setWeatherData({
              temp: data.temperature_max?.[0] || 0,
              humidity: data.relative_humidity_max?.[0] || 0,
              rainfall: data.precipitation?.[0] || 0,
              wind: data.windspeed_max?.[0] || 0,
            });
            console.log('Weather state updated:', {
              temp: data.temperature_max?.[0] || 0,
              humidity: data.relative_humidity_max?.[0] || 0,
              rainfall: data.precipitation?.[0] || 0,
              wind: data.windspeed_max?.[0] || 0,
            });
             // Build dynamic 5-day forecast
              const formatted = data.temperature_max
            .slice(0, 5)
            .map((temp, i) => ({
              day: new Date(data.dates[i]).toLocaleDateString("en-US", {
                weekday: "long",
              }),
              temp: temp,
              humidity: data.relative_humidity_max[i],
              rainfall: data.precipitation[i],
              icon: Cloud, // default icon (you can change later)
            }));

          setForecast(formatted);
          }
        } catch (error) {
          console.error('Error in fetchWeather:', error);
        }
      };
  
      fetchWeather();
    }, []);
  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Irrigation & Weather</h1>
          <p className="text-muted-foreground">Monitor weather conditions and irrigation recommendations</p>
        </div>

        {/* AI Recommendation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-lg p-6 border-2 border-primary/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">AI Irrigation Recommendation</h3>
            </div>
            <p className="text-lg mb-2">
              Based on current conditions, irrigate your crops for <strong>30 minutes</strong> in the evening.
            </p>
            <p className="text-sm text-muted-foreground">
              Soil moisture is at optimal levels. Light rainfall expected Wednesday. Monitor drainage in low-lying areas.
            </p>
          </div>
        </motion.div>

        {/* Current Weather */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Conditions</h2>
          <div className="grid gap-4 md:grid-cols-4">
              {/* TEMP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg p-6 border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Thermometer className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-3xl font-bold">{weatherData.temp}°C</p>
                </div>
              </div>
            </motion.div>
            {/* HUMIDITY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-6 border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Droplet className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="text-3xl font-bold">{weatherData.humidity}%</p>
                </div>
              </div>
            </motion.div>
            {/* RAIN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg p-6 border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Cloud className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rainfall</p>
                  <p className="text-3xl font-bold">{weatherData.rainfall}mm</p>
                </div>
              </div>
            </motion.div>
            {/* WIND */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 rounded-lg p-6 border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                  <Wind className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                  <p className="text-3xl font-bold">{weatherData.wind} km/h</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

 


        {/* Weekly Forecast */}
<div>
  <h2 className="text-xl font-semibold mb-4">5-Day Forecast</h2>

  {forecast.length === 0 ? (
    <p className="text-muted-foreground">Loading forecast...</p>
  ) : (
    <div className="grid gap-4 md:grid-cols-5">
      {forecast.map((day, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + index * 0.1 }}
          className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow"
        >
          {/* Day name: Monday, Tuesday, etc. */}
          <p className="font-semibold mb-2">{day.day}</p>

          {/* Weather icon */}
          {day.icon && <day.icon className="h-8 w-8 mx-auto mb-2 text-primary" />}

          {/* Temperature */}
          <p className="text-2xl font-bold mb-2">{day.temp}°C</p>

          {/* Humidity + Rainfall */}
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Humidity: {day.humidity}%</p>
            <p>Rain: {day.rainfall}mm</p>
          </div>
        </motion.div>
      ))}
    </div>
  )}
</div>
 {/* Irrigation Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="border rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" />
            Recommended Irrigation Schedule
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Morning Session</p>
                <p className="text-sm text-muted-foreground">6:00 AM - 6:30 AM</p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                30 min
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Evening Session</p>
                <p className="text-sm text-muted-foreground">6:00 PM - 6:30 PM</p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                30 min
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Wednesday (Skip)</p>
                <p className="text-sm text-muted-foreground">Rainfall expected</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                No irrigation
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Irrigation;
