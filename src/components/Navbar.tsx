import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center transition-smooth group-hover:shadow-glow">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              GreenCare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  className={`transition-smooth ${
                    isActive(link.path)
                      ? "text-primary font-semibold"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth">
              <Button
                variant="outline"
                className="transition-smooth hover:border-primary hover:text-primary"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary-light transition-smooth shadow-soft hover:shadow-glow">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-t border-border"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-lg ${
                      isActive(link.path)
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-foreground"
                    }`}
                  >
                    {link.name}
                  </Button>
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary-light">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
