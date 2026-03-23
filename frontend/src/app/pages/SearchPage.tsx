import { useState, type ChangeEvent } from 'react'

import { travelWorkflow } from '../data'
import { SearchActionCard } from '../search/components/SearchActionCard'
import { SearchResults } from '../search/components/SearchResults'
import { emptyUploadState, searchMocks } from '../search/data'
import type { SearchMode, SearchPageProps, UploadState } from '../search/types'
import { getUploadValidationError } from '../search/utils'

export function SearchPage({
  isLoggedIn,
  selectedContext,
  selectedContextId,
  contextOptions,
  onSelectContext,
  onOpenPage,
}: SearchPageProps) {
  const [activeMockMode, setActiveMockMode] = useState<SearchMode | null>(null)
  const [placeUpload, setPlaceUpload] = useState<UploadState>(emptyUploadState)
  const [foodUpload, setFoodUpload] = useState<UploadState>(emptyUploadState)

  const activeMock = activeMockMode ? searchMocks[activeMockMode] : null
  const isPlaceReady = Boolean(placeUpload.fileName) && !placeUpload.error
  const isFoodReady = Boolean(foodUpload.fileName) && !foodUpload.error

  const updateUploadState = (mode: SearchMode, nextState: UploadState) => {
    if (mode === 'place') {
      setPlaceUpload(nextState)
      return
    }

    setFoodUpload(nextState)
  }

  const handleImageUpload = (mode: SearchMode) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const uploadError = getUploadValidationError(file)

    if (uploadError) {
      updateUploadState(mode, { fileName: '', error: uploadError })
      setActiveMockMode(null)
      event.target.value = ''
      return
    }

    updateUploadState(mode, { fileName: file.name, error: '' })
    setActiveMockMode(null)
  }

  return (
    <div className="stack-xl">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Search</p>
          <h2>Photo intelligence workspace</h2>
        </div>
        <p className="section-copy">
          One page for landmark search, food-photo restaurant discovery, and the route handoff that
          follows both.
        </p>
      </section>

      <section className="search-grid">
        <SearchActionCard
          title="Place from photo"
          detail="Designed for travel scenes, landmarks, streets, museums, and scenic shots."
          uploadLabel="Drop a travel photo here"
          uploadDescription="Read EXIF first, then run landmark and visual similarity analysis if metadata is weak."
          uploadState={placeUpload}
          isReady={isPlaceReady}
          workflowItems={travelWorkflow}
          onImageUpload={handleImageUpload('place')}
          onShow={() => setActiveMockMode('place')}
          onSearch={() => setActiveMockMode('place')}
        >
          <div className="field-grid">
            <label className="field">
              <span>Country hint</span>
              <input type="text" placeholder="Japan" />
            </label>
            <label className="field">
              <span>City hint</span>
              <input type="text" placeholder="Kyoto" />
            </label>
          </div>

          <label className="field">
            <span>Search note</span>
            <textarea
              rows={4}
              defaultValue="Use this when the place is hard to detect or the photo is visually similar to many spots."
            />
          </label>
        </SearchActionCard>

        <SearchActionCard
          title="Food photo branch"
          detail="Use food type, country, city, and recent uploads to estimate restaurant candidates."
          uploadLabel="Drop a meal photo here"
          uploadDescription="The layout assumes cuisine detection first, then restaurant search refined by user hints and recent personal photo context."
          uploadState={foodUpload}
          isReady={isFoodReady}
          isWarm
          onImageUpload={handleImageUpload('food')}
          onShow={() => setActiveMockMode('food')}
          onSearch={() => setActiveMockMode('food')}
        >
          <div className="field-grid">
            <label className="field">
              <span>Country</span>
              <input type="text" placeholder="South Korea" />
            </label>
            <label className="field">
              <span>City</span>
              <input type="text" placeholder="Seoul" />
            </label>
          </div>

          <label className="field">
            <span>Recent uploaded photos</span>
            <div className="context-pills">
              {contextOptions.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  className={`context-pill ${selectedContextId === photo.id ? 'is-selected' : ''}`}
                  onClick={() => onSelectContext(photo.id)}
                >
                  {photo.title}
                </button>
              ))}
            </div>
          </label>

          <div className="context-card">
            <span className="pill">{selectedContext.type}</span>
            <strong>{selectedContext.title}</strong>
            <p>
              Recent context: {selectedContext.location}. {selectedContext.insight}
            </p>
          </div>
        </SearchActionCard>
      </section>

      {activeMock ? (
        <SearchResults result={activeMock} isLoggedIn={isLoggedIn} onOpenPage={onOpenPage} />
      ) : null}
    </div>
  )
}
