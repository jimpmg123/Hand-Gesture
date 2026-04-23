import React, { useState } from 'react';
import { JournalUpload } from '../components/JournalUpload';
import { JournalResult } from '../components/JournalResult';
import { generateJournalFromAPI } from '../services/journalApi';
import { BookText } from 'lucide-react';

interface ApiResult {
  file_name?: string;
  captured_at?: string;
  city?: string;
  summary?: {
    place?: string;
    action?: string;
    people_count?: string;
  };
}

interface TimelineItem {
  id: string;
  imageUrl: string;
  timestamp: string;
  city: string;
  place: string;
  action: string;
  people_count: string;
}

export const JournalPage: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'loading' | 'result'>('upload');
  const [analyzedData, setAnalyzedData] = useState<TimelineItem[]>([]);

  const handleGenerate = async (files: File[]) => {
    setStep('loading');

    try {
      const apiResults = await generateJournalFromAPI(files);
      console.log("🔥 Checking Backend Data:", apiResults);

      const mappedData = (apiResults as ApiResult[]).map((result, index: number) => {
        const rawDate = result.captured_at;
        const formattedDate = rawDate
          ? rawDate.replace(/-/g, '. ').slice(0, 17)
          : new Date().toLocaleString();

        return {
          id: result.file_name || `id-${index}`,
          imageUrl: URL.createObjectURL(files[index]),
          timestamp: formattedDate,
          city: result.city || "위치 정보 확인 중",

          place: result?.summary?.place || "장소 분석 실패",
          action: result?.summary?.action || "행동 분석 실패",
          people_count: result?.summary?.people_count || "인원 분석 실패",
        };
      });

      setAnalyzedData(mappedData);
      setStep('result');
    } catch (error) {
      console.error(error);
      alert('Error Occurs');
      setStep('upload');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 w-full animate-fadeIn">

      {step === 'upload' && (
        <>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-gray-900">My Journal</h2>
              <p className="text-gray-500 mt-2 text-sm md:text-base">Upload your photos and let AI build your travel timeline.</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm">
            <JournalUpload onGenerate={handleGenerate} />
          </div>
        </>
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center h-[75vh] animate-fadeIn">
          <div className="relative w-40 h-40 mb-10">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full shadow-inner m-2">
              <BookText className="w-12 h-12 text-teal-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-4 text-center">Crafting your journal...</h2>
          <p className="text-gray-500 text-base md:text-lg text-center px-4 max-w-md">
            AI is analyzing your photos, extracting contextual keywords, and mapping out your travel timeline.
          </p>
        </div>
      )}

      {step === 'result' && <JournalResult data={analyzedData} onDiscard={() => setStep('upload')} />}
    </div>
  );
};