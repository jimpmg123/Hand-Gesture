import React, { useState } from 'react';
import exifr from 'exifr';

interface JournalUploadProps {
  onGenerate: (files: File[]) => void;
}

const checkExifData = async (file: File): Promise<boolean> => {
  try {
    const exifData = await exifr.parse(file, { gps: true, pick: ['DateTimeOriginal'] });
    if (exifData && (exifData.latitude || exifData.DateTimeOriginal)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const JournalUpload: React.FC<JournalUploadProps> = ({ onGenerate }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [missingExifFiles, setMissingExifFiles] = useState<File[]>([]);
  const [showExifModal, setShowExifModal] = useState<boolean>(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);

    if (files.length < 2 || files.length > 20) {
      setErrorMessage('사진은 최소 2장부터 최대 20장까지 업로드할 수 있습니다.');
      setSelectedFiles([]);
      return;
    }

    setErrorMessage('');

    const noExif: File[] = [];
    const hasExif: File[] = [];

    for (const file of files) {
      const isExifExist = await checkExifData(file);
      if (isExifExist) {
        hasExif.push(file);
      } else {
        noExif.push(file);
      }
    }

    if (noExif.length > 0) {
      setMissingExifFiles(noExif);
      setSelectedFiles(hasExif);
      setShowExifModal(true);
    } else {
      setSelectedFiles(files);
      setShowExifModal(false);
    }
  };

  const handleSkipMissingExif = () => {
    setShowExifModal(false);
    if (selectedFiles.length < 2) {
      setErrorMessage('EXIF 없는 사진을 제외하니 최소 조건(2장)을 만족하지 못합니다. 다시 업로드해주세요.');
      setSelectedFiles([]);
    }
  };

  const handleReupload = () => {
    setShowExifModal(false);
    setSelectedFiles([]);
    setErrorMessage('사진을 다시 선택해주세요.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#26215C', marginBottom: '10px' }}>새로운 여행 일지 만들기</h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>당신의 사진을 올리면 AI가 분석하여 타임라인을 만들어줍니다.</p>

      <div style={{ width: '100%', border: '2px dashed #AFA9EC', borderRadius: '12px', padding: '50px 20px', backgroundColor: '#EEEDFE', cursor: 'pointer', position: 'relative', marginBottom: '20px', transition: 'all 0.3s ease' }}>
        <input
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
        />
        <div style={{ pointerEvents: 'none' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>📸</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#534AB7' }}>Select Pictures (2~20장)</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>Drag or Drop Here</div>
        </div>
      </div>

      {errorMessage && <p style={{ color: '#e74c3c', fontWeight: 'bold', marginTop: '10px', fontSize: '14px' }}>{errorMessage}</p>}

      {showExifModal && (
        <div style={{ width: '100%', marginTop: '10px', padding: '20px', backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '12px' }}>
          <p style={{ color: '#C53030', fontWeight: 'bold', marginBottom: '15px', fontSize: '15px' }}>
            메타데이터(위치/시간)가 없는 사진이 {missingExifFiles.length}장 포함되어 있습니다.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleSkipMissingExif} style={{ padding: '10px 16px', backgroundColor: '#CBD5E0', color: '#2D3748', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Skip and Continue
            </button>
            <button onClick={handleReupload} style={{ padding: '10px 16px', backgroundColor: '#E53E3E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Upload Again
            </button>
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && !showExifModal && (
        <div style={{ width: '100%', marginTop: '20px' }}>
          <div style={{ marginBottom: '20px', fontSize: '15px', color: '#333' }}>
            <span>Ready to Upload: </span>
            <strong style={{ color: '#534AB7', fontSize: '18px' }}>{selectedFiles.length}장</strong>
          </div>
          <button
            onClick={() => onGenerate(selectedFiles)}
            style={{ width: '100%', padding: '16px', backgroundColor: '#534AB7', color: 'white', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(83, 74, 183, 0.3)' }}
          >
            Generate Journal
          </button>
        </div>
      )}
    </div>
  );
};