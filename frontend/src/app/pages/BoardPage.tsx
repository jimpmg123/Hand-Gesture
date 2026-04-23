import { MoreHorizontal, Image as ImageIcon, MapPin, Route, ThumbsUp, MessageCircle, Send } from 'lucide-react';

export function BoardPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-auto flex flex-col animate-fadeIn">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900">Community Board</h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Share analyzed images, detected locations, and travel routes.</p>
        </div>
        <button className="bg-[#2d6a5f] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#1a3f38] transition-colors text-sm md:text-base">
          + Share Result
        </button>
      </div>

      <div className="space-y-8 pb-12">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold mr-3">T</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">TravelHolic</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
          </div>

          <p className="text-gray-800 mb-4 leading-relaxed text-sm md:text-base font-medium">
            Found this amazing hidden gem! I uploaded an old blurry photo from my 2018 trip, and the AI accurately detected the location. Here is the route result! 🍝
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">Analyzed Image</span>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center text-xs font-bold text-teal-600 mb-1 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Detected Location
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Osteria Santo Spirito</h4>
              <p className="text-sm text-gray-500 mb-2">Piazza Santo Spirito, Florence, Italy</p>
              <button className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg flex items-center font-bold hover:bg-gray-100">
                <Route className="w-3.5 h-3.5 mr-1.5" /> View Travel Route
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6 border-t border-gray-100 pt-4 mt-2">
            <button className="flex items-center text-gray-500 hover:text-teal-600 font-medium text-sm transition-colors">
              <ThumbsUp className="w-5 h-5 mr-1.5" /> 128
            </button>
            <button className="flex items-center text-teal-600 font-medium text-sm transition-colors">
              <MessageCircle className="w-5 h-5 mr-1.5 fill-teal-50" /> 3 Comments
            </button>
          </div>

          <div className="mt-4 bg-gray-50 rounded-2xl p-4 space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold mr-3 flex-shrink-0 text-xs">E</div>
              <div>
                <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="font-bold text-xs text-gray-900 mb-0.5">Explorer99</p>
                  <p className="text-sm text-gray-700">The route result is super helpful! I'll add this to my itinerary.</p>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-2 relative">
              <input type="text" placeholder="Write a comment..." className="w-full border border-gray-300 rounded-full pl-5 pr-12 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-teal-600 p-1.5 rounded-full hover:bg-teal-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}