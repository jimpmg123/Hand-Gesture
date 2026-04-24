import React from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

import type { SearchImageResult } from '../types'

type SearchResultMapProps = {
  results: SearchImageResult[]
}

const buildMarkerIcon = (label: number) =>
  L.divIcon({
    className: 'search-result-map-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 999px;
        background: #ffffff;
        border: 2px solid #2d6a5f;
        color: #2d6a5f;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        box-shadow: 0 8px 18px rgba(0,0,0,0.14);
      ">
        ${label}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })

const MapBoundsController: React.FC<{ points: SearchImageResult[] }> = ({ points }) => {
  const map = useMap()

  React.useEffect(() => {
    if (points.length === 0) {
      return
    }

    const latLngPoints = points
      .filter((point) => point.latitude != null && point.longitude != null)
      .map((point) => [point.latitude as number, point.longitude as number] as [number, number])

    if (latLngPoints.length === 0) {
      return
    }

    if (latLngPoints.length === 1) {
      map.setView(latLngPoints[0], 14)
      return
    }

    const bounds = L.latLngBounds(latLngPoints)
    map.fitBounds(bounds, { padding: [48, 48] })
  }, [map, points])

  return null
}

export function SearchResultMap({ results }: SearchResultMapProps) {
  const points = results.filter((result) => result.latitude != null && result.longitude != null)

  if (points.length === 0) {
    return (
      <div className="search-map-empty">
        <strong>No resolved location</strong>
        <p>No uploaded image returned coordinates in this search run.</p>
      </div>
    )
  }

  return (
    <div className="search-result-map-shell">
      <MapContainer
        center={[points[0].latitude as number, points[0].longitude as number]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsController points={points} />
        {points.map((point, index) => (
          <Marker
            key={point.id}
            position={[point.latitude as number, point.longitude as number]}
            icon={buildMarkerIcon(index + 1)}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <div style={{ fontWeight: 800, color: '#1f2937', marginBottom: '6px' }}>
                  {point.imageName}
                </div>
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                  {point.address ?? 'No formatted address'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  {point.resolutionPath}
                </div>
                <img
                  src={point.previewUrl}
                  alt={point.imageName}
                  style={{ width: '100%', maxWidth: '180px', borderRadius: '10px', objectFit: 'cover' }}
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
