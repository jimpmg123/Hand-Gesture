import React from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Route } from 'lucide-react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'

export type JournalMapPoint = {
  id: string
  order: number
  location: string
  city: string
  address: string | null
  latitude: number
  longitude: number
  imageUrl: string | null
}

export type JournalMapDay = {
  dateKey: string
  dateLabel: string
  points: JournalMapPoint[]
}

interface JournalMapPreviewProps {
  days: JournalMapDay[]
  onBack: () => void
}

const buildMarkerIcon = (label: number) =>
  L.divIcon({
    className: 'journal-map-marker',
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 999px;
        background: #ffffff;
        border: 2px solid #2d6a5f;
        color: #2d6a5f;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.16);
      ">
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  })

const MapBoundsController: React.FC<{ points: JournalMapPoint[] }> = ({ points }) => {
  const map = useMap()

  React.useEffect(() => {
    if (points.length === 0) {
      return
    }

    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 14)
      return
    }

    const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude] as [number, number]))
    map.fitBounds(bounds, { padding: [48, 48] })
  }, [map, points])

  return null
}

export const JournalMapPreview: React.FC<JournalMapPreviewProps> = ({ days, onBack }) => {
  const [currentDayIndex, setCurrentDayIndex] = React.useState(0)

  React.useEffect(() => {
    setCurrentDayIndex(0)
  }, [days.length])

  const currentDay = days[currentDayIndex] ?? null
  const polylinePositions =
    currentDay?.points.map((point) => [point.latitude, point.longitude] as [number, number]) ?? []

  const movePrevious = () => setCurrentDayIndex((current) => Math.max(current - 1, 0))
  const moveNext = () => setCurrentDayIndex((current) => Math.min(current + 1, days.length - 1))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '28px',
          paddingBottom: '24px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#26215C', marginBottom: '10px' }}>
            Journal route map
          </div>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            {currentDay ? `${currentDay.dateLabel} route preview` : 'No route points available'}
          </p>
        </div>

        <button
          onClick={onBack}
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
          Back to timeline
        </button>
      </div>

      {!currentDay ? (
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
          No route points are available for this preview.
        </div>
      ) : (
        <>
          <div
            style={{
              position: 'relative',
              height: '560px',
              overflow: 'hidden',
              borderRadius: '28px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
            }}
          >
            <MapContainer
              center={[currentDay.points[0].latitude, currentDay.points[0].longitude]}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              />
              <MapBoundsController points={currentDay.points} />
              {polylinePositions.length >= 2 && (
                <Polyline positions={polylinePositions} pathOptions={{ color: '#2d6a5f', weight: 3 }} />
              )}
              {currentDay.points.map((point, index) => (
                <Marker
                  key={point.id}
                  position={[point.latitude, point.longitude]}
                  icon={buildMarkerIcon(index + 1)}
                >
                  <Popup>
                    <div style={{ minWidth: '180px' }}>
                      <div style={{ fontWeight: 700, color: '#26215C', marginBottom: '6px' }}>
                        {index + 1}. {point.location}
                      </div>
                      <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                        {point.city}
                      </div>
                      {point.address && (
                        <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.4, marginBottom: '8px' }}>
                          {point.address}
                        </div>
                      )}
                      {point.imageUrl && (
                        <img
                          src={point.imageUrl}
                          alt={point.location}
                          style={{ width: '100%', maxWidth: '180px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {days.length > 1 && (
              <>
                <button
                  onClick={movePrevious}
                  disabled={currentDayIndex === 0}
                  className="journal-map-nav journal-map-nav-left"
                  aria-label="Previous day"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={moveNext}
                  disabled={currentDayIndex === days.length - 1}
                  className="journal-map-nav journal-map-nav-right"
                  aria-label="Next day"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          <div
            style={{
              marginTop: '18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {currentDay.points.map((point, index) => (
              <div
                key={point.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '24px',
                  padding: '18px',
                  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Route size={15} color="#14b8a6" />
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#2d6a5f' }}>
                    Point {index + 1}
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#26215C', marginBottom: '8px' }}>
                  {point.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <MapPin size={14} color="#14b8a6" />
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{point.city}</span>
                </div>
                {point.address && (
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{point.address}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <style>
        {`
          .journal-map-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 46px;
            height: 46px;
            border-radius: 999px;
            border: none;
            background: rgba(45, 106, 95, 0.84);
            color: #ffffff;
            display: grid;
            place-items: center;
            cursor: pointer;
            opacity: 0.4;
            transition: opacity 0.18s ease;
            z-index: 500;
          }

          .journal-map-nav:hover {
            opacity: 1;
          }

          .journal-map-nav:disabled {
            opacity: 0.16;
            cursor: not-allowed;
          }

          .journal-map-nav-left {
            left: 14px;
          }

          .journal-map-nav-right {
            right: 14px;
          }
        `}
      </style>
    </div>
  )
}
