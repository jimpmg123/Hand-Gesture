import React from 'react'

type JournalImageDetail = {
  imageId: number
  nearestPoiName: string | null
  nearestPoiPrimaryType: string | null
  nearestPoiFormattedAddress: string | null
  formattedAddress: string | null
}

export type JournalSegmentCard = {
  id: string
  imageUrls: string[]
  imageDetails: JournalImageDetail[]
  segmentType: string
  isInferred: boolean
  city: string
  country: string | null
  location: string
  address: string | null
  startTime: string
  endTime: string
  startTimeRaw: string
  endTimeRaw: string
  durationMinutes: number | null
  photoCount: number
  travelMode: string | null
  travelDistanceKm: number | null
}

export type JournalTimelineSection = {
  dateKey: string
  dateLabel: string
  segments: JournalSegmentCard[]
}

interface JournalResultProps {
  title: string
  initialJournalName: string
  sections: JournalTimelineSection[]
  rejectedCount: number
  observationCount: number
  onDiscard: () => void
  onNext: () => void
  canOpenMap: boolean
  mapLoading: boolean
}

const trimCountry = (value: string | null) => {
  if (!value) {
    return null
  }

  const parts = value.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length > 1) {
    return parts.slice(0, -1).join(', ')
  }

  return value
}

const formatLabel = (value: string | null) => value || 'Not available'

