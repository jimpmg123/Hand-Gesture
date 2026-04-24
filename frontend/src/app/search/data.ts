import type {
  SearchImageResult,
  SearchResultBundle,
  SearchUploadAnalysis,
  SearchUploadItem,
  UploadState,
} from './types'

export const maxUploadSizeBytes = 30 * 1024 * 1024

export const emptyUploadState: UploadState = {
  fileName: '',
  error: '',
}

export function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024)
  return `${megabytes.toFixed(1)} MB`
}

function formatHintLocation(countryHint: string, cityHint: string): string {
  if (cityHint && countryHint) {
    return `${cityHint}, ${countryHint}`
  }

  return cityHint || countryHint || 'No hint provided'
}

function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}

function summarizeVisualResult(summary: unknown): string | null {
  if (typeof summary === 'string' && summary.trim()) {
    return summary
  }

  if (summary && typeof summary === 'object') {
    const scene = 'scene' in summary ? summary.scene : null
    const gate = 'gate' in summary ? summary.gate : null

    if (typeof scene === 'string' && typeof gate === 'string') {
      return `${scene} (${gate})`
    }

    try {
      return JSON.stringify(summary)
    } catch {
      return 'Visual analysis completed, but the summary could not be formatted.'
    }
  }

  return null
}

function toSearchImageResult(
  upload: SearchUploadItem,
  analysis: SearchUploadAnalysis | undefined,
  countryHint: string,
): SearchImageResult {
  if (!analysis) {
    return {
      id: upload.id,
      imageName: upload.fileName,
      previewUrl: upload.previewUrl,
      status: 'failed',
      source: 'Upload request failed',
      summary: 'The frontend did not receive any backend response for this image.',
      coordinates: null,
      address: null,
      latitude: null,
      longitude: null,
      resolutionPath: 'Request failed',
      resolutionNote: 'The backend did not return any analysis payload for this image.',
    }
  }

  if (!analysis.ok) {
    return {
      id: upload.id,
      imageName: upload.fileName,
      previewUrl: upload.previewUrl,
      status: 'failed',
      source: 'Upload request failed',
      summary: analysis.error,
      coordinates: null,
      address: null,
      latitude: null,
      longitude: null,
      resolutionPath: 'Request failed',
      resolutionNote: 'The HTTP request failed before image analysis could complete.',
    }
  }

  const gps = analysis.response.gps
  const resolvedLocation = analysis.response.resolved_location
  const latitude = resolvedLocation?.latitude ?? gps?.latitude
  const longitude = resolvedLocation?.longitude ?? gps?.longitude
  const hasCoordinates = latitude != null && longitude != null
  const visualSummary = summarizeVisualResult(analysis.response.summary)
  const resolutionSource = analysis.response.resolution_source
  const sourceLabel =
    resolutionSource === 'landmark_detection'
      ? 'Landmark detection'
      : resolutionSource === 'openai_location'
        ? 'OpenAI fallback'
        : resolutionSource === 'clip_gate'
          ? 'CLIP gate rejection'
          : analysis.response.has_gps
            ? 'GPS metadata'
            : 'Missing GPS metadata'
  const locationLabel =
    resolvedLocation?.formatted_address ||
    (analysis.response.city && analysis.response.city !== 'Unknown Location'
      ? [analysis.response.city, countryHint].filter(Boolean).join(', ')
      : null)

  if (hasCoordinates) {
    return {
      id: upload.id,
      imageName: analysis.response.file_name || upload.fileName,
      previewUrl: upload.previewUrl,
      status: 'saved',
      source: sourceLabel,
      summary:
        visualSummary || `${sourceLabel} resolved coordinates and returned a location label.`,
      coordinates: formatCoordinates(latitude, longitude),
      address: locationLabel,
      latitude,
      longitude,
      resolutionPath: sourceLabel,
      resolutionNote: `This result was accepted through ${sourceLabel.toLowerCase()}.`,
    }
  }

  return {
    id: upload.id,
    imageName: analysis.response.file_name || upload.fileName,
    previewUrl: upload.previewUrl,
    status: 'failed',
    source: sourceLabel,
    summary:
      analysis.response.failure_reason ||
      resolvedLocation?.failure_reason ||
      visualSummary ||
      'The current backend flow could not recover coordinates because the image did not include EXIF GPS data.',
    coordinates: null,
    address: locationLabel,
    latitude: null,
    longitude: null,
    resolutionPath: sourceLabel,
    resolutionNote:
      analysis.response.failure_reason ||
      resolvedLocation?.failure_reason ||
      'No coordinates were returned by the current search pipeline.',
  }
}

export function buildSearchResultBundle(params: {
  countryHint: string
  cityHint: string
  uploads: SearchUploadItem[]
  analyses: SearchUploadAnalysis[]
}): SearchResultBundle {
  const { analyses, cityHint, countryHint, uploads } = params
  const locationLabel = formatHintLocation(countryHint, cityHint)

  const results = uploads.map((upload) =>
    toSearchImageResult(
      upload,
      analyses.find((analysis) => analysis.uploadId === upload.id),
      countryHint,
    ),
  )

  const savedResults = results.filter((result) => result.status === 'saved')
  const failedResults = results.length - savedResults.length

  return {
    heading: 'Image search results',
    subheading:
      'Each uploaded image shows whether EXIF GPS coordinates were available, which city label was recovered, and what visual summary was produced.',
    topResolved: savedResults[0] ?? null,
    results,
    summaryCards: [
      {
        label: 'Uploaded images',
        value: `${uploads.length}`,
        detail: 'All selected images were sent to the backend image search route.',
      },
      {
        label: 'Resolved',
        value: `${savedResults.length}`,
        detail: 'These images returned coordinates through EXIF GPS or fallback inference.',
      },
      {
        label: 'Unresolved',
        value: `${failedResults}`,
        detail: 'These images did not return coordinates in the current backend flow.',
      },
      {
        label: 'Search hints',
        value: locationLabel,
        detail: 'Country and city are optional frontend hints in the current image search flow.',
      },
    ],
  }
}
