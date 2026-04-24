import React, { useState } from 'react'
import { BookText } from 'lucide-react'

import { JournalMapPreview } from '../components/JournalMapPreview'
import type { JournalMapDay, JournalMapPoint } from '../components/JournalMapPreview'
import { JournalResult } from '../components/JournalResult'
import type { JournalSegmentCard, JournalTimelineSection } from '../components/JournalResult'
import { JournalUpload } from '../components/JournalUpload'
import { previewJournalFromAPI } from '../services/journalApi'
import type { JournalPreviewResponse } from '../services/journalApi'

const buildDisplayLocation = (location: string, city: string) => location || city || 'Unknown location'

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

const formatDateTime = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleString()
}

const formatDateKey = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10)
  }

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateLabel = (dateKey: string, includeYear: boolean) => {
  const parsed = new Date(`${dateKey}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return dateKey
  }

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')

  if (includeYear) {
    return `${year}-${month}-${day}`
  }

  return `${month}-${day}`
}

const formatJournalTitle = (previewResult: JournalPreviewResponse) => {
  const times = [
    ...previewResult.segments.flatMap((segment) => [segment.start_time, segment.end_time]),
    ...previewResult.observations.flatMap((observation) => [observation.start_time, observation.end_time]),
  ]
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((left, right) => left.getTime() - right.getTime())

  if (times.length === 0) {
    return 'Journal'
  }

  const first = times[0]
  const last = times[times.length - 1]
  const formatMonthDay = (value: Date) =>
    `${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`

  if (first.getFullYear() === last.getFullYear()) {
    if (formatMonthDay(first) === formatMonthDay(last)) {
      return `${formatMonthDay(first)}, ${first.getFullYear()} Journal`
    }
    return `${formatMonthDay(first)} ~ ${formatMonthDay(last)}, ${first.getFullYear()} Journal`
  }

  return `${formatMonthDay(first)}, ${first.getFullYear()} ~ ${formatMonthDay(last)}, ${last.getFullYear()} Journal`
}

const buildInitialJournalName = (segments: JournalSegmentCard[]) => {
  const rankedSegments = [...segments]
    .filter((segment) => segment.segmentType === 'stay')
    .sort((left, right) => (right.durationMinutes ?? -1) - (left.durationMinutes ?? -1))

  const target = rankedSegments[0] ?? segments[0]
  if (!target) {
    return '"Trip" Journal'
  }

  const scope = target.city || target.country || 'Trip'
  return `"${target.location}" ${scope} Journal`
}

const groupSegmentsByDay = (
  segments: JournalSegmentCard[],
  includeYear: boolean,
): JournalTimelineSection[] => {
  const grouped = new Map<string, JournalSegmentCard[]>()

  segments.forEach((segment) => {
    const dateKey = formatDateKey(segment.startTimeRaw)
    const items = grouped.get(dateKey) ?? []
    items.push(segment)
    grouped.set(dateKey, items)
  })

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dateKey, daySegments]) => ({
      dateKey,
      dateLabel: formatDateLabel(dateKey, includeYear),
      segments: daySegments,
    }))
}

const haversineDistanceKm = (
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) => {
  const toRadians = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const deltaLatitude = toRadians(latitudeB - latitudeA)
  const deltaLongitude = toRadians(longitudeB - longitudeA)
  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

const normalizePlaceKey = (value: string | null) => value?.trim().toLowerCase() || null

const buildMapDays = (
  previewResult: JournalPreviewResponse,
  imageUrls: Map<number, string>,
  includeYear: boolean,
): JournalMapDay[] => {
  const orderedObservations = [...previewResult.observations].sort(
    (left, right) => left.observation_order - right.observation_order,
  )

  const grouped = new Map<string, JournalMapPoint[]>()

  orderedObservations.forEach((observation) => {
    const latitude = observation.center_latitude
    const longitude = observation.center_longitude
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return
    }

    const dateKey = formatDateKey(observation.start_time)
    const dayPoints = grouped.get(dateKey) ?? []
    const point: JournalMapPoint = {
      id: observation.observation_id,
      order: observation.observation_order,
      location: buildDisplayLocation(observation.poi_name || '', observation.city_snapshot || 'Unknown city'),
      city: observation.city_snapshot || 'Unknown city',
      address: trimCountry(observation.formatted_address),
      latitude,
      longitude,
      imageUrl: imageUrls.get(observation.image_ids[0]) ?? null,
    }

    const previousPoint = dayPoints[dayPoints.length - 1]
    if (previousPoint) {
      const currentPlaceKey = normalizePlaceKey(observation.poi_name || observation.formatted_address)
      const previousPlaceKey = normalizePlaceKey(previousPoint.location || previousPoint.address)
      const distanceKm = haversineDistanceKm(
        previousPoint.latitude,
        previousPoint.longitude,
        point.latitude,
        point.longitude,
      )

      if (currentPlaceKey && previousPlaceKey && currentPlaceKey === previousPlaceKey && distanceKm < 1) {
        grouped.set(dateKey, dayPoints)
        return
      }
    }

    dayPoints.push(point)
    grouped.set(dateKey, dayPoints)
  })

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dateKey, points]) => ({
      dateKey,
      dateLabel: formatDateLabel(dateKey, includeYear),
      points,
    }))
    .filter((day) => day.points.length > 0)
}

export const JournalPage: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'loading' | 'result' | 'map'>('upload')
  const [preview, setPreview] = useState<JournalPreviewResponse | null>(null)
  const [timelineSections, setTimelineSections] = useState<JournalTimelineSection[]>([])
  const [mapDays, setMapDays] = useState<JournalMapDay[]>([])
  const [imageUrlMap, setImageUrlMap] = useState<Map<number, string>>(new Map())
  const [mapLoading, setMapLoading] = useState(false)
  const [title, setTitle] = useState('Journal')
  const [initialJournalName, setInitialJournalName] = useState('"Trip" Journal')

  React.useEffect(() => {
    if (step !== 'result' || !preview || imageUrlMap.size === 0 || !mapLoading) {
      return
    }

    const timer = window.setTimeout(() => {
      const observationYears = preview.observations
        .map((observation) => new Date(observation.start_time).getFullYear())
        .filter((year) => !Number.isNaN(year))
      const includeYear = new Set(observationYears).size > 1
      setMapDays(buildMapDays(preview, imageUrlMap, includeYear))
      setMapLoading(false)
    }, 120)

    return () => window.clearTimeout(timer)
  }, [imageUrlMap, mapLoading, preview, step])

  const openPreviewResult = () => {
    const previewSegments: JournalSegmentCard[] = [
      {
        id: 'preview-1',
        imageUrls: ['https://placehold.co/320x240?text=Stay+Segment'],
        imageDetails: [
          {
            imageId: 1,
            nearestPoiName: 'Nearest preview POI',
            nearestPoiPrimaryType: 'tourist_attraction',
            nearestPoiFormattedAddress: 'Kyoto, Higashiyama Ward',
            formattedAddress: 'Kyoto, Higashiyama Ward',
          },
        ],
        segmentType: 'stay',
        isInferred: false,
        city: 'Kyoto',
        country: 'Japan',
        location: 'Temple approach',
        address: 'Kyoto, Higashiyama Ward',
        startTime: '2026. 04. 21 09:10',
        endTime: '2026. 04. 21 09:40',
        startTimeRaw: '2026-04-21T09:10:00',
        endTimeRaw: '2026-04-21T09:40:00',
        durationMinutes: 30,
        photoCount: 3,
        travelMode: null,
        travelDistanceKm: null,
      },
      {
        id: 'preview-2',
        imageUrls: [
          'https://placehold.co/320x240?text=Transit+Segment',
          'https://placehold.co/320x240?text=Transit+Segment+2',
        ],
        imageDetails: [],
        segmentType: 'transit',
        isInferred: true,
        city: 'Kyoto',
        country: 'Japan',
        location: 'Default transit',
        address: null,
        startTime: '2026. 04. 21 09:40',
        endTime: '2026. 04. 21 10:00',
        startTimeRaw: '2026-04-21T09:40:00',
        endTimeRaw: '2026-04-21T10:00:00',
        durationMinutes: 20,
        photoCount: 2,
        travelMode: 'walk',
        travelDistanceKm: 1.8,
      },
    ]

    const previewMapDays: JournalMapDay[] = [
      {
        dateKey: '2026-04-21',
        dateLabel: 'Apr 21, 2026',
        points: [
          {
            id: 'preview-point-1',
            order: 1,
            location: 'Temple approach',
            city: 'Kyoto',
            address: 'Kyoto, Higashiyama Ward',
            latitude: 35.0037,
            longitude: 135.7788,
            imageUrl: 'https://placehold.co/320x240?text=Stay+Segment',
          },
          {
            id: 'preview-point-2',
            order: 2,
            location: 'Market district',
            city: 'Kyoto',
            address: 'Kyoto, Nakagyo Ward',
            latitude: 35.0051,
            longitude: 135.7647,
            imageUrl: 'https://placehold.co/320x240?text=Transit+Segment+2',
          },
        ],
      },
    ]

    setPreview({
      eligible_images: [],
      rejected_images: [],
      observations: [],
      segments: [],
      counts: {
        eligible_images: 0,
        rejected_images: 0,
        observations: 0,
        segments: previewSegments.length,
      },
    })
    setTimelineSections(groupSegmentsByDay(previewSegments, false))
    setMapDays(previewMapDays)
    setImageUrlMap(new Map())
    setMapLoading(false)
    setTitle('04-21, 2026 Journal')
    setInitialJournalName('"Temple approach" Kyoto Journal')
    setStep('result')
  }

  const handleGenerate = async (files: File[]) => {
    setStep('loading')

    try {
      const apiResults = await previewJournalFromAPI(files)
      const imageUrls = new Map<number, string>()
      const imageDetailMap = new Map<
        number,
        {
          imageId: number
          nearestPoiName: string | null
          nearestPoiPrimaryType: string | null
          nearestPoiFormattedAddress: string | null
          formattedAddress: string | null
        }
      >()

      files.forEach((file, index) => {
        imageUrls.set(index + 1, URL.createObjectURL(file))
      })

      apiResults.observations.forEach((observation) => {
        observation.image_ids.forEach((imageId) => {
          imageDetailMap.set(imageId, {
            imageId,
            nearestPoiName: observation.nearest_poi_name,
            nearestPoiPrimaryType: observation.nearest_poi_primary_type,
            nearestPoiFormattedAddress: trimCountry(observation.nearest_poi_formatted_address),
            formattedAddress: trimCountry(observation.formatted_address),
          })
        })
      })

      const mappedSegments: JournalSegmentCard[] = apiResults.segments.map((segment) => ({
        id: segment.segment_id,
        imageUrls:
          segment.image_ids.map(
            (imageId) => imageUrls.get(imageId) ?? 'https://placehold.co/320x240?text=Journal+Preview',
          ),
        imageDetails: segment.image_ids.map((imageId) => ({
          imageId,
          nearestPoiName: imageDetailMap.get(imageId)?.nearestPoiName ?? null,
          nearestPoiPrimaryType: imageDetailMap.get(imageId)?.nearestPoiPrimaryType ?? null,
          nearestPoiFormattedAddress: imageDetailMap.get(imageId)?.nearestPoiFormattedAddress ?? null,
          formattedAddress: imageDetailMap.get(imageId)?.formattedAddress ?? trimCountry(segment.formatted_address),
        })),
        segmentType: segment.segment_type,
        isInferred: segment.is_inferred,
        city: segment.city || 'Unknown city',
        country: segment.country || null,
        location: buildDisplayLocation(segment.location_name || '', segment.city || 'Unknown city'),
        address: trimCountry(segment.formatted_address),
        startTime: formatDateTime(segment.start_time),
        endTime: formatDateTime(segment.end_time),
        startTimeRaw: segment.start_time,
        endTimeRaw: segment.end_time,
        durationMinutes: segment.duration_minutes,
        photoCount: segment.image_ids.length,
        travelMode: segment.travel_mode,
        travelDistanceKm: segment.travel_distance_km,
      }))

      const segmentYears = mappedSegments
        .map((segment) => new Date(segment.startTimeRaw).getFullYear())
        .filter((year) => !Number.isNaN(year))
      const includeYear = new Set(segmentYears).size > 1

      setPreview(apiResults)
      setTimelineSections(groupSegmentsByDay(mappedSegments, includeYear))
      setImageUrlMap(new Map(imageUrls))
      setMapDays([])
      setMapLoading(true)
      setTitle(formatJournalTitle(apiResults))
      setInitialJournalName(buildInitialJournalName(mappedSegments))
      setStep('result')
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Failed to generate journal preview.')
      setStep('upload')
    }
  }

  return (
    <div className="journal-page-shell">
      <div className={`journal-stage-card ${step === 'map' ? 'journal-stage-card--wide' : ''}`}>
        {step === 'upload' && (
          <JournalUpload onGenerate={handleGenerate} onOpenPreview={openPreviewResult} />
        )}

        {step === 'loading' && (
          <div className="journal-loading-shell">
            <div className="journal-loading-orb" aria-hidden="true">
              <div className="journal-loading-ring" />
              <div className="journal-loading-core">
                <BookText />
              </div>
            </div>
            <h3>Crafting your journal preview</h3>
            <p>
              EXIF filtering, observation grouping, and segment classification are running now.
            </p>
          </div>
        )}

        {step === 'result' && preview && (
          <JournalResult
            title={title}
            initialJournalName={initialJournalName}
            sections={timelineSections}
            rejectedCount={preview.counts.rejected_images}
            observationCount={preview.counts.observations}
            onDiscard={() => setStep('upload')}
            onNext={() => setStep('map')}
            canOpenMap={!mapLoading && mapDays.length > 0}
            mapLoading={mapLoading}
          />
        )}

        {step === 'map' && <JournalMapPreview days={mapDays} onBack={() => setStep('result')} />}
      </div>
    </div>
  )
}
