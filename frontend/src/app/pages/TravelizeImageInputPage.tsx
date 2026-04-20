import type { ChangeEvent } from 'react'

import { SectionIntro } from '../components/SectionIntro'
import type { GalleryGroup } from '../types'
import { maxTravelizeImages } from '../travelize/data'
import type { TravelizeInputImage } from '../travelize/types'

type TravelizeImageInputPageProps = {
  galleryGroups: GalleryGroup[]
  selectedImages: TravelizeInputImage[]
  onAddUploads: (files: File[]) => void
  onLoadGalleryGroup: (group: GalleryGroup) => void
  onRemoveImage: (imageId: string) => void
  onBack: () => void
  onAnalyze: () => void
}

export function TravelizeImageInputPage({
  galleryGroups,
  selectedImages,
  onAddUploads,
  onLoadGalleryGroup,
  onRemoveImage,
  onBack,
  onAnalyze,
}: TravelizeImageInputPageProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    onAddUploads(files)
    event.target.value = ''
  }

  return (
    <div className="stack-xl">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Travelize</p>
          <h2>Page 2. Image input</h2>
        </div>
        <p className="section-copy">
          This page supports both direct uploads and full gallery-group import. Up to 30 images can
          be staged for the temporary flow.
        </p>
      </section>

      <section className="travelize-upload-grid">
        <article className="panel content-panel">
          <SectionIntro
            title="Direct upload"
            detail="Upload a new set of travel images directly into the Travelize input list."
          />
          <label className="upload-zone upload-zone--large">
            <span className="zone-kicker">Direct upload</span>
            <strong>Upload multiple images for Travelize</strong>
            <p>At this skeleton stage, valid image files are added directly into the staged list.</p>
            <span className="upload-picker">
              <input type="file" accept="image/*" multiple onChange={handleFileChange} />
              Choose images
            </span>
          </label>
        </article>

        <article className="panel content-panel">
          <SectionIntro
            title="Load a gallery group"
            detail="Bring in an existing gallery group as a batch into the Travelize image list."
          />
          <div className="travelize-group-list">
            {galleryGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                className="travelize-group-card"
                onClick={() => onLoadGalleryGroup(group)}
              >
                <strong>{group.title}</strong>
                <span>{group.city}</span>
                <small>{group.images.length} images</small>
              </button>
            ))}
          </div>
        </article>
      </section>

      <article className="panel content-panel">
        <SectionIntro
          title="Selected images"
          detail="Review every uploaded or imported image here and remove individual items before analysis."
        />
        <div className="travelize-selected-head">
          <strong>
            {selectedImages.length} / {maxTravelizeImages} selected
          </strong>
          <span className="field-note">Use the X button on each card to remove that image.</span>
        </div>
        <div className="travelize-selected-list">
          {selectedImages.length === 0 ? (
            <div className="travelize-empty-card">No images are currently selected.</div>
          ) : (
            selectedImages.map((image) => (
              <div key={image.id} className="travelize-selected-item">
                <div className={`travelize-thumb photo-frame photo-frame--${image.theme}`}>
                  <span className="photo-badge">{image.source}</span>
                  <strong>{image.name}</strong>
                </div>
                <div className="travelize-selected-copy">
                  <strong>{image.name}</strong>
                  <span>{image.sourceLabel}</span>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onRemoveImage(image.id)}
                  aria-label={`Remove ${image.name}`}
                >
                  X
                </button>
              </div>
            ))
          )}
        </div>

        <div className="travelize-page-actions">
          <button type="button" className="button-secondary" onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={onAnalyze}
            disabled={selectedImages.length === 0}
          >
            Analyze images
          </button>
        </div>
      </article>
    </div>
  )
}
