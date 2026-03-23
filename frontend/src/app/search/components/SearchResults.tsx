import { SectionIntro } from '../../components/SectionIntro'
import type { PageNavigator } from '../../types'
import type { MockResult } from '../types'

type SearchResultsProps = {
  result: MockResult
  isLoggedIn: boolean
  onOpenPage: PageNavigator
}

export function SearchResults({ result, isLoggedIn, onOpenPage }: SearchResultsProps) {
  return (
    <section className="panel content-panel search-results-shell">
      <section className="section-heading results-heading">
        <div>
          <p className="eyebrow">{result.label}</p>
          <h2>{result.heading}</h2>
        </div>
        <div className="results-heading-side">
          <button
            type="button"
            className="button-secondary save-gallery-button"
            onClick={() => onOpenPage('gallery')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10l1.4 1.7c.28.33.69.53 1.12.53H17.5A2.5 2.5 0 0 1 20 8.73v7.77A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-10Z"
                fill="currentColor"
              />
              <path
                d="M12 9.25v4.1m0 0-1.65-1.65M12 13.35l1.65-1.65"
                stroke="#fffaf0"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
            <span>Save to Gallery</span>
          </button>
          <p className="section-copy">{result.subheading}</p>
        </div>
      </section>

      <div className="analysis-hero">
        <div className="map-placeholder">
          <div className="map-placeholder-head">
            <span className="pill">Placeholder Map</span>
            <span className="pill">{result.topCandidate.score}% confidence</span>
          </div>
          <div className="map-placeholder-center">
            <strong>{result.topCandidate.placeholderNote}</strong>
            <p>{result.topCandidate.title}</p>
            <span>{result.topCandidate.coordinates}</span>
          </div>
        </div>

        <aside className="focus-card">
          <span className="result-label">Highest confidence</span>
          <h3>{result.topCandidate.title}</h3>
          <p>{result.topCandidate.location}</p>
          <div className="confidence-pill">{result.topCandidate.score}%</div>
          <p className="focus-card-copy">{result.topCandidate.detail}</p>
        </aside>
      </div>

      <div className="candidate-stack">
        <SectionIntro
          title="Other candidates"
          detail="These lower-ranked matches are mock placeholders until the search APIs are connected."
        />
        <div className="candidate-list">
          {result.candidates.map((candidate) => (
            <article key={candidate.title} className="candidate-row">
              <div className="candidate-thumb">
                <span>Placeholder</span>
              </div>
              <div className="candidate-copy">
                <strong>{candidate.title}</strong>
                <p>{candidate.location}</p>
                <small>{candidate.detail}</small>
              </div>
              <div className="candidate-score">
                <span>{candidate.score}%</span>
                <small>confidence</small>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="details-layout">
        <article className="details-card">
          <SectionIntro
            title="Location Estimate Details"
            detail="API-backed values will replace these placeholders after backend integration."
          />
          <div className="details-placeholder-list">
            {result.sourcePlaceholders.map((item) => (
              <div key={item.label} className="details-placeholder-item">
                <strong>{item.label}</strong>
                <p>{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="details-card">
          <SectionIntro
            title="Inferred keywords"
            detail="These are temporary location-related keywords to show how the final UI will read."
          />
          <div className="keyword-cloud">
            {result.keywords.map((keyword) => (
              <span key={keyword} className="keyword-chip">
                {keyword}
              </span>
            ))}
          </div>

          <div className="possibility-block">
            <strong>Other location possibilities</strong>
            <div className="possibility-list">
              {result.possibilities.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="mini-map-placeholder">Placeholder mini-map for alternative points</div>
          </div>
        </article>
      </div>

      <div className="search-results-footer">
        {!isLoggedIn ? (
          <button type="button" className="button-secondary" onClick={() => onOpenPage('sign-in')}>
            Sign in to save this result
          </button>
        ) : (
          <button type="button" className="button-secondary" onClick={() => onOpenPage('gallery')}>
            Open Gallery history
          </button>
        )}
      </div>
    </section>
  )
}
