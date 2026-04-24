import type { SearchApiImageResponse, SearchUploadAnalysis, SearchUploadItem } from './types'

const SEARCH_API_URL = 'http://localhost:8000/api/image'

export async function analyzeSearchUploads(
  files: File[],
  uploads: SearchUploadItem[],
  hints: {
    countryHint: string
    cityHint: string
  },
): Promise<SearchUploadAnalysis[]> {
  const { cityHint, countryHint } = hints
  const tasks = uploads.map((upload, index) => {
    const file = files[index]
    const formData = new FormData()
    formData.append('file', file)

    if (countryHint.trim()) {
      formData.append('country_hint', countryHint.trim())
    }

    if (cityHint.trim()) {
      formData.append('city_hint', cityHint.trim())
    }

    return (async () => {
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
    })()
  })

  return Promise.all(tasks)
}
