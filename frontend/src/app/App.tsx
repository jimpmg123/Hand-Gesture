import { useState } from "react";
import { HomePage } from "./components/HomePage";
import { ProfilePage } from "./components/ProfilePage";
import { GalleryPage } from "./components/GalleryPage";
import { SearchPage } from "./components/SearchPage";
import { ImagesPage } from "./components/ImagesPage";

type PageType =
  | "home"
  | "search"
  | "gallery"
  | "profile"
  | "images";

export default function App() {
  const [currentPage, setCurrentPage] =
    useState<PageType>("home");
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  const handleViewImages = (group: any) => {
    setSelectedGroup(group);
    setCurrentPage("images");
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] relative overflow-hidden">
      {/* Faint world map background decoration */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Cpath d='M200,150 L250,140 L280,160 L320,155 L350,170 L380,165 M400,180 L450,175 L480,190 L520,185 M150,200 L180,195 L210,210 L240,205 M300,220 L350,215 L380,230 L420,225 M500,250 L550,245 L580,260 L620,255 M100,280 L150,275 L180,290 L220,285 M700,200 L750,195 L780,210 L820,205 M850,180 L900,175 L930,190 L970,185 M600,300 L650,295 L680,310 L720,305 M250,350 L300,345 L330,360 L370,355 M450,380 L500,375 L530,390 L570,385' fill='none' stroke='%23000000' stroke-width='1' opacity='0.5'/%3E%3Ccircle cx='300' cy='200' r='3' fill='%23000000' opacity='0.3'/%3E%3Ccircle cx='500' cy='250' r='3' fill='%23000000' opacity='0.3'/%3E%3Ccircle cx='700' cy='220' r='3' fill='%23000000' opacity='0.3'/%3E%3Ccircle cx='900' cy='180' r='3' fill='%23000000' opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* Render current page */}
        {currentPage === "home" && (
          <HomePage onNavigate={handleNavigate} />
        )}
        {currentPage === "search" && (
          <SearchPage onNavigate={handleNavigate} />
        )}
        {currentPage === "gallery" && (
          <GalleryPage
            onNavigate={handleNavigate}
            onViewImages={handleViewImages}
          />
        )}
        {currentPage === "profile" && (
          <ProfilePage onNavigate={handleNavigate} />
        )}
        {currentPage === "images" && selectedGroup && (
          <ImagesPage
            onNavigate={handleNavigate}
            groupTitle={selectedGroup.title}
            groupCity={selectedGroup.city}
            groupType={selectedGroup.type}
          />
        )}
      </div>
    </div>
  );
}