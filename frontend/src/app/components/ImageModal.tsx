import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: number;
    url: string;
    title: string;
    date: string;
    category: string;
    gradient: string;
  };
  images: Array<{
    id: number;
    url: string;
    title: string;
    date: string;
    category: string;
    gradient: string;
  }>;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function ImageModal({ isOpen, onClose, image, images, onNavigate }: ImageModalProps) {
  if (!isOpen) return null;

  const currentIndex = images.findIndex(img => img.id === image.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === images.length - 1;

  const handlePrev = () => {
    onNavigate('prev');
  };

  const handleNext = () => {
    onNavigate('next');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="flex justify-end p-6">
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <X className="w-6 h-6 text-neutral-600" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="px-10 pb-10">
          <div className={`aspect-video bg-gradient-to-br ${image.gradient} rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative text-center">
              <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-10 h-10 text-white/80" 
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
              <div className="text-white/60 text-sm">Large Preview: {image.title}</div>
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 hover:bg-white transition-all shadow-lg"
              title={isFirst ? "Go to last image" : "Previous image"}
            >
              <ChevronLeft className="w-6 h-6 text-neutral-800" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 hover:bg-white transition-all shadow-lg"
              title={isLast ? "Go to first image" : "Next image"}
            >
              <ChevronRight className="w-6 h-6 text-neutral-800" />
            </button>
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <h3 className="text-xl" style={{ color: '#1a1a1a' }}>
              {image.title}
            </h3>
            <div className="flex gap-4 text-sm text-neutral-600">
              <span>{image.date}</span>
              <span>•</span>
              <span>{image.category}</span>
              <span>•</span>
              <span className="text-neutral-500">
                Image {currentIndex + 1} of {images.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}