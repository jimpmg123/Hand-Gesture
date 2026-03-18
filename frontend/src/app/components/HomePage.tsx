import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Upload, MapPin, Route, UtensilsCrossed } from "lucide-react";
import { SharedHeroCard } from "./SharedHeroCard";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <>
      {/* Shared Hero Card */}
      <SharedHeroCard activePage="home" onNavigate={onNavigate} />

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

      {/* Main Content Area - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Left Feature Card - Takes 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 p-10 shadow-sm">
          <div className="mb-6">
            <p className="tracking-[0.2em] text-[10px] uppercase text-neutral-500 mb-6">
              HOME
            </p>
            <h2 
              className="mb-6 text-2xl md:text-3xl lg:text-4xl"
              style={{
                fontFamily: 'serif',
                fontWeight: 400,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
                color: '#1a1a1a'
              }}
            >
              Find where a photo was taken, then extend the same trip memory into restaurant guidance when the photo is the food.
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              Travel photos are resolved using EXIF metadata, landmark clues, and user hints to identify locations. 
              Food photos branch into cuisine recognition, location hints, recent uploads, and personalized restaurant 
              recommendations—creating a complete memory journey from a single image.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button 
              className="px-6 py-3 rounded-xl bg-[#2d6a5f] hover:bg-[#1f5045] text-white shadow-md"
            >
              Open Search Workspace
            </Button>
            <Button 
              variant="outline" 
              className="px-6 py-3 rounded-xl border-neutral-300 hover:bg-neutral-50"
            >
              View My Gallery
            </Button>
          </div>
        </div>

        {/* Right Scope/Status Card - Takes 1/3 width */}
        <div className="bg-neutral-50 rounded-3xl border border-neutral-200 p-8 shadow-sm">
          <h3 className="mb-4" style={{ color: '#1a1a1a' }}>
            Current scope
          </h3>
          <p className="text-neutral-600 text-sm leading-relaxed mb-6">
            This frontend is organized around assignment constraints and currently supported features.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge 
              variant="secondary" 
              className="px-3 py-1.5 bg-white text-neutral-700 border border-neutral-200 rounded-full"
            >
              Responsive layout
            </Badge>
            <Badge 
              variant="secondary" 
              className="px-3 py-1.5 bg-white text-neutral-700 border border-neutral-200 rounded-full"
            >
              Media upload flow
            </Badge>
            <Badge 
              variant="secondary" 
              className="px-3 py-1.5 bg-white text-neutral-700 border border-neutral-200 rounded-full"
            >
              Login-gated gallery
            </Badge>
          </div>

          <ul className="space-y-3 mb-6 text-sm">
            <li className="text-neutral-700 leading-relaxed flex items-start">
              <span className="mr-2 text-[#2d6a5f] mt-0.5">•</span>
              <span>Travel photo search with EXIF, landmark, and hint-based place estimation</span>
            </li>
            <li className="text-neutral-700 leading-relaxed flex items-start">
              <span className="mr-2 text-[#2d6a5f] mt-0.5">•</span>
              <span>Food photo search with cuisine detection and restaurant recommendation framing</span>
            </li>
            <li className="text-neutral-700 leading-relaxed flex items-start">
              <span className="mr-2 text-[#2d6a5f] mt-0.5">•</span>
              <span>Mock authenticated view for private uploads and profile-only history</span>
            </li>
            <li className="text-neutral-700 leading-relaxed flex items-start">
              <span className="mr-2 text-[#2d6a5f] mt-0.5">•</span>
              <span>Live chat marked as backlog, not part of this first frontend delivery</span>
            </li>
          </ul>

          <div className="bg-[#e8f3f1] rounded-2xl p-6 border border-[#c5e0d8]">
            <p className="mb-2" style={{ color: '#2d6a5f' }}>
              Gallery access
            </p>
            <p className="text-sm text-[#2d6a5f]/80">
              Unlocked for the current mock user.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Main Journey */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="mb-3" style={{ color: '#1a1a1a' }}>
            Main journey
          </h4>
          <p 
            className="mb-4"
            style={{
              fontFamily: 'serif',
              fontSize: '1.25rem',
              color: '#2d6a5f',
              lineHeight: 1.3
            }}
          >
            Photo → place → route
          </p>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Upload a travel photo to identify the location using visual clues, EXIF data, and landmark recognition, then explore routes and nearby attractions.
          </p>
        </div>

        {/* Card 2: Food Extension */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="mb-3" style={{ color: '#1a1a1a' }}>
            Food extension
          </h4>
          <p 
            className="mb-4"
            style={{
              fontFamily: 'serif',
              fontSize: '1.25rem',
              color: '#2d6a5f',
              lineHeight: 1.3
            }}
          >
            Meal → cuisine → restaurant
          </p>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Detect cuisine type from food photos, match regional context, and receive personalized restaurant recommendations based on your taste profile.
          </p>
        </div>

        {/* Card 3: Required Access */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="mb-3" style={{ color: '#1a1a1a' }}>
            Required access
          </h4>
          <p 
            className="mb-4"
            style={{
              fontFamily: 'serif',
              fontSize: '1.25rem',
              color: '#2d6a5f',
              lineHeight: 1.3
            }}
          >
            Mock sign-in ready
          </p>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Gallery and profile features require authentication. Mock sign-in demonstrates the access-gated experience for personal uploads and history.
          </p>
        </div>

        {/* Card 4: Course Fit */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="mb-3" style={{ color: '#1a1a1a' }}>
            Course fit
          </h4>
          <p 
            className="mb-4"
            style={{
              fontFamily: 'serif',
              fontSize: '1.25rem',
              color: '#2d6a5f',
              lineHeight: 1.3
            }}
          >
            Responsive + media-based
          </p>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Built for desktop and mobile experiences with media upload workflows, demonstrating modern responsive patterns and assignment requirements.
          </p>
        </div>
      </div>
    </>
  );
}