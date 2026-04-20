import { SectionIntro } from '../components/SectionIntro'
import type { TravelizeAnalysisResult } from '../travelize/types'

type TravelizeAnalysisPageProps = {
  results: TravelizeAnalysisResult[]
  onBack: () => void
  onNext: () => void
}

export function TravelizeAnalysisPage({
  results,
  onBack,
  onNext,
}: TravelizeAnalysisPageProps) {
  const validCount = results.filter((result) => result.includeInPlan).length

  return (
    <div className="stack-xl">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Travelize</p>
          <h2>Page 3. Image analysis results</h2>
        </div>
        <p className="section-copy">
          Review each image&apos;s resolved address, place name, saved coordinates, and failure state
          before moving into itinerary generation.
        </p>
      </section>

      <article className="panel content-panel">
        <SectionIntro
          title="Analysis summary"
          detail="Only successful or warning-level images move into the plan page. Failed images are excluded."
        />
        <div className="badge-row">
          <span className="pill">Total {results.length}</span>
          <span className="pill">Included {validCount}</span>
          <span className="pill">Failed {results.length - validCount}</span>
        </div>
      </article>

      <section className="travelize-analysis-list">
        {results.map((result) => (
          <article key={result.imageId} className="panel content-panel travelize-analysis-card">
            <div className="travelize-analysis-card__header">
              <div>
                <strong>{result.imageName}</strong>
                <p>{result.placeName}</p>
              </div>
              <span className={`travelize-status travelize-status--${result.status}`}>
                {result.status}
              </span>
            </div>

            <div className="travelize-analysis-grid">
              <div>
                <span className="metric-label">Source</span>
                <strong>{result.source}</strong>
              </div>
              <div>
                <span className="metric-label">Address</span>
                <strong>{result.address}</strong>
              </div>
              <div>
                <span className="metric-label">Coordinates</span>
                <strong>
                  {result.latitude !== null && result.longitude !== null
                    ? `${result.latitude.toFixed(5)}, ${result.longitude.toFixed(5)}`
                    : ''}
                </strong>
              </div>
              <div>
                <span className="metric-label">Plan handling</span>
                <strong>{result.includeInPlan ? 'Included in Travelize' : 'Excluded from plan'}</strong>
              </div>
            </div>

            <p className="muted-copy">{result.message}</p>
          </article>
        ))}
      </section>

      <div className="travelize-page-actions">
        <button type="button" className="button-secondary" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="button-primary"
          onClick={onNext}
          disabled={validCount === 0}
        >
          Open plan
        </button>
      </div>
    </div>
  )
}
