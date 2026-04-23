import React, { useState } from 'react';
import exifr from 'exifr';
import { Images, AlertCircle } from 'lucide-react';

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
    <div className="flex flex-col items-center text-center animate-fadeIn">
      <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-2">Create New Journal</h2>
      <p className="text-gray-500 text-sm md:text-base mb-8">Upload your photos and let AI build your travel timeline.</p>

      <div className="relative w-full border-2 border-dashed border-teal-300 rounded-3xl p-12 md:p-16 bg-gray-50 hover:bg-teal-50/50 transition-all duration-300 cursor-pointer group">
        <input
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="pointer-events-none flex flex-col items-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <Images className="w-10 h-10 text-teal-600" />
          </div>
          <div className="text-lg font-bold text-teal-800 mb-1">Select Pictures (2~20 photos)</div>
          <div className="text-sm text-gray-400">Drag or Drop Here</div>
        </div>
      </div>

      {errorMessage && <p className="text-red-500 font-bold mt-4 text-sm">{errorMessage}</p>}

      {showExifModal && (
        <div className="w-full mt-6 p-5 bg-red-50 border border-red-200 rounded-2xl animate-fadeIn">
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-bold text-sm md:text-base">
              메타데이터(위치/시간)가 없는 사진이 {missingExifFiles.length}장 포함되어 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={handleSkipMissingExif} className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm">
              Skip and Continue
            </button>
            <button onClick={handleReupload} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-sm">
              Upload Again
            </button>
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && !showExifModal && (
        <div className="w-full mt-8 animate-fadeIn">
          <div className="mb-6 text-gray-700 font-medium">
            Ready to Upload: <strong className="text-teal-700 text-xl ml-1">{selectedFiles.length}장</strong>
          </div>
          <button
            onClick={() => onGenerate(selectedFiles)}
            className="w-full bg-[#2d6a5f] text-white rounded-xl px-8 py-4 font-bold transition-all shadow-lg flex items-center justify-center text-lg hover:bg-[#1a3f38] hover:shadow-xl hover:-translate-y-0.5"
          >
            Generate Journal
          </button>
        </div>
      )}
    </div>
  );
};