import { useState } from 'react';
import { MapPin, Edit2, Route, ChevronLeft, ChevronRight, Share2, ClipboardList, X, Navigation } from 'lucide-react';

interface GalleryImage {
  url: string;
  date: string;
}

interface GalleryCollection {
  id: number;
  badge: string;
  title: string;
  location: string;
  updated: string;
  desc: string;
  images: GalleryImage[];
}

interface ViewerData {
  collection: GalleryCollection;
  currentIndex: number;
}

interface GuideData {
  locationName: string;
}

export function GalleryPage() {
  const [viewerData, setViewerData] = useState<ViewerData | null>(null);
  const [guideData, setGuideData] = useState<GuideData | null>(null);

  const galleryCollections: GalleryCollection[] = [
    {
      id: 1, badge: "Mixed city memory", title: "Florence memory set", location: "Florence, Italy", updated: "Updated 3 days ago", desc: "Historical landmarks, cozy pasta restaurants, and beautiful art galleries from an early spring trip.",
      images: [
        { url: "https://images.unsplash.com/photo-1543429776-27826dddefce?auto=format&fit=crop&w=800&q=80", date: "Oct 12, 2023 • 14:30" },
        { url: "https://images.unsplash.com/photo-1498579809087-ef1e558fd1ea?auto=format&fit=crop&w=800&q=80", date: "Oct 13, 2023 • 19:15" },
        { url: "https://images.unsplash.com/photo-1516483638261-f40af5bea098?auto=format&fit=crop&w=800&q=80", date: "Oct 14, 2023 • 10:05" },
      ]
    },
    {
      id: 2, badge: "Food group", title: "Kyoto food trail", location: "Kyoto, Japan", updated: "Updated 1 week ago", desc: "Late-night ramen spots, alleys, and market meals from a Kyoto food run.",
      images: [
        { url: "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80", date: "Feb 28, 2024 • 20:00" },
        { url: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80", date: "Feb 29, 2024 • 12:30" },
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h2 className="text-2xl md:text-3xl font-serif text-gray-900">My Collections</h2>
        <div className="text-xs md:text-sm text-gray-500 font-medium">Grouped by City</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {galleryCollections.map((col) => (
          <div key={col.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col group/collection">
            <div className="relative h-44 p-6 flex flex-col justify-between overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center blur-md scale-[1.15] opacity-90 transition-transform duration-700 group-hover/collection:scale-125"
                style={{ backgroundImage: `url(${col.images[0].url})` }}
              ></div>
              <div className="absolute inset-0 bg-[#0d4b46]/60 mix-blend-multiply"></div>

              <div className="relative z-10 flex justify-start">
                <span className="bg-white/20 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide border border-white/20">
                  {col.badge}
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-white text-2xl font-bold mb-1 tracking-tight">{col.title}</h3>
                <p className="text-white/80 text-sm font-medium flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> {col.location}
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1 bg-white">
              <div className="flex justify-between text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider">
                <span>{col.updated}</span>
                <span>{col.images.length} images</span>
              </div>

              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-900 text-lg">{col.title}</h4>
                <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-1">{col.desc}</p>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setViewerData({ collection: col, currentIndex: 0 })}
                  className="flex-1 bg-[#0f4d45] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#0a3630] transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  View Images
                </button>
                <button
                  onClick={() => setGuideData({ locationName: col.location })}
                  className="flex-1 bg-gray-100 text-gray-800 rounded-xl py-3 text-sm font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Route className="w-4 h-4 mr-1.5" /> Open Guide
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewerData && (() => {
        const currentImage = viewerData.collection.images[viewerData.currentIndex];
        return (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
            <button onClick={() => setViewerData(null)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2.5 rounded-full backdrop-blur-md transition-colors z-50">
              <X className="w-6 h-6" />
            </button>
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white/90 font-bold tracking-widest text-sm md:text-base bg-white/10 px-5 py-2 rounded-full backdrop-blur-md shadow-lg border border-white/10">
              {currentImage.date}
            </div>
            <div className="text-white mb-4 text-center mt-12 md:mt-0">
              <h3 className="text-2xl font-bold">{viewerData.collection.title}</h3>
              <p className="text-white/60 text-sm mt-1">Image {viewerData.currentIndex + 1} of {viewerData.collection.images.length}</p>
            </div>
            <div className="flex items-center w-full max-w-5xl justify-between">
              <button
                onClick={() => setViewerData({ ...viewerData, currentIndex: Math.max(0, viewerData.currentIndex - 1) })}
                className={`p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all ${viewerData.currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                disabled={viewerData.currentIndex === 0}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <div className="relative w-full max-w-3xl aspect-[4/3] bg-black rounded-2xl flex items-center justify-center border border-white/20 mx-4 overflow-hidden shadow-2xl group">
                <img src={currentImage.url} alt="Gallery item" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 right-4 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-3 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors shadow-lg border border-white/10" title="Share Photo">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-black/60 hover:bg-[#2d6a5f] rounded-full text-white backdrop-blur-md transition-colors shadow-lg border border-white/10" title="Upload to Board">
                    <ClipboardList className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setViewerData({ ...viewerData, currentIndex: Math.min(viewerData.collection.images.length - 1, viewerData.currentIndex + 1) })}
                className={`p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all ${viewerData.currentIndex === viewerData.collection.images.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                disabled={viewerData.currentIndex === viewerData.collection.images.length - 1}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        );
      })()}

      {guideData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col shadow-2xl relative animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Route to {guideData.locationName}</h3>
                <p className="text-gray-500 text-sm">Generated by Google Maps API</p>
              </div>
              <button onClick={() => setGuideData(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full h-[50vh] md:h-[60vh] bg-gray-200 relative">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2881.08375631405!2d11.2536!3d43.7695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDQ2JzEwLjIiTiAxMcKwMTUnMTMuMCJF!5e0!3m2!1sen!2sit!4v1680000000000!5m2!1sen!2sit" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Route Map"></iframe>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center">
                <Navigation className="w-5 h-5 mr-2" /> Start Navigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}