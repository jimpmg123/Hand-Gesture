import React from 'react'
import {
  ArrowLeft,
  CarFront,
  Clock3,
  Edit3,
  Footprints,
  Image as ImageIcon,
  MapPin,
  Navigation,
  Route,
  X,
} from 'lucide-react'

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

  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length > 1) {
    return parts.slice(0, -1).join(', ')
  }

  return value
}

const formatLabel = (value: string | null) => value || 'Not available'

const formatDistance = (value: number | null) =>
  value === null ? 'Unknown distance' : `${value.toFixed(value >= 10 ? 0 : 1)} km`

const getRepresentativeImageDetail = (segment: JournalSegmentCard) =>
  segment.imageDetails.find(
    (detail) =>
      detail.nearestPoiName ||
      detail.nearestPoiFormattedAddress ||
      detail.formattedAddress ||
      detail.nearestPoiPrimaryType,
  ) ?? segment.imageDetails[0] ?? null

const formatSegmentType = (segmentType: string, isInferred: boolean) => {
  const normalized = segmentType.replace(/_/g, ' ')
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1)
  return isInferred ? `${label} inferred` : label
}

const buildSegmentSummary = (segment: JournalSegmentCard) => {
  if (segment.segmentType === 'transit') {
    const modeLabel = segment.travelMode === 'walk' ? 'walking' : segment.travelMode === 'taxi' ? 'taxi' : 'travel'
    const distance = formatDistance(segment.travelDistanceKm)
    const duration =
      segment.durationMinutes === null ? 'an unknown duration' : `${segment.durationMinutes} minutes`

    return `Inferred ${modeLabel} segment covering ${distance} over ${duration} between journal stops.`
  }

  const addressText = segment.address ? `Address: ${segment.address}. ` : ''
  const durationText =
    segment.durationMinutes === null
      ? 'Duration is still unknown. '
      : `Estimated stay duration: ${segment.durationMinutes} minutes. `
  const photoText = `${segment.photoCount} photo${segment.photoCount === 1 ? '' : 's'} support this segment. `

  return `${segment.location} in ${segment.city}. ${addressText}${durationText}${photoText}Click the image to inspect nearest POI details.`
}

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
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '24px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#26215C', marginBottom: '10px' }}>
              {title}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
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
                    minWidth: '300px',
                    maxWidth: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #d4d4d8',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                />
              ) : (
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#4b5563' }}>{journalName}</div>
              )}

              <button
                onClick={() => setIsEditingName((current) => !current)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '999px',
                  border: '1px solid #d7dbe3',
                  backgroundColor: '#ffffff',
                  color: '#6b7280',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                }}
                aria-label="Edit journal name"
              >
                <Edit3 size={15} />
              </button>
            </div>

            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              {flatSegments.length} segments, {observationCount} observations, {rejectedCount} rejected images
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={onDiscard}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 16px',
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                border: '1px solid #e5e7eb',
                borderRadius: '14px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            {mapLoading && (
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '999px',
                  border: '3px solid #d8dce5',
                  borderTopColor: '#14b8a6',
                  animation: 'journal-spin 0.8s linear infinite',
                }}
              />
            )}

            <button
              onClick={onNext}
              disabled={!canOpenMap}
              style={{
                padding: '11px 18px',
                backgroundColor: canOpenMap ? '#2d6a5f' : '#c7cad1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                cursor: canOpenMap ? 'pointer' : 'not-allowed',
                fontWeight: 700,
                fontSize: '14px',
                boxShadow: canOpenMap ? '0 10px 20px rgba(45, 106, 95, 0.18)' : 'none',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {sections.length === 0 ? (
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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {sections.map((section) => (
            <div key={section.dateKey}>
              <div
                style={{
                  marginBottom: '16px',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#26215C',
                  letterSpacing: '-0.02em',
                }}
              >
                {section.dateLabel}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {section.segments.map((segment, index) => {
                  const isTransit = segment.segmentType === 'transit'
                  const isLastInSection = index === section.segments.length - 1
                  const representativeDetail = getRepresentativeImageDetail(segment)
                  const previousSegment = index > 0 ? section.segments[index - 1] : null
                  const nextSegment = index < section.segments.length - 1 ? section.segments[index + 1] : null
                  const travelModeLabel =
                    segment.travelMode === 'walk' ? 'Walk' : segment.travelMode === 'taxi' ? 'Car' : 'Transit'
                  const travelIcon =
                    segment.travelMode === 'walk' ? (
                      <Footprints size={15} />
                    ) : segment.travelMode === 'taxi' ? (
                      <CarFront size={15} />
                    ) : (
                      <Route size={15} />
                    )

                  return (
                    <div key={segment.id} style={{ position: 'relative', paddingLeft: '44px' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '15px',
                          top: 0,
                          bottom: isLastInSection ? '28px' : '-28px',
                          width: '2px',
                          backgroundColor: '#a7f3d0',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: '15px',
                          top: '28px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '999px',
                          backgroundColor: '#14b8a6',
                          border: '3px solid #ffffff',
                          boxShadow: '0 2px 10px rgba(20, 184, 166, 0.22)',
                          transform: 'translateX(-50%)',
                          zIndex: 1,
                        }}
                      />

                      {isTransit ? (
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #dce7e2',
                            borderRadius: '22px',
                            padding: '14px 18px',
                            boxShadow: '0 10px 20px rgba(15, 23, 42, 0.04)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '16px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '999px',
                                  backgroundColor: '#ecfdf5',
                                  color: '#166534',
                                  display: 'grid',
                                  placeItems: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {travelIcon}
                              </div>
                              <div style={{ display: 'grid', gap: '4px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#2d6a5f', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                  Default transit
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                                  {previousSegment?.location ?? 'Previous stop'} {'->'} {nextSegment?.location ?? 'Next stop'}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span
                                style={{
                                  backgroundColor: '#f0fdf4',
                                  color: '#166534',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  padding: '8px 12px',
                                  borderRadius: '999px',
                                  border: '1px solid #dcfce7',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                {travelIcon}
                                {travelModeLabel}: {formatDistance(segment.travelDistanceKm)}
                              </span>
                              <span
                                style={{
                                  backgroundColor: '#f8fafc',
                                  color: '#475569',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  padding: '8px 12px',
                                  borderRadius: '999px',
                                  border: '1px solid #e2e8f0',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <Clock3 size={14} />
                                {segment.durationMinutes === null ? 'Unknown' : `${segment.durationMinutes} min`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '30px',
                            padding: '20px',
                            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              gap: '18px',
                              alignItems: 'stretch',
                              flexWrap: 'wrap',
                              marginBottom: '16px',
                            }}
                          >
                            {segment.imageUrls[0] ? (
                              <img
                                src={segment.imageUrls[0]}
                                alt={segment.location}
                                onClick={() => openLightbox(segment.id)}
                                style={{
                                  width: '194px',
                                  height: '124px',
                                  objectFit: 'cover',
                                  borderRadius: '20px',
                                  cursor: 'zoom-in',
                                  boxShadow: '0 8px 16px rgba(15, 23, 42, 0.1)',
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '194px',
                                  minHeight: '124px',
                                  borderRadius: '20px',
                                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.10), rgba(45, 106, 95, 0.18))',
                                  display: 'grid',
                                  placeItems: 'center',
                                  color: '#2d6a5f',
                                  flexShrink: 0,
                                }}
                              >
                                <Navigation size={36} />
                              </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: '1 1 280px' }}>
                              <p
                                style={{
                                  margin: '0 0 8px',
                                  fontSize: '12px',
                                  color: '#94a3b8',
                                  fontWeight: 800,
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {segment.startTime}
                              </p>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <MapPin size={16} color="#14b8a6" />
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                                  {segment.city}
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    backgroundColor: '#f8fafc',
                                    color: '#475569',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    padding: '8px 12px',
                                    borderRadius: '999px',
                                    border: '1px solid #e2e8f0',
                                  }}
                                >
                                  {formatSegmentType(segment.segmentType, segment.isInferred)}
                                </span>
                                <span
                                  style={{
                                    backgroundColor: '#ecfeff',
                                    color: '#0f766e',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    padding: '8px 12px',
                                    borderRadius: '999px',
                                    border: '1px solid #ccfbf1',
                                  }}
                                >
                                  {segment.location}
                                </span>
                                <span
                                  style={{
                                    backgroundColor: '#f5f3ff',
                                    color: '#6d28d9',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    padding: '8px 12px',
                                    borderRadius: '999px',
                                    border: '1px solid #ede9fe',
                                  }}
                                >
                                  {segment.durationMinutes === null ? 'Unknown duration' : `${segment.durationMinutes} min`}
                                </span>
                                <span
                                  style={{
                                    backgroundColor: '#f0fdfa',
                                    color: '#0f766e',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    padding: '8px 12px',
                                    borderRadius: '999px',
                                    border: '1px solid #ccfbf1',
                                  }}
                                >
                                  {segment.photoCount} photo{segment.photoCount === 1 ? '' : 's'}
                                </span>
                                {representativeDetail?.nearestPoiName && (
                                  <span
                                    style={{
                                      backgroundColor: '#fff7ed',
                                      color: '#c2410c',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      padding: '8px 12px',
                                      borderRadius: '999px',
                                      border: '1px solid #fed7aa',
                                    }}
                                  >
                                    POI: {representativeDetail.nearestPoiName}
                                  </span>
                                )}
                                {representativeDetail?.nearestPoiPrimaryType && (
                                  <span
                                    style={{
                                      backgroundColor: '#f5f3ff',
                                      color: '#6d28d9',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      padding: '8px 12px',
                                      borderRadius: '999px',
                                      border: '1px solid #ede9fe',
                                    }}
                                  >
                                    {representativeDetail.nearestPoiPrimaryType}
                                  </span>
                                )}
                              </div>
                              {(representativeDetail?.nearestPoiFormattedAddress || segment.address) && (
                                <div
                                  style={{
                                    marginTop: '12px',
                                    fontSize: '13px',
                                    color: '#6b7280',
                                    lineHeight: 1.5,
                                  }}
                                >
                                  <strong style={{ color: '#374151' }}>Nearest POI address:</strong>{' '}
                                  {trimCountry(representativeDetail?.nearestPoiFormattedAddress ?? segment.address)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              position: 'relative',
                              borderRadius: '22px',
                              border: '1px solid #e5e7eb',
                              backgroundColor: '#f8fafc',
                              padding: '18px 20px',
                              color: '#374151',
                              lineHeight: 1.65,
                              fontWeight: 500,
                            }}
                          >
                            {buildSegmentSummary(segment)}
                            <div
                              style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                color: '#94a3b8',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              {segment.imageUrls.length > 0 && (
                                <button
                                  onClick={() => openLightbox(segment.id)}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    display: 'grid',
                                    placeItems: 'center',
                                  }}
                                  aria-label="Inspect segment images"
                                >
                                  <ImageIcon size={16} />
                                </button>
                              )}
                              <Edit3 size={15} />
                            </div>
                            <div
                              style={{
                                marginTop: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#6b7280',
                                fontSize: '13px',
                                fontWeight: 600,
                              }}
                            >
                              <Clock3 size={15} />
                              <span>
                                {segment.startTime} to {segment.endTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSegment && activeImageUrl && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.76)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '28px',
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
                  borderRadius: '16px',
                  objectFit: 'contain',
                  backgroundColor: '#111827',
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
                borderRadius: '18px',
                backgroundColor: '#ffffff',
                padding: '20px',
                boxSizing: 'border-box',
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
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
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={18} />
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
