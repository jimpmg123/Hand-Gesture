import type { GalleryGroup } from '../types'
import type {
  TravelizeAnalysisResult,
  TravelizeDayPlan,
  TravelizeInputImage,
  TravelizePlaceRow,
  TravelizeSetup,
} from './types'

type RegionMatch = {
  kind: 'country' | 'city'
  country: string
  city: string | null
}

type PlaceTemplate = {
  placeName: string
  country: string
  city: string
  address: string
  latitude: number
  longitude: number
}

const travelizeThemes: TravelizeInputImage['theme'][] = ['coast', 'city', 'market', 'night']

const placeTemplates: PlaceTemplate[] = [
  {
    placeName: 'Gyeongbokgung Palace',
    country: 'South Korea',
    city: 'Seoul',
    address: '161 Sajik-ro, Jongno-gu, Seoul, South Korea',
    latitude: 37.579617,
    longitude: 126.977041,
  },
  {
    placeName: 'Haeundae Beach',
    country: 'South Korea',
    city: 'Busan',
    address: '264 Haeundaehaebyeon-ro, Busan, South Korea',
    latitude: 35.158698,
    longitude: 129.160384,
  },
  {
    placeName: 'Fushimi Inari Shrine',
    country: 'Japan',
    city: 'Kyoto',
    address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto, Japan',
    latitude: 34.96714,
    longitude: 135.772671,
  },
  {
    placeName: 'Kiyomizu-dera',
    country: 'Japan',
    city: 'Kyoto',
    address: '294 Kiyomizu, Higashiyama Ward, Kyoto, Japan',
    latitude: 34.994856,
    longitude: 135.785046,
  },
  {
    placeName: 'Tokyo Tower',
    country: 'Japan',
    city: 'Tokyo',
    address: '4 Chome-2-8 Shibakoen, Minato City, Tokyo, Japan',
    latitude: 35.658581,
    longitude: 139.745433,
  },
  {
    placeName: 'Umeda Sky Building',
    country: 'Japan',
    city: 'Osaka',
    address: '1 Chome-1-88 Oyodonaka, Kita Ward, Osaka, Japan',
    latitude: 34.705493,
    longitude: 135.489985,
  },
  {
    placeName: 'Colosseum',
    country: 'Italy',
    city: 'Rome',
    address: 'Piazza del Colosseo, 1, Rome, Italy',
    latitude: 41.89021,
    longitude: 12.492231,
  },
]

const regionDictionary: Array<{
  terms: string[]
  kind: 'country' | 'city'
  country: string
  city: string | null
}> = [
  { terms: ['south korea', 'korea'], kind: 'country', country: 'South Korea', city: null },
  { terms: ['japan'], kind: 'country', country: 'Japan', city: null },
  { terms: ['italy'], kind: 'country', country: 'Italy', city: null },
  { terms: ['seoul'], kind: 'city', country: 'South Korea', city: 'Seoul' },
  { terms: ['busan'], kind: 'city', country: 'South Korea', city: 'Busan' },
  { terms: ['ulsan'], kind: 'city', country: 'South Korea', city: 'Ulsan' },
  { terms: ['kyoto'], kind: 'city', country: 'Japan', city: 'Kyoto' },
  { terms: ['tokyo'], kind: 'city', country: 'Japan', city: 'Tokyo' },
  { terms: ['osaka'], kind: 'city', country: 'Japan', city: 'Osaka' },
  { terms: ['rome'], kind: 'city', country: 'Italy', city: 'Rome' },
]

export const defaultTravelizeSetup: TravelizeSetup = {
  tripDays: 3,
  startDate: '2026-04-10',
  wakeUpTime: '08:00',
  departureTime: '07:30',
  regionInput: '',
  openAiHint: '',
}

export const maxTravelizeImages = 30

export function createTravelizeUploadItems(files: File[]): TravelizeInputImage[] {
  return files.map((file, index) => ({
    id: `upload-${file.name}-${file.size}-${index}`,
    name: file.name,
    source: 'upload',
    sourceLabel: 'Direct upload',
    theme: travelizeThemes[index % travelizeThemes.length],
  }))
}

