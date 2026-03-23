import type { ChangeEvent, ReactNode } from 'react'

import { SectionIntro } from '../../components/SectionIntro'
import { WorkflowList } from '../../components/WorkflowList'
import type { WorkflowItem } from '../../types'
import type { UploadState } from '../types'

type SearchActionCardProps = {
  title: string
  detail: string
  uploadDescription: string
  uploadLabel: string
  uploadState: UploadState
  isReady: boolean
  isWarm?: boolean
  workflowItems?: WorkflowItem[]
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onShow: () => void
  onSearch: () => void
  children: ReactNode
}

export function SearchActionCard({
  title,
  detail,
  uploadDescription,
  uploadLabel,
  uploadState,
  isReady,
  isWarm = false,
  workflowItems,
  onImageUpload,
  onShow,
  onSearch,
  children,
}: SearchActionCardProps) {
  return (
    <article className="panel content-panel search-action-card">
      <SectionIntro title={title} detail={detail} />

      <div className={`upload-zone ${isWarm ? 'warm' : ''}`}>
        <span className="zone-kicker">Upload area</span>
        <strong>{uploadLabel}</strong>
        <p>{uploadDescription}</p>
        <div className="upload-actions">
          <label className="upload-picker">
            <input type="file" accept="image/*" onChange={onImageUpload} />
            Choose image
          </label>
          <span className={`upload-status ${isReady ? 'is-ready' : ''}`}>
            {uploadState.fileName
              ? `Uploaded: ${uploadState.fileName}`
              : 'Any image type up to 30MB is accepted for this mock flow.'}
          </span>
        </div>
      </div>

      {uploadState.error ? <p className="field-error">{uploadState.error}</p> : null}

      {children}

      {workflowItems ? <WorkflowList items={workflowItems} compact /> : null}

      <div className="search-card-footer">
        <button type="button" className="button-secondary" onClick={onShow}>
          Show
        </button>
        <button type="button" className="button-primary" onClick={onSearch} disabled={!isReady}>
          Search
        </button>
      </div>
    </article>
  )
}
