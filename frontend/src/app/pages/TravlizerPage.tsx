import React, { useState } from 'react';
import {
  Wand2, ChevronRight, Calendar, Clock, MapPin, UploadCloud, X,
  AlertCircle, Plus, Save, Image as ImageIcon,
} from 'lucide-react';

interface FormData {
  duration: number;
  startDate: string;
  wakeUpTime: string;
  departureTime: string;
  destination: string;
}

interface UploadedImage {
  id: number;
  url: string;
}

interface AnalyzedImage extends UploadedImage {
  placeName: string;
  address: string;
  method: string;
  status: 'success' | 'failed';
}

interface ItineraryItem {
  id: string;
  imageId: number;
  imageUrl: string;
  placeName: string;
  date: string;
  time: string;
  note: string;
}

interface DayPlan {
  day: number;
  items: ItineraryItem[];
}

const STEPS = ['Setting', 'Upload Image', 'Result', 'Edit Plan'] as const;

const MOCK_URLS = [
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543429776-27826dddefce?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516483638261-f40af5bea098?auto=format&fit=crop&w=800&q=80',
];

export function TravlizerPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    duration: 3,
    startDate: '',
    wakeUpTime: '08:00',
    departureTime: '10:00',
    destination: '',
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [analyzedImages, setAnalyzedImages] = useState<AnalyzedImage[]>([]);
  const [activeTab, setActiveTab] = useState('places');
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMockUpload = () => {
    if (images.length >= 30) { alert('Max: 30 Images.'); return; }
    setImages(prev => [...prev, { id: Date.now(), url: MOCK_URLS[prev.length % MOCK_URLS.length] }]);
  };

  const removeImage = (id: number) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const proceedToAnalysis = () => {
    const results: AnalyzedImage[] = images.map((img, idx) => {
      const methods = ['EXIF', 'Landmark Detection', 'OpenAI', 'Failed'];
      const method = methods[idx % 4];
      const failed = idx % 4 === 3;
      return {
        ...img,
        placeName: failed ? '위치 확인 불가' : `Analyzed Spot ${idx + 1}`,
        address: failed ? 'Not Found' : 'Japan, Osaka',
        method,
        status: failed ? 'failed' : 'success',
      };
    });
    setAnalyzedImages(results);
    setStep(3);
  };

  const proceedToItinerary = () => {
    const successful = analyzedImages.filter(img => img.status === 'success');
    const mockDays: DayPlan[] = Array.from({ length: formData.duration }, (_, dayIdx) => ({
      day: dayIdx + 1,
      items: successful.map((img, itemIdx) => ({
        id: `d${dayIdx}-i${itemIdx}`,
        imageId: img.id,
        imageUrl: img.url,
        placeName: img.placeName,
        date: `2024-05-0${dayIdx + 1}`,
        time: `${10 + itemIdx}:00`,
        note: itemIdx === 0 ? 'Transit' : 'Tour',
      })),
    }));
    setItinerary(mockDays);
    setActiveTab('day1');
    setStep(4);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-[80vh] animate-fadeIn">

      {/* 헤더 & 진행 단계 표시 */}
      <div className="mb-10 text-center">
        <div className="flex justify-center items-center mb-4">
          <Wand2 className="w-10 h-10 text-[#1a5b4f] mr-3" />
          <span className="font-serif text-4xl md:text-5xl text-[#1a5b4f] tracking-tight">Travelize</span>
        </div>
        <div className="flex items-center justify-center space-x-2 md:space-x-4 text-sm font-medium text-gray-400">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <span className={step >= i + 1 ? 'text-teal-600' : ''}>{i + 1}. {label}</span>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="w-full bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm">

        {/* STEP 1: 기본 정보 입력 */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Enter basic information of trip</h2>
              <p className="text-gray-500 mt-2">Based on your information, generate travel plan</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-teal-600" /> Duration of trip
                </label>
                <input type="number" name="duration" min="1" max="5" value={formData.duration} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-gray-50 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-teal-600" /> Start Date
                </label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-gray-50 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-teal-600" /> Wake up at
                </label>
                <input type="time" name="wakeUpTime" value={formData.wakeUpTime} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-gray-50 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-teal-600" /> Estimated Time of Departure
                </label>
                <input type="time" name="departureTime" value={formData.departureTime} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-gray-50 focus:bg-white transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-teal-600" /> Destination (Country or City, Optional)
                </label>
                <input type="text" name="destination" placeholder="Ex: Japan, Osaka, Kyoto" value={formData.destination} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-gray-50 focus:bg-white transition-all" />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button onClick={() => setStep(2)}
                className="bg-[#2d6a5f] text-white rounded-xl px-12 py-4 font-bold hover:bg-[#1a3f38] transition-all shadow-md flex items-center">
                Next: Upload Image <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 이미지 업로드 */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upload Images</h2>
              <span className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">{images.length} / 30</span>
            </div>

            <div onClick={handleMockUpload}
              className="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-teal-50/50 border-teal-300 p-8 md:p-12 mb-8 transition-colors cursor-pointer group">
              <UploadCloud className="w-14 h-14 text-teal-600 mb-4 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-teal-800 text-lg md:text-xl">Upload Images or Load from Gallery</p>
              <p className="text-xs md:text-sm text-gray-400 mt-2">Max: 30 Images</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {images.map((img) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 shadow-sm">
                    <img src={img.url} alt="upload" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button onClick={() => setStep(1)}
                className="text-gray-500 font-bold px-6 py-3 hover:bg-gray-50 rounded-xl transition-colors">Back</button>
              <button onClick={proceedToAnalysis} disabled={images.length === 0}
                className="bg-[#2d6a5f] text-white rounded-xl px-10 py-3.5 font-bold hover:bg-[#1a3f38] transition-all shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center">
                <MapPin className="w-5 h-5 mr-2" /> Analyzing Location
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: 분석 결과 */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Result of Location Analyzing</h2>
              <p className="text-gray-500 mt-2 text-sm">Images that failed extraction or region validation are excluded from schedule generation.</p>
            </div>

            <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-2">
              {analyzedImages.map((img) => (
                <div key={img.id}
                  className={`flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border ${img.status === 'success' ? 'border-gray-200 bg-white' : 'border-red-200 bg-red-50'}`}>
                  <img src={img.url} alt="analyzed" className="w-full sm:w-24 h-24 object-cover rounded-xl shadow-sm flex-shrink-0" />
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900">{img.placeName}</h4>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${img.status === 'success' ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {img.status === 'success' ? 'Include' : 'Excluded'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5" /> {img.address}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">Method: {img.method}</span>
                      {img.status === 'failed' && (
                        <span className="text-red-500 flex items-center font-bold">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" /> Fail to analyze
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button onClick={() => setStep(2)}
                className="text-gray-500 font-bold px-6 py-3 hover:bg-gray-50 rounded-xl transition-colors">Back</button>
              <button onClick={proceedToItinerary}
                className="bg-[#2d6a5f] text-white rounded-xl px-10 py-3.5 font-bold hover:bg-[#1a3f38] transition-all shadow-md flex items-center">
                <Wand2 className="w-5 h-5 mr-2" /> Generate AI Trip Diary
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: 일정 편집기 */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                {formData.destination || 'My Trip'} Timeline
              </h2>
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                {analyzedImages.filter(img => img.status === 'success').map((img) => (
                  <img key={img.id} src={img.url} alt="timeline"
                    className="w-32 h-24 object-cover rounded-xl shadow-sm snap-start flex-shrink-0 border border-gray-200" />
                ))}
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('places')}
                className={`px-6 py-3.5 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'places' ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Place to visit
              </button>
              {itinerary.map((dayPlan) => (
                <button
                  key={dayPlan.day}
                  onClick={() => setActiveTab(`day${dayPlan.day}`)}
                  className={`px-6 py-3.5 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === `day${dayPlan.day}` ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Day {dayPlan.day}
                </button>
              ))}
            </div>

            {/* 탭 컨텐츠: 방문 장소 목록 */}
            {activeTab === 'places' && (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-sm border-b border-gray-200">
                      <th className="py-3.5 px-5 font-bold">Location</th>
                      <th className="py-3.5 px-5 font-bold">City</th>
                      <th className="py-3.5 px-5 font-bold">Date (planned)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyzedImages.filter(img => img.status === 'success').map((img, idx) => (
                      <tr key={idx} className="border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-5 font-medium text-gray-900">{img.placeName}</td>
                        <td className="py-4 px-5 text-gray-600 text-sm">{formData.destination || 'TBD'}</td>
                        <td className="py-4 px-5 text-gray-600 text-sm">TBC</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 탭 컨텐츠: 일별 일정 (편집 가능) */}
            {activeTab.startsWith('day') && (() => {
              const dayData = itinerary.find(d => `day${d.day}` === activeTab);
              if (!dayData) return null;
              return (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                        <th className="py-3 px-4 font-bold w-16 text-center">Image</th>
                        <th className="py-3 px-4 font-bold">Location</th>
                        <th className="py-3 px-4 font-bold w-32">Date</th>
                        <th className="py-3 px-4 font-bold w-28">Time</th>
                        <th className="py-3 px-4 font-bold">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayData.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-teal-50/20 transition-colors">
                          <td className="py-3 px-4 text-center">
                            {item.imageUrl ? (
                              <button
                                onClick={() => setSelectedImageModal(item.imageUrl)}
                                className="p-2 bg-gray-100 hover:bg-teal-100 text-gray-500 hover:text-teal-600 rounded-lg transition-colors inline-flex">
                                <ImageIcon className="w-5 h-5" />
                              </button>
                            ) : (
                              <button className="p-2 bg-gray-50 hover:bg-gray-200 text-gray-400 rounded-lg border border-dashed border-gray-300 transition-colors inline-flex">
                                <Plus className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <input type="text" defaultValue={item.placeName}
                              className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-teal-500/20 rounded p-1 font-medium text-gray-800" />
                          </td>
                          <td className="py-3 px-4">
                            <input type="date" defaultValue={item.date}
                              className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-teal-500/20 rounded p-1 text-sm text-gray-600" />
                          </td>
                          <td className="py-3 px-4">
                            <input type="time" defaultValue={item.time}
                              className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-teal-500/20 rounded p-1 text-sm text-gray-600" />
                          </td>
                          <td className="py-3 px-4">
                            <input type="text" defaultValue={item.note} placeholder="Accommodation, Transit"
                              className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-teal-500/20 rounded p-1 text-sm text-gray-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            <div className="flex justify-between items-center mt-10">
              <p className="text-sm text-gray-500 font-medium">Changes will automatically overwrite the draft.</p>
              <button className="bg-[#2d6a5f] text-white rounded-xl px-10 py-3.5 font-bold hover:bg-[#1a3f38] transition-all shadow-md flex items-center">
                <Save className="w-5 h-5 mr-2" /> Save Final Diary
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 이미지 확대 모달 */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full">
            <button onClick={() => setSelectedImageModal(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2">
              <X className="w-8 h-8" />
            </button>
            <img src={selectedImageModal} alt="Enlarged view"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
