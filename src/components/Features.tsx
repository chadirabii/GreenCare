import { motion } from "framer-motion";
import {
  Brain,
  Cloud,
  LineChart,
  Shield,
  Smartphone,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Advanced machine learning algorithms analyze your farm data to provide actionable recommendations.",
  },
  {
    icon: Cloud,
    title: "Weather Monitoring",
    description:
      "Real-time weather updates and forecasts to help you plan your farming activities effectively.",
  },
  {
    icon: LineChart,
    title: "Crop Analytics",
    description:
      "Track crop health, growth patterns, and yield predictions with detailed analytics dashboards.",
  },
  {
    icon: Shield,
    title: "Disease Detection",
    description:
      "Early detection of crop diseases and pests using computer vision and AI technology.",
  },
  {
    icon: Smartphone,
    title: "Mobile Access",
    description:
      "Monitor and manage your farm from anywhere with our mobile-friendly platform.",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "Connect with other farmers, share experiences, and learn from agricultural experts.",
  },
];

const Features = () => {
  return (
    <section className="py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 gradient-radial opacity-30 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Powerful Features for Modern Farming
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to optimize your agricultural operations and
            maximize yields
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="h-full bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-smooth border border-border hover:border-primary/30">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-smooth group-hover:shadow-glow">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-smooth">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
