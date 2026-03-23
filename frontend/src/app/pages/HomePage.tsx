import { foodWorkflow, metrics, travelWorkflow } from '../data'
import { SectionIntro } from '../components/SectionIntro'
import { WorkflowList } from '../components/WorkflowList'
import type { PageId } from '../types'

type HomePageProps = {
  isLoggedIn: boolean
  onOpenPage: (page: PageId) => void
}

export function HomePage({ isLoggedIn, onOpenPage }: HomePageProps) {
  return (
    <div className="stack-xl">
      <section className="hero-grid">
        <div className="panel accent-panel">
          <p className="eyebrow">Home</p>
          <h2 className="hero-title">
            Find where a photo was taken, then extend the same trip memory into restaurant guidance
            when the photo is the food.
          </h2>
          <p className="hero-copy">
            This shell combines the original travel-photo route flow with the new food-photo branch.
            A user can upload a place, infer the destination, and open directions. If the upload is
            a meal, the UI pivots into cuisine recognition, regional hints, recent photo context,
            and restaurant recommendations.
          </p>

          <div className="hero-actions">
            <button type="button" className="button-primary" onClick={() => onOpenPage('search')}>
              Open Search Workspace
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => onOpenPage('gallery')}
            >
              View My Gallery
            </button>
          </div>
        </div>

        <aside className="panel spotlight-panel">
          <SectionIntro
            title="Current scope"
            detail="The frontend is organized around the assignment constraints and the features you described."
          />
          <div className="badge-row">
            <span className="pill">Responsive layout</span>
            <span className="pill">Media upload flow</span>
            <span className="pill">Login-gated gallery</span>
          </div>
          <ul className="bullet-list">
            <li>Travel photo search with EXIF, landmark, and hint-based place estimation.</li>
            <li>Food photo search with cuisine detection and restaurant recommendation framing.</li>
            <li>Mock authenticated view for private uploads and profile-only history.</li>
            <li>Live chat marked as backlog, not part of this first frontend delivery.</li>
          </ul>
          <div className="callout">
            <strong>Gallery access</strong>
            <p>{isLoggedIn ? 'Unlocked for the current mock user.' : 'Locked until sign-in.'}</p>
          </div>
        </aside>
      </section>

      <section className="metric-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="panel metric-card">
            <span className="metric-label">{metric.label}</span>
            <strong className="metric-value">{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="dual-grid">
        <article className="panel content-panel">
          <SectionIntro
            title="Travel photo flow"
            detail="A route-ready UI path for landmarks, scenery, and uploaded place memories."
          />
          <WorkflowList items={travelWorkflow} />
        </article>

        <article className="panel content-panel">
          <SectionIntro
            title="Food discovery flow"
            detail="A second branch for food photos that leans on cuisine recognition and saved context."
          />
          <WorkflowList items={foodWorkflow} />
        </article>
      </section>
    </div>
  )
}
