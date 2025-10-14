import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Target, Lightbulb, Award, Users } from "lucide-react";
import aboutImage from "@/assets/about-img.jpg";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To empower farmers worldwide with AI-driven insights that transform traditional agriculture into smart, sustainable farming practices.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We leverage cutting-edge AI and machine learning to provide farmers with predictive analytics and real-time monitoring.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "Committed to delivering the highest quality solutions with 95% accuracy in crop health predictions and disease detection.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Building a global network of farmers and agricultural experts who share knowledge and best practices.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 gradient-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
              About GreenCare
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Pioneering the future of agriculture through artificial intelligence
              and sustainable farming practices
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-medium">
                <img
                  src={aboutImage}
                  alt="Smart farming technology"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Transforming Agriculture with AI
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2020, GreenCare emerged from a vision to bridge the
                  gap between traditional farming wisdom and modern technology. We
                  recognized that farmers needed accessible, intelligent tools to
                  navigate the challenges of climate change, resource management,
                  and sustainable production.
                </p>
                <p>
                  Our platform combines satellite imagery, IoT sensors, and
                  advanced machine learning algorithms to provide farmers with
                  actionable insights. From early disease detection to optimal
                  harvest timing, we help farmers make informed decisions that
                  improve yields and reduce environmental impact.
                </p>
                <p>
                  Today, we're proud to serve over 10,000 farmers across multiple
                  continents, monitoring more than 50,000 hectares of farmland and
                  contributing to a more sustainable agricultural future.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 sm:py-24 gradient-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-8 shadow-soft border border-border"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Advanced Technology Stack
            </h2>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              We use state-of-the-art technologies to deliver accurate,
              real-time insights
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                "Machine Learning",
                "Computer Vision",
                "IoT Integration",
                "Cloud Computing",
                "Big Data Analytics",
                "Satellite Imagery",
                "Weather APIs",
                "Mobile Apps",
              ].map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-card rounded-xl p-4 shadow-soft border border-border hover:border-primary/30 transition-smooth"
                >
                  <p className="text-sm font-medium text-foreground">{tech}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
