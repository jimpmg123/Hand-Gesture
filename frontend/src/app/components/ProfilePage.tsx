import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { User, Settings, Activity } from "lucide-react";
import { SharedHeroCard } from "./SharedHeroCard";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  return (
    <>
      {/* Shared Hero Card */}
      <SharedHeroCard activePage="profile" onNavigate={onNavigate} />

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

      {/* Profile Section Header */}
      <div className="mb-10">
        <p className="tracking-[0.2em] text-[10px] uppercase text-neutral-500 mb-6">
          PROFILE
        </p>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <h2 
            className="flex-1 min-w-[250px] text-2xl md:text-3xl lg:text-4xl"
            style={{
              fontFamily: 'serif',
              fontWeight: 400,
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              color: '#1a1a1a'
            }}
          >
            Account and saved context
          </h2>
          <p className="text-neutral-600 text-sm max-w-md leading-relaxed">
            This page reserves space for login status, preferences, private history controls, and an admin view if needed.
          </p>
        </div>
      </div>

      {/* Two-Column Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Left Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-neutral-200 p-10 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-6">
              <AvatarFallback 
                className="bg-[#2d6a5f] text-white"
                style={{ fontSize: '1.75rem' }}
              >
                JH
              </AvatarFallback>
            </Avatar>
            <h3 className="mb-3" style={{ color: '#1a1a1a' }}>
              Jinu Hong
            </h3>
            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
              Signed in with a mock secure session.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge 
                variant="secondary" 
                className="px-3 py-1.5 bg-[#f0faf8] text-[#2d6a5f] border border-[#c5e0d8] rounded-full"
              >
                Traveler view
              </Badge>
              <Badge 
                variant="secondary" 
                className="px-3 py-1.5 bg-[#f0faf8] text-[#2d6a5f] border border-[#c5e0d8] rounded-full"
              >
                Gallery enabled
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Preferences Stack */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-6">
            <h3 className="mb-3" style={{ color: '#1a1a1a' }}>
              Saved preferences
            </h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Inputs here can later personalize search defaults and routing behavior.
            </p>
          </div>

          {/* Saved Hints Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-8 shadow-sm">
            <h4 className="mb-3" style={{ color: '#1a1a1a' }}>
              Saved hints
            </h4>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Preferred countries, cities, and transport modes can prefill future searches.
            </p>
          </div>

          {/* Privacy Controls Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-8 shadow-sm">
            <h4 className="mb-3" style={{ color: '#1a1a1a' }}>
              Privacy controls
            </h4>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Photo history and extracted EXIF data should be visible only to the signed-in owner.
            </p>
          </div>

          {/* Beta Delivery Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-8 shadow-sm">
            <h4 className="mb-3" style={{ color: '#1a1a1a' }}>
              Beta delivery
            </h4>
            <p className="text-neutral-600 text-sm leading-relaxed">
              This layout keeps deployment and login entry points visible from the start.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Snapshot */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-10 shadow-sm mb-12">
        <h3 className="mb-3" style={{ color: '#1a1a1a' }}>
          Recent activity snapshot
        </h3>
        <p className="text-neutral-600 text-sm leading-relaxed mb-8">
          A simple summary area for uploads, saved places, and restaurant lookups.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Uploads Summary */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-8">
            <h4 className="mb-2" style={{ color: '#1a1a1a' }}>
              Uploads
            </h4>
            <p 
              className="mb-4"
              style={{
                fontFamily: 'serif',
                fontSize: '1.5rem',
                color: '#2d6a5f',
                lineHeight: 1.3
              }}
            >
              4 recent photos
            </p>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Landmark and food memories are mixed into the same personal timeline.
            </p>
          </div>

          {/* Saved Routes Summary */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-8">
            <h4 className="mb-2" style={{ color: '#1a1a1a' }}>
              Saved routes
            </h4>
            <p 
              className="mb-4"
              style={{
                fontFamily: 'serif',
                fontSize: '1.5rem',
                color: '#2d6a5f',
                lineHeight: 1.3
              }}
            >
              2 draft guides
            </p>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Reserved for future directions and shareable itineraries.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}