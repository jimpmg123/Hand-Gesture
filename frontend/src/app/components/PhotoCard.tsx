import type { GalleryGroup } from '../types'

type PhotoCardProps = {
  group: GalleryGroup
  onRename: (groupId: number, title: string) => void
  onViewImages: (group: GalleryGroup) => void
}

export function PhotoCard({ group, onRename, onViewImages }: PhotoCardProps) {
  return (
    <article className="panel photo-card">
      <div className={`photo-frame photo-frame--${group.theme}`}>
        <span className="photo-badge">{group.type}</span>
        <strong>{group.title}</strong>
        <p>{group.city}</p>
      </div>
      <div className="photo-meta">
        <span>{group.lastUpdate}</span>
        <span>{group.images.length} images</span>
      </div>
      <div className="photo-copy-block">
        <div className="rename-row">
          <strong>{group.title}</strong>
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              const nextTitle = window.prompt('Rename gallery group', group.title)
              if (nextTitle && nextTitle.trim()) {
                onRename(group.id, nextTitle.trim())
              }
            }}
            aria-label="Rename gallery group"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="m4 16.5 9.9-9.9 3.5 3.5-9.9 9.9L4 20l.1-3.5Zm11.34-10.94 1.2-1.2a1.5 1.5 0 0 1 2.12 0l1 1a1.5 1.5 0 0 1 0 2.12l-1.2 1.2-3.12-3.12Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <p>{group.description}</p>
      </div>
      <div className="photo-actions">
        <button type="button" className="button-primary" onClick={() => onViewImages(group)}>
          View Images
        </button>
        <button type="button" className="button-secondary">
          Open Guide
        </button>
      </div>
    </article>
  )
}