export const JournalResult: React.FC<JournalResultProps> = ({
  title,
  initialJournalName,
  sections,
  rejectedCount,
  observationCount,
  onDiscard,
  onNext,
  canOpenMap,
  mapLoading,
}) => {
  const [activeSegmentIndex, setActiveSegmentIndex] = React.useState<number | null>(null)
  const [activeImageIndex, setActiveImageIndex] = React.useState(0)
  const [journalName, setJournalName] = React.useState(initialJournalName)
  const [isEditingName, setIsEditingName] = React.useState(false)

  React.useEffect(() => {
    setJournalName(initialJournalName)
  }, [initialJournalName])

  const flatSegments = React.useMemo(() => sections.flatMap((section) => section.segments), [sections])

  const activeSegment = activeSegmentIndex === null ? null : flatSegments[activeSegmentIndex]
  const activeImageUrl =
    activeSegment && activeSegment.imageUrls.length > 0
      ? activeSegment.imageUrls[activeImageIndex]
      : null
  const activeImageDetail =
    activeSegment && activeSegment.imageDetails.length > 0
      ? activeSegment.imageDetails[activeImageIndex] ?? activeSegment.imageDetails[0]
      : null

  const openLightbox = (segmentId: string) => {
    const index = flatSegments.findIndex((segment) => segment.id === segmentId)
    if (index === -1) {
      return
    }
    setActiveSegmentIndex(index)
    setActiveImageIndex(0)
  }

  const closeLightbox = () => {
    setActiveSegmentIndex(null)
    setActiveImageIndex(0)
  }

  const showPreviousImage = () => {
    if (!activeSegment || activeSegment.imageUrls.length <= 1) {
      return
    }

    setActiveImageIndex((current) =>
      current === 0 ? activeSegment.imageUrls.length - 1 : current - 1,
    )
  }

  const showNextImage = () => {
    if (!activeSegment || activeSegment.imageUrls.length <= 1) {
      return
    }

    setActiveImageIndex((current) =>
      current === activeSegment.imageUrls.length - 1 ? 0 : current + 1,
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #eaeaea',
        }}
      >
        <div>
          <h2
            style={{ fontSize: '24px', fontWeight: 'bold', color: '#26215C', marginBottom: '10px' }}
          >
            {title}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            {isEditingName ? (
              <input
                value={journalName}
                onChange={(event) => setJournalName(event.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setIsEditingName(false)
                  }
                }}
                autoFocus
                style={{
                  minWidth: '320px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ced4da',
                  fontSize: '16px',
                  color: '#26215C',
                }}
              />
            ) : (
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#495057' }}>{journalName}</div>
            )}

            <button
              onClick={() => setIsEditingName((current) => !current)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '999px',
                border: '1px solid #d7dbe3',
                backgroundColor: '#ffffff',
                color: '#495057',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
              aria-label='Edit journal name'
            >
              ✎
            </button>
          </div>

          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {flatSegments.length} segments, {observationCount} observations, {rejectedCount} rejected
            images
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {mapLoading && (
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '999px',
                border: '3px solid #d8dce5',
                borderTopColor: '#6c7280',
                animation: 'journal-spin 0.8s linear infinite',
              }}
            />
          )}
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
          <button
            onClick={onNext}
            disabled={!canOpenMap}
            style={{
              padding: '10px 20px',
              backgroundColor: canOpenMap ? '#26215C' : '#c7cad1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: canOpenMap ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            Next
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {sections.length === 0 && (
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

        {sections.map((section) => (
          <div key={section.dateKey}>
            <div
              style={{
                marginBottom: '16px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#26215C',
              }}
            >
              {section.dateLabel}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {section.segments.map((segment) => (
                <div
                  key={segment.id}
                  style={{
                    display: 'flex',
                    gap: '20px',
                    padding: segment.segmentType === 'transit' ? '16px 20px' : '20px',
                    border: '1px solid #E1F5EE',
                    borderRadius: '12px',
                    backgroundColor: segment.segmentType === 'transit' ? '#f5fbf8' : '#fafafa',
                    alignItems: segment.segmentType === 'transit' ? 'center' : 'stretch',
                  }}
                >
                  {segment.segmentType !== 'transit' && segment.imageUrls[0] && (
                    <img
                      src={segment.imageUrls[0]}
                      alt={segment.location}
                      onClick={() => openLightbox(segment.id)}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        cursor: 'zoom-in',
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', color: '#534AB7', fontWeight: 'bold' }}>
                        {segment.city}
                      </span>
                      <span style={{ fontSize: '12px', color: '#888' }}>
                        {segment.segmentType}
                        {segment.isInferred ? ' inferred' : ''}
                      </span>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ display: 'block', fontSize: '16px', color: '#26215C' }}>
                        {segment.location}
                      </strong>
                      {segment.address && (
                        <span
                          style={{
                            display: 'block',
                            marginTop: '6px',
                            fontSize: '13px',
                            color: '#5c6770',
                          }}
                        >
                          {segment.address}
                        </span>
                      )}
                      <span style={{ display: 'block', marginTop: '6px', fontSize: '13px', color: '#666' }}>
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
                        {segment.durationMinutes === null ? 'Unknown' : `${segment.durationMinutes} min`}
                      </span>

                      {segment.segmentType === 'transit' ? (
                        <>
                          <span
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#E9F7F2',
                              color: '#0F6E56',
                              fontSize: '12px',
                              borderRadius: '20px',
                              fontWeight: 'bold',
                            }}
                          >
                            {segment.travelMode === 'walk' ? 'Walk 6 km/h' : 'Taxi 40 km/h'}
                          </span>
                          {segment.travelDistanceKm !== null && (
                            <span
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#F3F4F6',
                                color: '#495057',
                                fontSize: '12px',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                              }}
                            >
                              {segment.travelDistanceKm} km
                            </span>
                          )}
                        </>
                      ) : (
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
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeSegment && activeImageUrl && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '32px',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'stretch',
              gap: '16px',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            {activeSegment.imageUrls.length > 1 && (
              <button
                onClick={showPreviousImage}
                style={{
                  width: '44px',
                  height: '44px',
                  alignSelf: 'center',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  color: '#26215C',
                  fontSize: '22px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {'<'}
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              <img
                src={activeImageUrl}
                alt={activeSegment.location}
                style={{
                  maxWidth: 'min(62vw, 960px)',
                  maxHeight: '75vh',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  backgroundColor: '#111',
                }}
              />

              {activeSegment.imageUrls.length > 1 && (
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    color: '#26215C',
                    fontSize: '13px',
                    fontWeight: 'bold',
                  }}
                >
                  {activeImageIndex + 1} / {activeSegment.imageUrls.length}
                </div>
              )}
            </div>

            <div
              style={{
                width: '320px',
                maxHeight: '75vh',
                overflowY: 'auto',
                borderRadius: '12px',
                backgroundColor: '#fff',
                padding: '20px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', color: '#7b7b90', fontWeight: 700, marginBottom: '6px' }}>
                  Segment
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#26215C' }}>
                  {activeSegment.location}
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', color: '#7b7b90', fontWeight: 700, marginBottom: '6px' }}>
                  Nearest POI
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#26215C' }}>
                  {formatLabel(activeImageDetail?.nearestPoiName ?? null)}
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', color: '#7b7b90', fontWeight: 700, marginBottom: '6px' }}>
                  POI Type
                </div>
                <div style={{ fontSize: '14px', color: '#4d5562' }}>
                  {formatLabel(activeImageDetail?.nearestPoiPrimaryType ?? null)}
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', color: '#7b7b90', fontWeight: 700, marginBottom: '6px' }}>
                  POI Address
                </div>
                <div style={{ fontSize: '14px', color: '#4d5562', lineHeight: 1.5 }}>
                  {formatLabel(trimCountry(activeImageDetail?.nearestPoiFormattedAddress ?? null))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#7b7b90', fontWeight: 700, marginBottom: '6px' }}>
                  Image Address
                </div>
                <div style={{ fontSize: '14px', color: '#4d5562', lineHeight: 1.5 }}>
                  {formatLabel(trimCountry(activeImageDetail?.formattedAddress ?? null))}
                </div>
              </div>
            </div>

            {activeSegment.imageUrls.length > 1 && (
              <button
                onClick={showNextImage}
                style={{
                  width: '44px',
                  height: '44px',
                  alignSelf: 'center',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  color: '#26215C',
                  fontSize: '22px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {'>'}
              </button>
            )}

            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '36px',
                height: '36px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: 'rgba(255,255,255,0.95)',
                color: '#26215C',
                fontSize: '18px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes journal-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
