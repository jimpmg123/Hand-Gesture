import React from 'react'

type JournalSegmentCard = {
  id: string
  imageUrl: string
  segmentType: string
  city: string
  location: string
  startTime: string
  endTime: string
  durationMinutes: number
  photoCount: number
}

interface JournalResultProps {
  segments: JournalSegmentCard[]
  rejectedCount: number
  observationCount: number
  onDiscard: () => void
}

export const JournalResult: React.FC<JournalResultProps> = ({
  segments,
  rejectedCount,
  observationCount,
  onDiscard,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #eaeaea',
        }}
      >
        <div>
          <h2
            style={{ fontSize: '22px', fontWeight: 'bold', color: '#26215C', marginBottom: '12px' }}
          >
            Journal preview timeline
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {segments.length} segments, {observationCount} observations, {rejectedCount} rejected
            images
          </p>
        </div>

        <button
          onClick={onDiscard}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f1f3f5',
            color: '#495057',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          Back
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {segments.length === 0 && (
          <div
            style={{
              padding: '24px',
              border: '1px dashed #ced4da',
              borderRadius: '12px',
              color: '#666',
              backgroundColor: '#fafafa',
              textAlign: 'center',
            }}
          >
            No journal segments were created from the uploaded files.
          </div>
        )}

        {segments.map((segment) => (
          <div
            key={segment.id}
            style={{
              display: 'flex',
              gap: '20px',
              padding: '20px',
              border: '1px solid #E1F5EE',
              borderRadius: '12px',
              backgroundColor: '#fafafa',
            }}
          >
            <img
              src={segment.imageUrl}
              alt={segment.location}
              style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#534AB7', fontWeight: 'bold' }}>
                  {segment.city}
                </span>
                <span style={{ fontSize: '12px', color: '#888' }}>{segment.segmentType}</span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong style={{ display: 'block', fontSize: '16px', color: '#26215C' }}>
                  {segment.location}
                </strong>
                <span style={{ fontSize: '13px', color: '#666' }}>
                  {segment.startTime} to {segment.endTime}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#EEEDFE',
                    color: '#534AB7',
                    fontSize: '12px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  {segment.durationMinutes} min
                </span>
                <span
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#E1F5EE',
                    color: '#0F6E56',
                    fontSize: '12px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  {segment.photoCount} photos
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
