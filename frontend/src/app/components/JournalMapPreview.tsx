import React from 'react'
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
        border: 2px solid #26215C;
        color: #26215C;
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
            Journal route map
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {currentDay ? `${currentDay.dateLabel} route` : 'No route points available'}
          </p>
        </div>

        <button
          onClick={onBack}
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
              borderRadius: '16px',
              border: '1px solid #dbe4ea',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
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
                <Polyline positions={polylinePositions} pathOptions={{ color: '#26215C', weight: 3 }} />
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
                  className='journal-map-nav journal-map-nav-left'
                >
                  ‹
                </button>
                <button
                  onClick={moveNext}
                  disabled={currentDayIndex === days.length - 1}
                  className='journal-map-nav journal-map-nav-right'
                >
                  ›
                </button>
              </>
            )}
          </div>

          <div
            style={{
              marginTop: '18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {currentDay.points.map((point, index) => (
              <div
                key={point.id}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#fafafa',
                  border: '1px solid #e6edf2',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#534AB7', marginBottom: '6px' }}>
                  Point {index + 1}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#26215C', marginBottom: '6px' }}>
                  {point.location}
                </div>
                <div style={{ fontSize: '12px', color: '#55606d', marginBottom: '4px' }}>{point.city}</div>
                {point.address && (
                  <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: 1.4 }}>{point.address}</div>
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
            width: 42px;
            height: 42px;
            border-radius: 999px;
            border: none;
            background: rgba(38, 33, 92, 0.82);
            color: #ffffff;
            font-size: 28px;
            line-height: 1;
            cursor: pointer;
            opacity: 0.45;
            transition: opacity 0.18s ease;
            z-index: 500;
          }

          .journal-map-nav:hover {
            opacity: 1;
          }

          .journal-map-nav:disabled {
            opacity: 0.2;
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
