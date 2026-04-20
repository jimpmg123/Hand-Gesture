import React, { useState } from 'react';
import { JournalUpload } from '../components/JournalUpload';
import { JournalResult } from '../components/JournalResult';
import { generateJournalFromAPI } from '../services/journalApi';

export const JournalPage: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'loading' | 'result'>('upload');
  const [analyzedData, setAnalyzedData] = useState<any[]>([]);

  const handleGenerate = async (files: File[]) => {
    setStep('loading');

    try {
      const apiResults = await generateJournalFromAPI(files);
      console.log("🔥 Checking Backend Data:", apiResults);

      const mappedData = apiResults.map((result: any, index: number) => {
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '40px', border: '1px solid #eaeaea' }}>
        {step === 'upload' && <JournalUpload onGenerate={handleGenerate} />}

        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>⏳</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#26215C' }}>AI is working hard!! Be patient...</h3>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>CLIP 모델을 통해 장소와 상황을 인식 중입니다.</p>
          </div>
        )}

        {step === 'result' && <JournalResult data={analyzedData} onDiscard={() => setStep('upload')} />}
      </div>
    </div>
  );
};