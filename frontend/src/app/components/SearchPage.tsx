import { SharedHeroCard } from "./SharedHeroCard";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";

interface SearchPageProps {
  onNavigate: (page: string) => void;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  return (
    <>
      <SharedHeroCard activePage="search" onNavigate={onNavigate} />

      {/* Search Section Header */}
      <div className="mb-10">
        <p className="tracking-[0.2em] text-[10px] uppercase text-neutral-500 mb-6">
          SEARCH & UPLOAD
        </p>
        <h2 
          className="mb-4 text-2xl md:text-3xl lg:text-4xl"
          style={{
            fontFamily: 'serif',
            fontWeight: 400,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            color: '#1a1a1a'
          }}
        >
          Discover your travel memories
        </h2>
        <p className="text-neutral-600 max-w-4xl leading-relaxed mb-12">
          Upload a travel photo to identify the location, or a food photo to discover restaurants and cuisine details. The system uses AI to estimate places and provide personalized route guidance.
        </p>
      </div>

      {/* Upload Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Travel Photo Upload */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-10">
          <div className="mb-6">
            <h3 className="mb-3" style={{ color: '#1a1a1a' }}>
              Travel Photo Discovery
            </h3>
            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
              Upload a landmark, cityscape, or scenic photo. The system will estimate the location and suggest nearby points of interest.
            </p>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-12 mb-6 bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="w-12 h-12 text-neutral-400 mb-4" />
              <p className="text-neutral-600 mb-2">Drop travel photo here</p>
              <p className="text-neutral-500 text-sm">or click to browse</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Optional hint (city or region)
              </label>
              <input 
                type="text" 
                placeholder="e.g., Paris, Tokyo Bay, Swiss Alps"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#2d6a5f]/20 focus:border-[#2d6a5f]"
              />
            </div>
          </div>

          <Button 
            className="w-full px-6 py-3 rounded-xl bg-[#2d6a5f] hover:bg-[#1f5045] text-white"
          >
            Analyze Location
          </Button>
        </div>

        {/* Food Photo Upload */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-10">
          <div className="mb-6">
            <h3 className="mb-3" style={{ color: '#1a1a1a' }}>
              Food Photo Discovery
            </h3>
            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
              Upload a meal, dish, or street food photo. The system will identify the cuisine type and recommend nearby restaurants.
            </p>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-12 mb-6 bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="w-12 h-12 text-neutral-400 mb-4" />
              <p className="text-neutral-600 mb-2">Drop food photo here</p>
              <p className="text-neutral-500 text-sm">or click to browse</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Optional cuisine hint
              </label>
              <input 
                type="text" 
                placeholder="e.g., Japanese, Italian, Street food"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#2d6a5f]/20 focus:border-[#2d6a5f]"
              />
            </div>
          </div>

          <Button 
            className="w-full px-6 py-3 rounded-xl bg-[#2d6a5f] hover:bg-[#1f5045] text-white"
          >
            Discover Restaurants
          </Button>
        </div>
      </div>

      {/* Result Placeholder */}
      <div className="bg-white/60 rounded-3xl border border-neutral-200 p-10 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-neutral-500 text-sm leading-relaxed">
            Upload results will appear here with estimated locations, route suggestions, and restaurant recommendations based on your photo type.
          </p>
        </div>
      </div>
    </>
  );
}