export function createTravelizeGalleryItems(group: GalleryGroup): TravelizeInputImage[] {
  return group.images.map((image) => ({
    id: `gallery-${group.id}-${image.id}`,
    name: image.title,
    source: 'gallery',
    sourceLabel: group.title,
    theme: image.theme,
  }))
}

export function buildTravelizeAnalysisResults(
  images: TravelizeInputImage[],
  regionInput: string,
): TravelizeAnalysisResult[] {
  const baseResults = images.map((image, index) => buildBaseResult(image, index))
  const expectedRegion = parseRegion(regionInput)
  const successfulCoordinates = baseResults.filter(
    (result) =>
      result.latitude !== null &&
      result.longitude !== null &&
      result.source !== 'Failed',
  )

  return baseResults.map((result) => {
    if (!expectedRegion || result.source === 'Failed') {
      return result
    }

    const resultLatitude = result.latitude
    const resultLongitude = result.longitude

    const hasNearbySupport =
      resultLatitude !== null &&
      resultLongitude !== null &&
      successfulCoordinates.some((candidate) => {
        if (
          candidate.imageId === result.imageId ||
          candidate.latitude === null ||
          candidate.longitude === null
        ) {
          return false
        }

        return (
          distanceKm(
            resultLatitude,
            resultLongitude,
            candidate.latitude,
            candidate.longitude,
          ) <= 100
        )
      })

    if (expectedRegion.kind === 'country') {
      if (result.country === expectedRegion.country || hasNearbySupport) {
        return hasNearbySupport && result.country !== expectedRegion.country
          ? {
              ...result,
              status: 'warning',
              includeInPlan: true,
              message:
                'The resolved country does not match the input, but it was temporarily accepted because another image is within 100 km.',
            }
          : result
      }

      return {
        ...result,
        status: 'failed',
        includeInPlan: false,
        source: 'Failed',
        latitude: null,
        longitude: null,
        message:
          'Location extraction failed because the resolved country does not match the user input.',
      }
    }

    if (result.country !== expectedRegion.country) {
      if (hasNearbySupport) {
        return {
          ...result,
          status: 'warning',
          includeInPlan: true,
          message:
            'The resolved city belongs to a different country, but it was temporarily accepted because another image is within 100 km.',
        }
      }

      return {
        ...result,
        status: 'failed',
        includeInPlan: false,
        source: 'Failed',
        latitude: null,
        longitude: null,
        message:
          'Location extraction failed because the resolved city is outside the expected country scope.',
      }
    }

    if (result.city !== expectedRegion.city) {
      return {
        ...result,
        status: 'warning',
        includeInPlan: true,
        message: `The coordinates were resolved in ${result.city}.`,
      }
    }

    return result
  })
}

export function buildTravelizePlaceRows(results: TravelizeAnalysisResult[]): TravelizePlaceRow[] {
  return results
    .map((result) => ({
      id: `place-${result.imageId}`,
      sourceImageId: result.imageId,
      placeName: result.placeName,
      city: result.city,
      coordinates:
        result.latitude !== null && result.longitude !== null
          ? `${result.latitude.toFixed(5)}, ${result.longitude.toFixed(5)}`
          : '',
      status: result.status,
      date: result.imageId.includes('gallery') ? 'Grouped gallery item' : 'Uploaded item',
    }))
}

export function buildTravelizeDayPlans(
  results: TravelizeAnalysisResult[],
  setup: TravelizeSetup,
): TravelizeDayPlan[] {
  const successful = results.filter((result) => result.includeInPlan)
  const days = Array.from({ length: setup.tripDays }, (_, index) => ({
    day: index + 1,
    rows: [] as TravelizeDayPlan['rows'],
  }))

  if (successful.length === 0) {
    return days
  }

  successful.forEach((result, index) => {
    const targetDay = index % setup.tripDays
    days[targetDay].rows.push({
      id: `day-${targetDay + 1}-${result.imageId}`,
      sourceImageId: result.imageId,
      manualImageName: '',
      placeName: result.placeName,
      date: addDays(setup.startDate, targetDay),
      time: buildTimeValue(setup.wakeUpTime, index),
      note:
        targetDay === 0 && index === 0
          ? 'Recommended as the first stop after departure'
          : 'Auto-distributed by the current route-order mock',
      isUserAdded: false,
    })
  })

  return days
}

