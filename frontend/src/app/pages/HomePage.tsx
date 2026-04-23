import { useState } from 'react';
import { UploadCloud, MapPin, Search, X } from 'lucide-react';
import type { PageId } from '../types'

type HomePageProps = {
  isLoggedIn: boolean
  onOpenPage: (page: PageId) => void
}

type UploadType = 'travel' | 'food';

export function HomePage({ onOpenPage }: HomePageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>('travel');

  // TODO: 실제 파일 업로드 및 분석 로직 구현 필요
  const handleAnalyze = () => {
    // 현재는 다음 단계로 넘어가기 위해 search 페이지로 이동시킵니다.
    // 추후 이 곳에서 파일 업로드 상태를 관리하고 분석 페이지로 넘겨줄 수 있습니다.
    onOpenPage('search');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-10 animate-fadeIn">
        <div className="flex justify-center items-center mb-6">
          <span className="font-serif italic text-5xl md:text-6xl text-[#1a5b4f] tracking-tight mr-2">Travel</span>
          <span className="text-xl md:text-2xl text-gray-500 font-light mt-3 md:mt-4">from Photo</span>
        </div>
        <p className="text-gray-500 max-w-xl mx-auto text-base md:text-lg px-4">
          Upload any photo to discover its exact location or find similar food spots.
        </p>
      </div>

      <div
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`relative w-full bg-white border border-gray-200 rounded-3xl transition-all duration-500 ease-in-out shadow-sm ${isExpanded ? 'p-6 md:p-8 ring-2 ring-teal-600 shadow-xl scale-[1.02]' : 'p-5 md:p-6 hover:shadow-lg hover:border-teal-300 cursor-pointer'
          }`}
      >
        {isExpanded && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
            className="absolute top-4 right-4 md:top-5 md:right-5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-500 bg-gray-50 hover:bg-teal-50/50 ${isExpanded ? 'border-teal-300 p-8 md:p-10 mb-8' : 'border-gray-300 p-10 md:p-12'
          }`}>
          <UploadCloud className={`mb-4 transition-colors ${isExpanded ? 'w-16 h-16 text-teal-600' : 'w-12 h-12 text-gray-400'}`} />
          <p className={`font-medium ${isExpanded ? 'text-teal-800 text-lg md:text-xl' : 'text-gray-600 text-base md:text-lg'}`}>
            Drop your photo here
          </p>
          <p className="text-xs md:text-sm text-gray-400 mt-2">or click to browse from your device</p>
        </div>

        {isExpanded && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3 text-center">What kind of photo is this?</label>
              <div className="flex bg-gray-100 p-1.5 rounded-xl max-w-md mx-auto">
                <button onClick={(e) => { e.stopPropagation(); setUploadType('travel'); }} className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-lg transition-all ${uploadType === 'travel' ? 'bg-white text-[#2d6a5f] shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                  <MapPin className="w-4 h-4 mr-2" /> Travel
                </button>
                <button onClick={(e) => { e.stopPropagation(); setUploadType('food'); }} className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-lg transition-all ${uploadType === 'food' ? 'bg-white text-[#2d6a5f] shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Search className="w-4 h-4 mr-2" /> Food
                </button>
              </div>
            </div>

            <div className="mb-8 max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                {uploadType === 'travel' ? 'Optional hint (city, region, or landmark)' : 'Optional hint (Italian, street food, etc.)'}
              </label>
              <input type="text" placeholder={uploadType === 'travel' ? "e.g., Paris, Swiss Alps..." : "e.g., Authentic Carbonara, Ramen..."} className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all text-gray-700 bg-gray-50 focus:bg-white" onClick={(e) => e.stopPropagation()} />
            </div>

            <div className="flex justify-center">
              <button onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} className="w-full md:w-auto bg-[#2d6a5f] text-white rounded-xl px-12 py-4 font-bold hover:bg-[#1a3f38] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center text-lg">
                <Search className="w-5 h-5 mr-3" />
                {uploadType === 'travel' ? 'Analyze Location' : 'Discover Restaurants'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
