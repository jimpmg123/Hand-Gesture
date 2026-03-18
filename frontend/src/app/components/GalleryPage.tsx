import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { SharedHeroCard } from "./SharedHeroCard";
import { useState } from "react";
import { Pencil } from "lucide-react";

interface GalleryPageProps {
  onNavigate: (page: string) => void;
  onViewImages: (group: any) => void;
}

export function GalleryPage({ onNavigate, onViewImages }: GalleryPageProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [groups, setGroups] = useState([
    {
      id: 1,
      title: "Busan memory set",
      city: "Busan, South Korea",
      type: "Mixed city memory",
      lastUpdate: "Updated 3 days ago",
      description: "A collection of coastal landmarks, urban streets, and beach scenes from March 2026.",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      id: 2,
      title: "Kyoto food trail",
      city: "Kyoto, Japan",
      type: "Food group",
      lastUpdate: "Updated 1 week ago",
      description: "Traditional Japanese cuisine discoveries including ramen, sushi, and street market dishes.",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      id: 3,
      title: "Chicago city set",
      city: "Chicago, USA",
      type: "Landmark group",
      lastUpdate: "Updated 2 weeks ago",
      description: "Architecture highlights, lakefront views, and downtown skyline captures.",
      gradient: "from-orange-400 to-red-400"
    },
    {
      id: 4,
      title: "Taipei street moments",
      city: "Taipei, Taiwan",
      type: "Mixed city memory",
      lastUpdate: "Updated 3 weeks ago",
      description: "Night markets, temple visits, and modern city life across different districts.",
      gradient: "from-green-400 to-teal-400"
    },
    {
      id: 5,
      title: "Paris landmarks",
      city: "Paris, France",
      type: "Landmark group",
      lastUpdate: "Updated 1 month ago",
      description: "Classic Parisian architecture, museums, and iconic monuments from a spring visit.",
      gradient: "from-yellow-400 to-amber-400"
    },
    {
      id: 6,
      title: "Barcelona tapas tour",
      city: "Barcelona, Spain",
      type: "Food group",
      lastUpdate: "Updated 1 month ago",
      description: "Spanish cuisine exploration featuring tapas bars, seafood, and local wine experiences.",
      gradient: "from-indigo-400 to-violet-400"
    }
  ]);

  const handleTitleEdit = (id: number, newTitle: string) => {
    setGroups(groups.map(group => 
      group.id === id ? { ...group, title: newTitle } : group
    ));
    setEditingId(null);
  };

  return (
    <>
      {/* Shared Hero Card */}
      <SharedHeroCard activePage="gallery" onNavigate={onNavigate} />

      {/* User State */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 mb-12 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-neutral-800 mb-2">Signed in as Jinu Hong</p>
            <p className="text-neutral-600 mb-3">Traveler view enabled</p>
            <Badge 
              variant="outline" 
              className="px-3 py-1 bg-[#f0faf8] text-[#2d6a5f] border-[#c5e0d8] rounded-full"
            >
              Role: Traveler
            </Badge>
          </div>
          <Button 
            variant="outline" 
            className="px-6 py-2 rounded-xl border-neutral-300 hover:bg-neutral-50 whitespace-nowrap"
          >
            Mock Sign Out
          </Button>
        </div>
      </div>

      {/* Gallery Section Header */}
      <div className="mb-10">
        <p className="tracking-[0.2em] text-[10px] uppercase text-neutral-500 mb-6">
          GALLERY
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
          My uploaded photos
        </h2>
        <p className="text-neutral-600 max-w-4xl leading-relaxed mb-12">
          Signed-in users can review grouped photo memories by city, revisit estimated places, and open image collections for each saved memory.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {groups.map((group, index) => (
          <div 
            key={index}
            className="bg-white rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Thumbnail Area */}
            <div className={`h-48 bg-gradient-to-br ${group.gradient} relative flex items-center justify-center`}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-white/80" 
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

            {/* Card Content */}
            <div className="p-8">
              <div className="mb-4">
                <Badge 
                  variant="secondary" 
                  className="px-3 py-1 bg-[#f0faf8] text-[#2d6a5f] border border-[#c5e0d8] rounded-full text-xs mb-3"
                >
                  {group.type}
                </Badge>
                
                {/* Editable Title */}
                <div className="flex items-center gap-2 mb-2">
                  {editingId === group.id ? (
                    <input
                      type="text"
                      defaultValue={group.title}
                      autoFocus
                      onBlur={(e) => handleTitleEdit(group.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTitleEdit(group.id, e.currentTarget.value);
                        } else if (e.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                      className="border border-[#2d6a5f] px-3 py-1.5 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-[#2d6a5f]/20"
                      style={{ color: '#1a1a1a' }}
                    />
                  ) : (
                    <>
                      <h3 className="flex-1" style={{ color: '#1a1a1a' }}>
                        {group.title}
                      </h3>
                      <button
                        onClick={() => setEditingId(group.id)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Rename group"
                      >
                        <Pencil className="w-4 h-4 text-neutral-500" />
                      </button>
                    </>
                  )}
                </div>
                
                <p className="text-neutral-600 text-sm mb-1">
                  {group.city}
                </p>
                <p className="text-neutral-500 text-xs mb-4">
                  {group.lastUpdate}
                </p>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                  {group.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  className="flex-1 min-w-[140px] px-4 py-2 rounded-xl bg-[#2d6a5f] hover:bg-[#1f5045] text-white text-sm"
                  onClick={() => onViewImages(group)}
                >
                  View Images
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 min-w-[140px] px-4 py-2 rounded-xl border-neutral-300 hover:bg-neutral-50 text-sm"
                >
                  Open Guide
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optional hint */}
      <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-8 text-center">
        <p className="text-neutral-600 text-sm leading-relaxed">
          <span className="text-neutral-700">Grouped by city</span> — Each card represents a collection of photos from the same location. Click "View Images" to explore the full set.
        </p>
      </div>
    </>
  );
}