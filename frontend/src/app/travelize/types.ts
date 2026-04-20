import type { GalleryImage, PhotoEntry } from '../types'

export type TravelizeSetup = {
  tripDays: number
  startDate: string
  wakeUpTime: string
  departureTime: string
  regionInput: string
  openAiHint: string
}

export type TravelizeInputImage = {
  id: string
  name: string
  source: 'upload' | 'gallery'
  sourceLabel: string
  theme: PhotoEntry['theme'] | GalleryImage['theme']
}

export type TravelizeAnalysisSource = 'EXIF' | 'Landmark' | 'OpenAI' | 'Failed'
export type TravelizeAnalysisStatus = 'success' | 'warning' | 'failed'

export type TravelizeAnalysisResult = {
  imageId: string
  imageName: string
  sourceImage: TravelizeInputImage
  source: TravelizeAnalysisSource
  status: TravelizeAnalysisStatus
  includeInPlan: boolean
  placeName: string
  country: string
  city: string
  address: string
  latitude: number | null
  longitude: number | null
  message: string
}

export type TravelizePlaceRow = {
  id: string
  sourceImageId: string
  placeName: string
  city: string
  coordinates: string
  status: TravelizeAnalysisStatus
  date: string
}

export type TravelizeDayPlanRow = {
  id: string
  sourceImageId: string | null
  manualImageName: string
  placeName: string
  date: string
  time: string
  note: string
  isUserAdded: boolean
}

export type TravelizeDayPlan = {
  day: number
  rows: TravelizeDayPlanRow[]
}
