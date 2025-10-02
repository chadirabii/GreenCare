import { motion } from "framer-motion";
import { Check } from "lucide-react";
import showcaseImage from "@/assets/showcase-img.jpg";

const benefits = [
  "Real-time crop monitoring and alerts",
  "Predictive analytics for better planning",
  "Resource optimization to reduce costs",
  "Automated reporting and insights",
  "Expert consultation and support",
  "Integration with farm equipment",
];

const Showcase = () => {
  return (
    <section className="py-24 sm:py-32 gradient-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-medium">
              <img
                src={showcaseImage}
                alt="GreenCare dashboard showing smart farming analytics"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-medium p-6 border border-border"
            >
              <div className="text-3xl font-bold text-primary mb-1">
                50K+
              </div>
              <div className="text-sm text-muted-foreground">
                Hectares Monitored
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              Transform Your Farming with Smart Technology
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              GreenCare combines cutting-edge AI technology with agricultural
              expertise to help you make data-driven decisions and maximize your
              farm's potential.
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
                <div className="text-3xl font-bold text-primary mb-2">30%</div>
                <div className="text-sm text-muted-foreground">
                  Increase in Yield
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
                <div className="text-3xl font-bold text-primary mb-2">40%</div>
                <div className="text-sm text-muted-foreground">
                  Cost Reduction
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
