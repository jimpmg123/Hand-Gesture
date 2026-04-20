import { useRef, useState, type ChangeEvent } from 'react'

import { SectionIntro } from '../components/SectionIntro'
import {
  buildTravelizeDayPlans,
  buildTravelizePlaceRows,
  buildTravelizeTimelineTitle,
} from '../travelize/data'
import type {
  TravelizeAnalysisResult,
  TravelizeDayPlan,
  TravelizeDayPlanRow,
  TravelizeInputImage,
  TravelizeSetup,
} from '../travelize/types'

type TravelizePlanPageProps = {
  setup: TravelizeSetup
  images: TravelizeInputImage[]
  results: TravelizeAnalysisResult[]
  onBack: () => void
}

type TravelizeTab = 'places' | number

export function TravelizePlanPage({
  setup,
  images,
  results,
  onBack,
}: TravelizePlanPageProps) {
  const [activeTab, setActiveTab] = useState<TravelizeTab>('places')
  const [plans, setPlans] = useState<TravelizeDayPlan[]>(() => buildTravelizeDayPlans(results, setup))
  const [savedMessage, setSavedMessage] = useState('')
  const [previewImageId, setPreviewImageId] = useState<string | null>(null)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const [pendingUploadRowId, setPendingUploadRowId] = useState<string | null>(null)

  const placeRows = buildTravelizePlaceRows(results)
  const timelineTitle = buildTravelizeTimelineTitle(results)
  const previewImage = images.find((image) => image.id === previewImageId) ?? null

  const handleRowChange = (
    day: number,
    rowId: string,
    field: keyof TravelizeDayPlanRow,
    value: string,
  ) => {
    setPlans((current) =>
      current.map((plan) =>
        plan.day !== day
          ? plan
          : {
              ...plan,
              rows: plan.rows.map((row) =>
                row.id === rowId ? { ...row, [field]: value } : row,
              ),
            },
      ),
    )
  }

  const handleInsertRow = (day: number, index: number) => {
    setPlans((current) =>
      current.map((plan) => {
        if (plan.day !== day) {
          return plan
        }

        const nextRows = [...plan.rows]
        nextRows.splice(index + 1, 0, {
          id: `manual-${day}-${Date.now()}-${index}`,
          sourceImageId: null,
          manualImageName: '',
          placeName: '',
          date: plan.rows[index]?.date ?? '',
          time: '',
          note: '',
          isUserAdded: true,
        })

        return { ...plan, rows: nextRows }
      }),
    )
  }

  const handleDeleteRow = (day: number, rowId: string) => {
    setPlans((current) =>
      current.map((plan) =>
        plan.day !== day
          ? plan
          : {
              ...plan,
              rows: plan.rows.filter((row) => row.id !== rowId),
            },
      ),
    )
  }

  const handleSaveDraft = () => {
    localStorage.setItem(
      'travelize-plan-draft',
      JSON.stringify({
        setup,
        plans,
        updatedAt: new Date().toISOString(),
      }),
    )
    setSavedMessage('Travelize draft was saved to browser local storage.')
  }

  const handleManualImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file || !pendingUploadRowId) {
      return
    }

    setPlans((current) =>
      current.map((plan) => ({
        ...plan,
        rows: plan.rows.map((row) =>
          row.id === pendingUploadRowId ? { ...row, manualImageName: file.name } : row,
        ),
      })),
    )
    setPendingUploadRowId(null)
    event.target.value = ''
  }

  const renderPlaceTable = () => (
    <div className="travelize-table-wrap">
      <table className="travelize-table">
        <thead>
          <tr>
            <th>Place</th>
            <th>City</th>
            <th>Coordinates</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {placeRows.map((row) => (
            <tr key={row.id}>
              <td>
                <div className="travelize-cell-main">
                  <span>{row.placeName}</span>
                  <button
                    type="button"
                    className="travelize-inline-button"
                    onClick={() => setPreviewImageId(row.sourceImageId)}
                  >
                    Image
                  </button>
                </div>
              </td>
              <td>{row.city}</td>
              <td>{row.coordinates}</td>
              <td>
                <span className={`travelize-status travelize-status--${row.status}`}>{row.status}</span>
              </td>
              <td>{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderDayTable = (plan: TravelizeDayPlan) => (
    <div className="travelize-day-stack">
      <div className="travelize-table-wrap">
        <table className="travelize-table">
          <thead>
            <tr>
              <th>Place</th>
              <th>Date</th>
              <th>Time</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {plan.rows.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <div className="travelize-edit-cell">
                    <input
                      type="text"
                      value={row.placeName}
                      onChange={(event) =>
                        handleRowChange(plan.day, row.id, 'placeName', event.target.value)
                      }
                      placeholder="Enter a place"
                    />
                    {row.sourceImageId ? (
                      <button
                        type="button"
                        className="travelize-inline-button"
                        onClick={() => setPreviewImageId(row.sourceImageId)}
                      >
                        Image
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="travelize-inline-button"
                        onClick={() => {
                          setPendingUploadRowId(row.id)
                          uploadInputRef.current?.click()
                        }}
                      >
                        {row.manualImageName ? row.manualImageName : 'Upload'}
                      </button>
                    )}
                  </div>
                  {row.isUserAdded ? <small className="field-note">User-added row</small> : null}
                </td>
                <td>
                  <input
                    type="date"
                    value={row.date}
                    onChange={(event) => handleRowChange(plan.day, row.id, 'date', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    value={row.time}
                    onChange={(event) => handleRowChange(plan.day, row.id, 'time', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.note}
                    onChange={(event) => handleRowChange(plan.day, row.id, 'note', event.target.value)}
                    placeholder="Transit, lodging, stay duration note"
                  />
                </td>
                <td className="travelize-add-cell">
                  <div className="travelize-row-actions">
                    <button
                      type="button"
                      className="travelize-add-row"
                      onClick={() => handleInsertRow(plan.day, index)}
                      aria-label={`Insert row after ${row.placeName || 'this item'}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="travelize-delete-row"
                      onClick={() => handleDeleteRow(plan.day, row.id)}
                      aria-label={`Delete ${row.placeName || 'this row'}`}
                    >
                      -
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {plan.rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="travelize-empty-card">No places are currently assigned to this day.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <>
      <div className="stack-xl">
        <section className="section-heading">
          <div>
            <p className="eyebrow">Travelize</p>
            <h2>Page 4. Final itinerary editor</h2>
          </div>
          <div className="hero-actions">
            <button type="button" className="button-secondary" onClick={onBack}>
              Back to analysis
            </button>
            <button type="button" className="button-primary" onClick={handleSaveDraft}>
              Save plan
            </button>
          </div>
        </section>

        <article className="panel content-panel">
          <SectionIntro
            title="Uploaded image strip"
            detail="Review every uploaded image in a horizontal strip before or during itinerary edits."
          />
          <div className="travelize-image-strip">
            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                className={`travelize-image-chip photo-frame photo-frame--${image.theme}`}
                onClick={() => setPreviewImageId(image.id)}
              >
                <span className="photo-badge">{image.source}</span>
                <strong>{image.name}</strong>
              </button>
            ))}
          </div>
        </article>

        <article className="panel content-panel">
          <div className="travelize-timeline-head">
            <div>
              <p className="eyebrow">{timelineTitle}</p>
              <h3>Trip timeline</h3>
            </div>
            <div className="badge-row">
              <span className="pill">Start {setup.startDate}</span>
              <span className="pill">{setup.tripDays} days</span>
              <span className="pill">Wake-up {setup.wakeUpTime}</span>
            </div>
          </div>

          <div className="travelize-tabs">
            <button
              type="button"
              className={`context-pill ${activeTab === 'places' ? 'is-selected' : ''}`}
              onClick={() => setActiveTab('places')}
            >
              Places
            </button>
            {plans.map((plan) => (
              <button
                key={plan.day}
                type="button"
                className={`context-pill ${activeTab === plan.day ? 'is-selected' : ''}`}
                onClick={() => setActiveTab(plan.day)}
              >
                Day {plan.day}
              </button>
            ))}
          </div>

          {activeTab === 'places'
            ? renderPlaceTable()
            : renderDayTable(plans.find((plan) => plan.day === activeTab) ?? plans[0])}

          {savedMessage ? <p className="field-note">{savedMessage}</p> : null}
        </article>
      </div>

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleManualImageUpload}
      />

      {previewImage ? (
        <div className="image-modal-overlay" role="dialog" aria-modal="true">
          <div className="image-modal">
            <div className="image-modal-close-row">
              <button type="button" className="icon-button" onClick={() => setPreviewImageId(null)}>
                X
              </button>
            </div>
            <div className={`image-modal-preview photo-frame photo-frame--${previewImage.theme}`}>
              <div className="image-modal-preview-copy">
                <span className="photo-badge">{previewImage.source}</span>
                <strong>{previewImage.name}</strong>
                <p>{previewImage.sourceLabel}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
