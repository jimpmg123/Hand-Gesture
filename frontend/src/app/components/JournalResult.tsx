import React, { useState } from 'react';

interface TimelineItem {
  id: string;
  imageUrl: string;
  timestamp: string;
  city: string;
  place: string;
  action: string;
  people_count: string;
}

interface JournalResultProps {
  data: TimelineItem[];
  onDiscard: () => void;
}

export const JournalResult: React.FC<JournalResultProps> = ({ data, onDiscard }) => {
  const [items, setItems] = useState<TimelineItem[]>(data);
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const handleRemoveTag = (id: string, tagType: 'place' | 'action' | 'people_count') => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [tagType]: '' } : item
    ));
  };

  const handleSave = () => {
    alert(`Journal Status: ${isPublic ? 'Public' : 'Private'}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eaeaea' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#26215C', marginBottom: '12px' }}>생성된 여행 일지</h2>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#555', fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: '#534AB7' }}
            />
            {isPublic ? '🌐 Public' : '🔒 Private'}
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onDiscard} style={{ padding: '10px 20px', backgroundColor: '#f1f3f5', color: '#495057', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            버리기
          </button>
          <button onClick={handleSave} style={{ padding: '10px 20px', backgroundColor: '#0F6E56', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            저장하기
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '20px', border: '1px solid #E1F5EE', borderRadius: '12px', backgroundColor: '#fafafa', marginBottom: '20px' }}>
            <img src={item.imageUrl} alt="timeline" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px' }} />

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#534AB7', fontWeight: 'bold' }}>📍 {item.city}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>{item.timestamp}</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {item.place && (
                  <span style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', backgroundColor: '#EEEDFE', color: '#534AB7', fontSize: '12px', borderRadius: '20px', fontWeight: 'bold' }}>
                    📍 {item.place}
                    <button onClick={() => handleRemoveTag(item.id, 'place')} style={{ background: 'none', border: 'none', color: '#534AB7', marginLeft: '6px', cursor: 'pointer' }}>✕</button>
                  </span>
                )}
                {item.action && (
                  <span style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', backgroundColor: '#E1F5EE', color: '#0F6E56', fontSize: '12px', borderRadius: '20px', fontWeight: 'bold' }}>
                    🏃 {item.action}
                    <button onClick={() => handleRemoveTag(item.id, 'action')} style={{ background: 'none', border: 'none', color: '#0F6E56', marginLeft: '6px', cursor: 'pointer' }}>✕</button>
                  </span>
                )}
                {item.people_count && (
                  <span style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', backgroundColor: '#EAF3DE', color: '#3B6D11', fontSize: '12px', borderRadius: '20px', fontWeight: 'bold' }}>
                    👥 {item.people_count}
                    <button onClick={() => handleRemoveTag(item.id, 'people_count')} style={{ background: 'none', border: 'none', color: '#3B6D11', marginLeft: '6px', cursor: 'pointer' }}>✕</button>
                  </span>
                )}
              </div>

              <input
                type="text"
                defaultValue={`A travel photo at a ${item.place} showing ${item.action} with ${item.people_count}.`}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};