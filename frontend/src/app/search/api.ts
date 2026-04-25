import type { SearchApiImageResponse, SearchUploadAnalysis, SearchUploadItem } from './types'

const SEARCH_API_URL = 'http://localhost:8000/api/image'

async function analyzeSingleUpload(
  upload: SearchUploadItem,
  hints: {
    countryHint: string
    cityHint: string
    userHint?: string
    forceOpenaiRetry?: boolean
  },
): Promise<SearchUploadAnalysis> {
  const { cityHint, countryHint, forceOpenaiRetry, userHint } = hints
  const formData = new FormData()
  formData.append('file', upload.file)

  if (countryHint.trim()) {
    formData.append('country_hint', countryHint.trim())
  }

  if (cityHint.trim()) {
    formData.append('city_hint', cityHint.trim())
  }

  if (userHint?.trim()) {
    formData.append('user_hint', userHint.trim())
  }

  if (forceOpenaiRetry) {
    formData.append('force_openai_retry', 'true')
  }

  try {
    const response = await fetch(SEARCH_API_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const body = await response.text()
      return {
        uploadId: upload.id,
        ok: false,
        error: `Backend request failed (${response.status}). ${body || 'No response body.'}`.trim(),
      } satisfies SearchUploadAnalysis
    }

    const payload = (await response.json()) as SearchApiImageResponse
    return {
      uploadId: upload.id,
      ok: true,
      response: payload,
    } satisfies SearchUploadAnalysis
  } catch (error) {
    return {
      uploadId: upload.id,
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'The backend request failed before a response was returned.',
    } satisfies SearchUploadAnalysis
  }
}

export async function analyzeSearchUploads(
  uploads: SearchUploadItem[],
  hints: {
    countryHint: string
    cityHint: string
  },
): Promise<SearchUploadAnalysis[]> {
  const tasks = uploads.map((upload) => analyzeSingleUpload(upload, hints))
  return Promise.all(tasks)
}

export async function retryFailedSearchUpload(
  upload: SearchUploadItem,
  hints: {
    countryHint: string
    cityHint: string
    userHint: string
  },
): Promise<SearchUploadAnalysis> {
  return analyzeSingleUpload(upload, {
    ...hints,
    forceOpenaiRetry: true,
  })
}
