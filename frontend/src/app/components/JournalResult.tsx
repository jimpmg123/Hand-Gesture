import React, { useState } from 'react';
import { MapPin, Clock, Edit3, ArrowLeft, Globe, Lock, X } from 'lucide-react';

interface TimelineItem {
  id: string;
  imageUrl: string;
  timestamp: string;
  city: string;
  place: string;
  action: string;
  people_count: string;
  text?: string;
}

interface JournalResultProps {
  data: TimelineItem[];
  onDiscard: () => void;
}

// 사진들 사이의 이동 시간 계산을 위한 헬퍼 함수
const calculateTransit = (prevTime: string, currTime: string) => {
  try {
    // 백엔드에서 내려주는 "YYYY. MM. DD. HH:mm" 형태를 파싱
    const pMatch = prevTime.match(/(\d{4})\D+(\d{2})\D+(\d{2})\D+(\d{2}):(\d{2})/);
    const cMatch = currTime.match(/(\d{4})\D+(\d{2})\D+(\d{2})\D+(\d{2}):(\d{2})/);
    if (pMatch && cMatch) {
      const pDate = new Date(Number(pMatch[1]), Number(pMatch[2]) - 1, Number(pMatch[3]), Number(pMatch[4]), Number(pMatch[5]));
      const cDate = new Date(Number(cMatch[1]), Number(cMatch[2]) - 1, Number(cMatch[3]), Number(cMatch[4]), Number(cMatch[5]));
      const diffMins = Math.round((cDate.getTime() - pDate.getTime()) / 60000);
      if (diffMins > 0) {
        if (diffMins >= 1440) return `${Math.floor(diffMins / 1440)}d ${Math.floor((diffMins % 1440) / 60)}h later`;
        if (diffMins >= 60) return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m later`;
        return `${diffMins}m later`;
      }
    }
  } catch (e) { }
  return null;
};

export const JournalResult: React.FC<JournalResultProps> = ({ data, onDiscard }) => {
  // 초기 데이터에 AI 텍스트 기본값을 채워넣습니다.
  const [items, setItems] = useState<TimelineItem[]>(
    data.map(item => ({
      ...item,
      text: `A travel photo at a ${item.place || 'location'} showing ${item.action || 'a scene'} with ${item.people_count || 'people'}.`
    }))
  );
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const handleRemoveTag = (id: string, tagType: 'place' | 'action' | 'people_count') => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [tagType]: '' } : item
    ));
  };

  const handleTextChange = (id: string, newText: string) => {
    setItems(items.map(item => item.id === id ? { ...item, text: newText } : item));
  };

  const handleSave = () => {
    alert(`Journal Status: ${isPublic ? 'Public' : 'Private'}`);
  };

  return (
    <div className="flex flex-col w-full animate-fadeIn">
      {/* 헤더 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-200 gap-4">
        <div>
          <button onClick={onDiscard} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" />
            Back to Upload
          </button>
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-3">Your Travel Journal</h2>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`flex w-fit items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${isPublic ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
          >
            {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isPublic ? 'Public' : 'Private'}
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={onDiscard} className="px-5 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors shadow-sm">
            버리기
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 bg-[#2d6a5f] text-white rounded-xl font-bold text-sm hover:bg-[#1a3f38] transition-all shadow-md hover:shadow-lg">
            저장하기
          </button>
        </div>
      </div>

      {/* 타임라인 영역 */}
      <div className="relative py-4">
        <div className="absolute left-[15px] md:left-[23px] top-6 bottom-16 w-0.5 bg-teal-200"></div>

        <div className="space-y-12">
          {items.map((item, index) => {
            const transitTimeStr = index > 0 ? calculateTransit(items[index - 1].timestamp, item.timestamp) : null;

            return (
              <div key={item.id} className="relative pl-12 md:pl-16">

                {transitTimeStr && (
                  <div className="absolute top-[-26px] left-[15px] md:left-[24px] bg-white text-teal-600 text-[11px] font-bold px-3 py-1 rounded-full border border-teal-200 flex items-center shadow-sm z-10 -translate-x-1/2 whitespace-nowrap">
                    <Clock className="w-3 h-3 mr-1.5" />
                    {transitTimeStr}
                  </div>
                )}

                <div className="absolute left-[15px] md:left-[24px] top-6 w-4 h-4 rounded-full bg-teal-500 border-[3px] border-white shadow-sm z-10 -translate-x-1/2"></div>

                <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-5 mb-4">
                    <img src={item.imageUrl} alt="Journal memory" className="w-full sm:w-48 h-32 object-cover rounded-2xl shadow-sm flex-shrink-0" />
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">{item.timestamp}</p>
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-1.5 mb-3">
                        <MapPin className="w-4 h-4 text-teal-600" />
                        {item.city}
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {item.place && (
                          <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-teal-100 flex items-center gap-1 group/tag">
                            📍 {item.place}
                            <button onClick={() => handleRemoveTag(item.id, 'place')} className="opacity-0 group-hover/tag:opacity-100 hover:text-teal-900 transition-opacity"><X className="w-3 h-3" /></button>
                          </span>
                        )}
                        {item.action && (
                          <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-teal-100 flex items-center gap-1 group/tag">
                            🏃 {item.action}
                            <button onClick={() => handleRemoveTag(item.id, 'action')} className="opacity-0 group-hover/tag:opacity-100 hover:text-teal-900 transition-opacity"><X className="w-3 h-3" /></button>
                          </span>
                        )}
                        {item.people_count && (
                          <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-teal-100 flex items-center gap-1 group/tag">
                            👥 {item.people_count}
                            <button onClick={() => handleRemoveTag(item.id, 'people_count')} className="opacity-0 group-hover/tag:opacity-100 hover:text-teal-900 transition-opacity"><X className="w-3 h-3" /></button>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <textarea
                      className="w-full text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl p-4 pr-10 resize-none outline-none focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium leading-relaxed"
                      value={item.text}
                      onChange={(e) => handleTextChange(item.id, e.target.value)}
                      rows={2}
                    />
                    <Edit3 className="absolute top-4 right-4 w-4 h-4 text-gray-400 group-hover:text-teal-600 pointer-events-none transition-colors" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};