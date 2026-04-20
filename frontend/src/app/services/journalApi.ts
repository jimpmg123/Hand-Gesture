export const generateJournalFromAPI = async (files: File[]) => {
  // 여러 장의 사진을 1장씩 개별 포장해서 백엔드로 보낼 준비를 합니다.
  const promises = files.map(async (file) => {
    const formData = new FormData();

    formData.append('file', file);

    const response = await fetch('http://localhost:8000/api/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`사진 분석 실패: ${file.name}`);
    }

    return await response.json();
  });

  return await Promise.all(promises);
};