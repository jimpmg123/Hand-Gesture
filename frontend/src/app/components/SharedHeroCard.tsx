import { Badge } from "./ui/badge";

interface SharedHeroCardProps {
  activePage: 'home' | 'search' | 'gallery' | 'profile' | 'images';
  onNavigate: (page: string) => void;
}

export function SharedHeroCard({ activePage, onNavigate }: SharedHeroCardProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-neutral-200 p-6 md:p-10 mb-12 shadow-sm">
      {/* Brand Label */}
      <p className="tracking-[0.25em] text-[10px] uppercase text-neutral-500 mb-4">
        TRAVEL FROM PHOTO
      </p>
      
      <h1 
        className="mb-5 text-3xl md:text-4xl lg:text-5xl"
        style={{
          fontFamily: 'serif',
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          color: '#1a1a1a'
        }}
      >
        AI travel and food memory navigator
      </h1>
      <Badge 
        variant="secondary" 
        className="mb-6 px-4 py-1.5 bg-[#e8f3f1] text-[#2d6a5f] border border-[#c5e0d8] rounded-full"
      >
        frontend beta shell
      </Badge>
      <p className="text-neutral-600 max-w-3xl leading-relaxed mb-8">
        Upload a photo to discover where it was taken, explore route guidance, and access your personal gallery with signed-in memories. Food photos extend into cuisine discovery and restaurant recommendations.
      </p>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-3">
        <div 
          className={`px-6 py-3 rounded-2xl border border-neutral-200 cursor-pointer transition-all ${
            activePage === 'home' 
              ? 'bg-white shadow-sm hover:shadow-md' 
              : 'bg-white/50 hover:bg-white'
          }`}
          onClick={() => onNavigate('home')}
        >
          <span className={activePage === 'home' ? 'text-neutral-800' : 'text-neutral-600'}>
            Home
          </span>
        </div>
        <div 
          className={`px-6 py-3 rounded-2xl border border-neutral-200 cursor-pointer transition-all ${
            activePage === 'search' 
              ? 'bg-white shadow-sm hover:shadow-md' 
              : 'bg-white/50 hover:bg-white'
          }`}
          onClick={() => onNavigate('search')}
        >
          <span className={activePage === 'search' ? 'text-neutral-800' : 'text-neutral-600'}>
            Search
          </span>
        </div>
        <div 
          className={`px-6 py-3 rounded-2xl border border-neutral-200 cursor-pointer transition-all ${
            activePage === 'gallery' 
              ? 'bg-white shadow-sm hover:shadow-md' 
              : 'bg-white/50 hover:bg-white'
          }`}
          onClick={() => onNavigate('gallery')}
        >
          <span className={activePage === 'gallery' ? 'text-neutral-800' : 'text-neutral-600'}>
            Gallery
          </span>
        </div>
        <div 
          className={`px-6 py-3 rounded-2xl border border-neutral-200 cursor-pointer transition-all ${
            activePage === 'profile' 
              ? 'bg-white shadow-sm hover:shadow-md' 
              : 'bg-white/50 hover:bg-white'
          }`}
          onClick={() => onNavigate('profile')}
        >
          <span className={activePage === 'profile' ? 'text-neutral-800' : 'text-neutral-600'}>
            Profile
          </span>
        </div>
      </div>
    </div>
  );
}