export function buildTravelizeTimelineTitle(results: TravelizeAnalysisResult[]): string {
  const successful = results.filter((result) => result.includeInPlan)

  if (successful.length === 0) {
    return 'Trip timeline'
  }

  const uniqueCountries = [...new Set(successful.map((result) => result.country))]
  const uniqueCities = [...new Set(successful.map((result) => result.city))]

  if (uniqueCountries.length === 1 && uniqueCities.length === 1) {
    return `${uniqueCities[0]} trip timeline`
  }

  if (uniqueCountries.length === 1) {
    return `${uniqueCountries[0]} trip timeline`
  }

  return 'Multi-country trip timeline'
}

function buildBaseResult(image: TravelizeInputImage, index: number): TravelizeAnalysisResult {
  const pattern = index % 4
  const template = placeTemplates[index % placeTemplates.length]

  if (pattern === 3) {
    return {
      imageId: image.id,
      imageName: image.name,
      sourceImage: image,
      source: 'Failed',
      status: 'failed',
      includeInPlan: false,
      placeName: 'Location unresolved',
      country: '',
      city: '',
      address: 'No reliable coordinates were produced from EXIF, landmark detection, or OpenAI.',
      latitude: null,
      longitude: null,
      message: 'Location extraction failed.',
    }
  }

  const source = pattern === 0 ? 'EXIF' : pattern === 1 ? 'Landmark' : 'OpenAI'
  const message =
    source === 'EXIF'
      ? 'GPS coordinates were taken directly from image metadata.'
      : source === 'Landmark'
        ? 'Coordinates were created from the top landmark recognition result.'
        : 'Coordinates were temporarily assigned from an OpenAI estimate.'

  return {
    imageId: image.id,
    imageName: image.name,
    sourceImage: image,
    source,
    status: source === 'OpenAI' ? 'warning' : 'success',
    includeInPlan: true,
    placeName: template.placeName,
    country: template.country,
    city: template.city,
    address: template.address,
    latitude: template.latitude,
    longitude: template.longitude,
    message,
  }
}

function parseRegion(regionInput: string): RegionMatch | null {
  const normalized = regionInput.trim().toLowerCase()

  if (!normalized) {
    return null
  }

  const matched = regionDictionary.find((entry) => entry.terms.includes(normalized))

  if (!matched) {
    return null
  }

  return {
    kind: matched.kind,
    country: matched.country,
    city: matched.city,
  }
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const deltaLat = toRad(lat2 - lat1)
  const deltaLon = toRad(lon2 - lon1)
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(deltaLon / 2) ** 2

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a))
}

function addDays(dateValue: string, daysToAdd: number) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  date.setDate(date.getDate() + daysToAdd)

  const nextYear = date.getFullYear()
  const nextMonth = `${date.getMonth() + 1}`.padStart(2, '0')
  const nextDay = `${date.getDate()}`.padStart(2, '0')

  return `${nextYear}-${nextMonth}-${nextDay}`
}

function buildTimeValue(wakeUpTime: string, offset: number) {
  const [hourValue, minuteValue] = wakeUpTime.split(':').map(Number)
  const baseHour = Number.isFinite(hourValue) ? hourValue : 8
  const baseMinute = Number.isFinite(minuteValue) ? minuteValue : 0
  const minutes = baseHour * 60 + baseMinute + offset * 90
  const hour = `${Math.floor(minutes / 60) % 24}`.padStart(2, '0')
  const minute = `${minutes % 60}`.padStart(2, '0')

  return `${hour}:${minute}`
}
