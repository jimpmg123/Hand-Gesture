import { ImageModal } from '../components/ImageModal'
import type { GalleryGroup, GalleryImage } from '../types'

type ImagesPageProps = {
  group: GalleryGroup
  selectedImage: GalleryImage | null
  onBack: () => void
  onOpenImage: (image: GalleryImage) => void
  onCloseImage: () => void
  onNavigateImage: (direction: 'prev' | 'next') => void
}

export function ImagesPage({
  group,
  selectedImage,
  onBack,
  onOpenImage,
  onCloseImage,
  onNavigateImage,
}: ImagesPageProps) {
  return (
    <>
      <div className="stack-xl">
        <section className="section-heading">
          <div>
            <p className="eyebrow">Images</p>
            <h2>{group.title}</h2>
          </div>
          <button type="button" className="button-secondary" onClick={onBack}>
            Back to Gallery
          </button>
        </section>

        <div className="badge-row">
          <span className="pill">{group.type}</span>
          <span className="pill">{group.city}</span>
        </div>

        <p className="section-copy">
          All images saved in this collection. Click a thumbnail to open a larger preview and move
          through the set.
        </p>

        <section className="image-grid">
          {group.images.map((image) => (
            <button
              key={image.id}
              type="button"
              className="image-thumb-card"
              onClick={() => onOpenImage(image)}
            >
              <div className={`image-thumb-frame photo-frame photo-frame--${image.theme}`}>
                <span className="photo-badge">{image.category}</span>
                <strong>{image.title}</strong>
              </div>
              <div className="image-thumb-meta">
                <span>{image.date}</span>
                <span>{image.category}</span>
              </div>
            </button>
          ))}
        </section>
      </div>

      <ImageModal
        image={selectedImage}
        images={group.images}
        onClose={onCloseImage}
        onNavigate={onNavigateImage}
      />
    </>
  )
}
