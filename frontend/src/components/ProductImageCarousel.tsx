import { useState, useEffect, useRef } from "react";
import type { ProductImage } from "@/services/types";

interface ProductImageCarouselProps {
  images: ProductImage[] | undefined;
  fallbackImage: string;
  productName: string;
  autoPlayInterval?: number; // in milliseconds
  className?: string;
}

export const ProductImageCarousel = ({
  images,
  fallbackImage,
  productName,
  autoPlayInterval = 3000,
  className = "",
}: ProductImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get all image URLs
  const imageUrls = images?.length
    ? images.map((img) => img.image_url)
    : [fallbackImage];

  const totalImages = imageUrls.length;

  // Auto-play functionality
  useEffect(() => {
    if (totalImages > 1 && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalImages);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [totalImages, isHovered, autoPlayInterval]);

  // Reset to first image when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Image */}
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={imageUrls[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Image Counter Badge */}
        {totalImages > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1}/{totalImages}
          </div>
        )}

        {/* Dot Indicators */}
        {totalImages > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {imageUrls.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-4"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
