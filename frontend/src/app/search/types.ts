import type { PageId, PhotoEntry } from '../types'

export type SearchMode = 'place' | 'food'

export type CandidateItem = {
  title: string
  location: string
  score: number
  detail: string
}

export type MockResult = {
  label: string
  heading: string
  subheading: string
  topCandidate: CandidateItem & {
    coordinates: string
    placeholderNote: string
  }
  candidates: CandidateItem[]
  sourcePlaceholders: { label: string; value: string }[]
  keywords: string[]
  possibilities: string[]
}

export type UploadState = {
  fileName: string
  error: string
}

export type SearchPageProps = {
  isLoggedIn: boolean
  selectedContext: PhotoEntry
  selectedContextId: number
  contextOptions: PhotoEntry[]
  onSelectContext: (id: number) => void
  onOpenPage: (page: PageId) => void
}
