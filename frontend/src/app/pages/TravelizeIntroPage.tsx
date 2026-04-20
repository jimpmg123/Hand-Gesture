import { SectionIntro } from '../components/SectionIntro'
import type { TravelizeSetup } from '../travelize/types'

type TravelizeIntroPageProps = {
  setup: TravelizeSetup
  onSetupChange: (patch: Partial<TravelizeSetup>) => void
  onNext: () => void
  onOpenSearch: () => void
}

export function TravelizeIntroPage({
  setup,
  onSetupChange,
  onNext,
  onOpenSearch,
}: TravelizeIntroPageProps) {
  return (
    <div className="stack-xl">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Travelize</p>
          <h2>Build your trip timeline from image-based location results</h2>
        </div>
        <button type="button" className="button-secondary" onClick={onOpenSearch}>
          Back to Search
        </button>
      </section>

      <section className="travelize-layout">
        <article className="panel content-panel travelize-main-card">
          <SectionIntro
            title="Page 1. Trip setup"
            detail="Set the trip length and optional region check first, then preview the final table layout with a mock itinerary."
          />

          <div className="travelize-mock-board">
            <div className="travelize-mock-board__header">
              <strong>Mock itinerary preview</strong>
              <span className="pill">Page 4 output example</span>
            </div>
            <div className="travelize-table-wrap">
              <table className="travelize-table">
                <thead>
                  <tr>
                    <th>Place</th>
                    <th>City</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Fushimi Inari Shrine</td>
                    <td>Kyoto</td>
                    <td>2026-04-10</td>
                  </tr>
                  <tr>
                    <td>Kiyomizu-dera</td>
                    <td>Kyoto</td>
                    <td>2026-04-10</td>
                  </tr>
                  <tr>
                    <td>Tokyo Tower</td>
                    <td>Tokyo</td>
                    <td>2026-04-11</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="travelize-duration-row">
            {[1, 2, 3, 4, 5].map((day) => (
              <button
                key={day}
                type="button"
                className={`context-pill ${setup.tripDays === day ? 'is-selected' : ''}`}
                onClick={() => onSetupChange({ tripDays: day })}
              >
                {day} day{day > 1 ? 's' : ''}
              </button>
            ))}
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Start date</span>
              <input
                type="date"
                value={setup.startDate}
                onChange={(event) => onSetupChange({ startDate: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Wake-up time</span>
              <input
                type="time"
                value={setup.wakeUpTime}
                onChange={(event) => onSetupChange({ wakeUpTime: event.target.value })}
              />
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Planned departure time</span>
              <input
                type="time"
                value={setup.departureTime}
                onChange={(event) => onSetupChange({ departureTime: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Travel region (optional)</span>
              <input
                type="text"
                value={setup.regionInput}
                onChange={(event) => onSetupChange({ regionInput: event.target.value })}
                placeholder="Japan or Kyoto"
              />
            </label>
          </div>

          <div className="travelize-page-actions">
            <button type="button" className="button-secondary" onClick={onOpenSearch}>
              Return to Search
            </button>
            <button type="button" className="button-primary" onClick={onNext}>
              Next step
            </button>
          </div>
        </article>

        <aside className="panel sidebar-panel">
          <div className="travelize-sidebar-stack">
            <div>
              <SectionIntro
                title="Values fixed at this step"
                detail="Trip length, start date, wake-up time, departure time, and optional region check all carry forward into the analysis and plan pages."
              />
              <ul className="bullet-list">
                <li>The travel region field is optional.</li>
                <li>The region value is used only for location validation against image coordinates.</li>
                <li>The current Travelize flow is still a mock frontend skeleton before backend integration.</li>
              </ul>
            </div>

            <div className="travelize-hint-panel">
              <label className="field">
                <span>Optional OpenAI hint</span>
                <textarea
                  rows={8}
                  value={setup.openAiHint}
                  onChange={(event) => onSetupChange({ openAiHint: event.target.value })}
                  placeholder="Example: I remember a riverside street, light rain, and mountains in the distance. The trip was somewhere in western Japan."
                />
              </label>
              <p className="field-note">
                Free-form notes written here are intended for the OpenAI fallback step when image-only
                location inference is weak.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
