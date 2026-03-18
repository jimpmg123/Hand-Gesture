import { useState } from "react";
import { SharedHeroCard } from "./SharedHeroCard";
import { ImageModal } from "./ImageModal";
import { Badge } from "./ui/badge";
import { ArrowLeft } from "lucide-react";

interface ImagesPageProps {
  onNavigate: (page: string) => void;
  groupTitle: string;
  groupCity: string;
  groupType: string;
}

export function ImagesPage({ onNavigate, groupTitle, groupCity, groupType }: ImagesPageProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Mock images for the group
  const images = [
    {
      id: 1,
      title: "Harbor View",
      date: "March 10, 2026",
      category: "Landmark",
      url: "",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      id: 2,
      title: "City Skyline",
      date: "March 10, 2026",
      category: "Cityscape",
      url: "",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      id: 3,
      title: "Beach Sunset",
      date: "March 11, 2026",
      category: "Scenic",
      url: "",
      gradient: "from-orange-400 to-red-400"
    },
    {
      id: 4,
      title: "Street Market",
      date: "March 11, 2026",
      category: "Culture",
      url: "",
      gradient: "from-green-400 to-teal-400"
    },
    {
      id: 5,
      title: "Temple Architecture",
      date: "March 12, 2026",
      category: "Landmark",
      url: "",
      gradient: "from-yellow-400 to-amber-400"
    },
    {
      id: 6,
      title: "Night Lights",
      date: "March 12, 2026",
      category: "Cityscape",
      url: "",
      gradient: "from-indigo-400 to-violet-400"
    },
    {
      id: 7,
      title: "Local Cuisine",
      date: "March 13, 2026",
      category: "Food",
      url: "",
      gradient: "from-rose-400 to-pink-400"
    },
    {
      id: 8,
      title: "Mountain View",
      date: "March 13, 2026",
      category: "Scenic",
      url: "",
      gradient: "from-emerald-400 to-green-400"
    }
  ];

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      // Loop to last image if at first
      newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    } else {
      // Loop to first image if at last
      newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    }
    
    setSelectedImage(images[newIndex]);
  };

  return (
    <>
      <SharedHeroCard activePage="images" onNavigate={onNavigate} />

      {/* Images Section Header */}
      <div className="mb-10">
        <p className="tracking-[0.2em] text-[10px] uppercase text-neutral-500 mb-6">
          IMAGES
        </p>
        
        {/* Title Row with Back Button */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <h2 
            className="flex-1 min-w-[200px] text-2xl md:text-3xl lg:text-4xl"
            style={{
              fontFamily: 'serif',
              fontWeight: 400,
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              color: '#1a1a1a'
            }}
          >
            {groupTitle}
          </h2>
          
          {/* Upper-right Back Button */}
          <button
            onClick={() => onNavigate('gallery')}
            className="px-5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors flex items-center gap-2 text-neutral-700 text-sm whitespace-nowrap"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <Badge 
            variant="secondary" 
            className="px-3 py-1 bg-[#f0faf8] text-[#2d6a5f] border border-[#c5e0d8] rounded-full text-xs"
          >
            {groupType}
          </Badge>
          <span className="text-neutral-600 text-sm">{groupCity}</span>
        </div>
        <p className="text-neutral-600 max-w-4xl leading-relaxed mb-12">
          All images saved in this {groupCity} memory collection. Click any thumbnail to view it in detail.
        </p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {images.map((image) => (
          <div 
            key={image.id}
            className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group"
            onClick={() => setSelectedImage(image)}
          >
            {/* Image Thumbnail */}
            <div className={`aspect-square bg-gradient-to-br ${image.gradient} relative flex items-center justify-center`}>
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors"></div>
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-white/80" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Image Info */}
            <div className="p-5">
              <h4 className="text-sm mb-1" style={{ color: '#1a1a1a' }}>
                {image.title}
              </h4>
              <p className="text-xs text-neutral-500 mb-1">{image.date}</p>
              <p className="text-xs text-neutral-600">{image.category}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Back to Gallery - Lower Button */}
      <div className="bg-white/60 rounded-2xl border border-neutral-200 p-6 text-center">
        <button
          onClick={() => onNavigate('gallery')}
          className="text-[#2d6a5f] hover:text-[#1f5045] transition-colors flex items-center gap-2 justify-center mx-auto"
        >
          <ArrowLeft size={16} />
          Back to Gallery
        </button>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          image={selectedImage}
          images={images}
          onNavigate={handleImageNavigation}
        />
      )}
    </>
  );
}