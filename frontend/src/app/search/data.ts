import type { MockResult, SearchMode, UploadState } from './types'

export const emptyUploadState: UploadState = {
  fileName: '',
  error: '',
}

export const maxUploadSizeBytes = 30 * 1024 * 1024

export const searchMocks: Record<SearchMode, MockResult> = {
  place: {
    label: 'Travel photo result',
    heading: 'Top estimated location',
    subheading: 'The center map area stays a placeholder until the maps API is connected.',
    topCandidate: {
      title: 'Igidae coastal overlook',
      location: 'Busan, South Korea',
      score: 91,
      coordinates: '35.1123, 129.1214',
      detail: 'Pier lines, sunrise lighting, and coastline geometry point to a harbor viewpoint.',
      placeholderNote: 'Large map placeholder for the best location candidate',
    },
    candidates: [
      {
        title: 'Gwangalli waterfront deck',
        location: 'Busan, South Korea',
        score: 84,
        detail: 'Another harbor-adjacent candidate with a similar sunrise composition.',
      },
      {
        title: 'Songdo skywalk edge',
        location: 'Busan, South Korea',
        score: 76,
        detail: 'Boardwalk shape and ocean framing make this a secondary possibility.',
      },
      {
        title: 'Haeundae marina lookout',
        location: 'Busan, South Korea',
        score: 68,
        detail: 'Waterfront density fits, but the skyline match is weaker than the top result.',
      },
    ],
    sourcePlaceholders: [
      {
        label: 'Landmark source placeholder',
        value: 'Placeholder for the landmark API response and confidence summary.',
      },
      {
        label: 'Address source placeholder',
        value: 'Placeholder for reverse-geocoded address text after coordinates are confirmed.',
      },
      {
        label: 'Directions source placeholder',
        value: 'Placeholder for route duration and transport mode once navigation is connected.',
      },
    ],
    keywords: ['harbor', 'coastline', 'pier', 'sunrise', 'bayfront', 'viewpoint'],
    possibilities: ['Marine City edge', 'Oryukdo coast trail', 'Songjeong waterfront'],
  },
  food: {
    label: 'Food photo result',
    heading: 'Top restaurant-area estimate',
    subheading: 'The large map block is a placeholder until the restaurant search map is connected.',
    topCandidate: {
      title: 'Lantern Alley Ramen House',
      location: 'Kyoto, Japan',
      score: 88,
      coordinates: '35.0037, 135.7788',
      detail:
        'Nighttime alley cues, ramen bowl styling, and recent travel context point to a Kyoto dining district.',
      placeholderNote: 'Large map placeholder for the best restaurant-area candidate',
    },
    candidates: [
      {
        title: 'Gion Corner Noodle Bar',
        location: 'Kyoto, Japan',
        score: 81,
        detail: 'Historic street feel and lantern ambience align with the uploaded meal context.',
      },
      {
        title: 'Pontocho Late Supper',
        location: 'Kyoto, Japan',
        score: 73,
        detail: 'Narrow alley dining and dense night lighting make this a nearby possibility.',
      },
      {
        title: 'Station-side Ramen Stop',
        location: 'Kyoto, Japan',
        score: 64,
        detail: 'The cuisine fit is strong, but the neighborhood cues are less specific.',
      },
    ],
    sourcePlaceholders: [
      {
        label: 'Cuisine source placeholder',
        value: 'Placeholder for food-category, cuisine, and style output from the food analysis step.',
      },
      {
        label: 'Places source placeholder',
        value: 'Placeholder for ranked restaurant candidates once the places API is connected.',
      },
      {
        label: 'Directions source placeholder',
        value: 'Placeholder for restaurant route details after the destination is selected.',
      },
    ],
    keywords: ['lantern alley', 'historic district', 'night dining', 'narrow street', 'station block'],
    possibilities: ['Gion dining lane', 'Pontocho riverside strip', 'Kyoto station food row'],
  },
}
