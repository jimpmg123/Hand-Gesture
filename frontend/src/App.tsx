import { useState, useTransition } from 'react'
import './App.css'

type PageId = 'home' | 'search' | 'gallery' | 'profile'
type Role = 'traveler' | 'admin'

type NavItem = {
  id: PageId
  label: string
  hint: string
}

type Metric = {
  label: string
  value: string
  detail: string
}

type PhotoEntry = {
  id: number
  title: string
  location: string
  date: string
  type: 'Landmark' | 'Food'
  insight: string
  nextStep: string
  theme: 'coast' | 'city' | 'market' | 'night'
}

type WorkflowItem = {
  title: string
  detail: string
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', hint: 'overview' },
  { id: 'search', label: 'Search', hint: 'photo + food workflows' },
  { id: 'gallery', label: 'Gallery', hint: 'my uploads' },
  { id: 'profile', label: 'Profile', hint: 'account + settings' },
]

const metrics: Metric[] = [
  {
    label: 'Main journey',
    value: 'Photo -> place -> route',
    detail: 'Travel photos are resolved through EXIF, landmark cues, and user hints.',
  },
  {
    label: 'Food extension',
    value: 'Meal -> cuisine -> restaurant',
    detail: 'Food images can branch into restaurant discovery with location hints and recent uploads.',
  },
  {
    label: 'Required access',
    value: 'Mock sign-in ready',
    detail: 'Gallery access is gated so the signed-in flow already exists in the frontend.',
  },
  {
    label: 'Course fit',
    value: 'Responsive + media-based',
    detail: 'The shell is built around upload-first interactions across desktop and mobile.',
  },
]

const uploadedPhotos: PhotoEntry[] = [
  {
    id: 1,
    title: 'Sunrise at the harbor',
    location: 'Busan, South Korea',
    date: '2026-03-08',
    type: 'Landmark',
    insight: 'Pier geometry and coastline cues suggest a harbor observation point.',
    nextStep: 'Open place estimate and compare with nearby viewpoints.',
    theme: 'coast',
  },
  {
    id: 2,
    title: 'Lantern alley dinner',
    location: 'Kyoto, Japan',
    date: '2026-03-06',
    type: 'Food',
    insight: 'Likely ramen set. Use recent travel photos plus city hint to narrow restaurant candidates.',
    nextStep: 'Search nearby ramen restaurants and build the final route.',
    theme: 'market',
  },
  {
    id: 3,
    title: 'Museum plaza',
    location: 'Chicago, United States',
    date: '2026-03-01',
    type: 'Landmark',
    insight: 'Strong skyline silhouette and plaza layout support a downtown landmark search.',
    nextStep: 'Confirm the exact plaza, then request directions from current location.',
    theme: 'city',
  },
  {
    id: 4,
    title: 'Night snack stop',
    location: 'Taipei, Taiwan',
    date: '2026-02-24',
    type: 'Food',
    insight: 'Street-food plate with neon ambience fits market-style restaurant discovery.',
    nextStep: 'Use night market context and saved uploads to rank nearby stalls.',
    theme: 'night',
  },
]

const travelWorkflow: WorkflowItem[] = [
  {
    title: '1. Upload a travel photo',
    detail: 'Start with EXIF coordinates, then fall back to landmark and visual feature matching.',
  },
  {
    title: '2. Add hints only when needed',
    detail: 'Country and city inputs help reduce the candidate pool when the image is ambiguous.',
  },
  {
    title: '3. Return a route-ready destination',
    detail: 'The final output should be a place card that can open guidance immediately.',
  },
]

const foodWorkflow: WorkflowItem[] = [
  {
    title: '1. Detect cuisine from the meal',
    detail: 'Food photos branch into cuisine recognition before trying to identify a restaurant area.',
  },
  {
    title: '2. Reuse recent uploads',
    detail:
      'The latest travel photos act as soft evidence for region, city, and nearby restaurant context.',
  },
  {
    title: '3. Suggest where to go',
    detail: 'The result is a ranked list of restaurant candidates plus a route entry point.',
  },
]

const profileNotes: WorkflowItem[] = [
  {
    title: 'Saved hints',
    detail: 'Preferred countries, cities, and transport modes can prefill future searches.',
  },
  {
    title: 'Privacy controls',
    detail: 'Photo history and extracted EXIF data should be visible only to the signed-in owner.',
  },
  {
    title: 'Beta delivery',
    detail: 'This layout keeps deployment and login entry points visible from the start.',
  },
]

const adminQueue: WorkflowItem[] = [
  {
    title: 'Review uploaded media',
    detail: 'Scan unclear uploads before they become shared examples or public content.',
  },
  {
    title: 'Check reported results',
    detail: 'Users can flag bad place guesses or incorrect restaurant matches for review.',
  },
  {
    title: 'Monitor future live chat',
    detail: 'Real-time chat is deferred, but the admin view reserves room for moderation later.',
  },
]

function App() {
  const [activePage, setActivePage] = useState<PageId>('home')
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [role, setRole] = useState<Role>('traveler')
  const [selectedContextId, setSelectedContextId] = useState(uploadedPhotos[1].id)
  const [isPending, startTransition] = useTransition()

  const selectedContext =
    uploadedPhotos.find((photo) => photo.id === selectedContextId) ?? uploadedPhotos[0]

  const openPage = (page: PageId) => {
    startTransition(() => {
      setActivePage(page)
    })
  }

  const toggleLogin = () => {
    setIsLoggedIn((current) => !current)
  }

  const toggleRole = () => {
    setRole((current) => (current === 'traveler' ? 'admin' : 'traveler'))
  }

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-a" />
      <div className="backdrop backdrop-b" />
      <div className="app-frame">
        <header className="topbar panel">
          <div className="brand-block">
            <p className="eyebrow">Travel From Photo</p>
            <div className="brand-row">
              <h1>AI travel and food memory navigator</h1>
              <span className="pill">frontend beta shell</span>
            </div>
            <p className="brand-copy">
              Designed around upload-first discovery, route guidance, and a signed-in personal
              gallery.
            </p>
          </div>

          <nav className="nav-links" aria-label="Primary">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-pill ${activePage === item.id ? 'is-active' : ''}`}
                onClick={() => openPage(item.id)}
              >
                <span>{item.label}</span>
                <small>{item.hint}</small>
              </button>
            ))}
          </nav>

          <div className="auth-cluster">
            <div className="auth-summary">
              <span className="status-dot" aria-hidden="true" />
              <div>
                <strong>{isLoggedIn ? 'Signed in as Jinu Hong' : 'Guest preview mode'}</strong>
                <p>
                  {isLoggedIn
                    ? `${role === 'traveler' ? 'Traveler' : 'Admin'} view enabled`
                    : 'Gallery remains locked until sign-in'}
                </p>
              </div>
              {isPending ? <span className="pending-badge">Switching view...</span> : null}
            </div>

            <div className="auth-actions">
              <button type="button" className="button-secondary" onClick={toggleRole}>
                Role: {role === 'traveler' ? 'Traveler' : 'Admin'}
              </button>
              <button type="button" className="button-primary" onClick={toggleLogin}>
                {isLoggedIn ? 'Mock Sign Out' : 'Mock Sign In'}
              </button>
            </div>
          </div>
        </header>

        <main className="page-surface">
          {activePage === 'home' ? (
            <HomePage isLoggedIn={isLoggedIn} onOpenPage={openPage} />
          ) : null}
          {activePage === 'search' ? (
            <SearchPage
              isLoggedIn={isLoggedIn}
              selectedContext={selectedContext}
              selectedContextId={selectedContextId}
              onSelectContext={setSelectedContextId}
              onOpenPage={openPage}
            />
          ) : null}
          {activePage === 'gallery' ? (
            <GalleryPage isLoggedIn={isLoggedIn} onOpenPage={openPage} />
          ) : null}
          {activePage === 'profile' ? <ProfilePage isLoggedIn={isLoggedIn} role={role} /> : null}
        </main>
      </div>
    </div>
  )
}

function HomePage({
  isLoggedIn,
  onOpenPage,
}: {
  isLoggedIn: boolean
  onOpenPage: (page: PageId) => void
}) {
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
        <article className="panel">
          <SectionIntro
            title="Travel photo flow"
            detail="A route-ready UI path for landmarks, scenery, and uploaded place memories."
          />
          <div className="workflow-list">
            {travelWorkflow.map((item) => (
              <div key={item.title} className="workflow-item">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <SectionIntro
            title="Food discovery flow"
            detail="A second branch for food photos that leans on cuisine recognition and saved context."
          />
          <div className="workflow-list">
            {foodWorkflow.map((item) => (
              <div key={item.title} className="workflow-item">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function SearchPage({
  isLoggedIn,
  selectedContext,
  selectedContextId,
  onSelectContext,
  onOpenPage,
}: {
  isLoggedIn: boolean
  selectedContext: PhotoEntry
  selectedContextId: number
  onSelectContext: (id: number) => void
  onOpenPage: (page: PageId) => void
}) {
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
        <article className="panel">
          <SectionIntro
            title="Place from photo"
            detail="Designed for travel scenes, landmarks, streets, museums, and scenic shots."
          />
          <div className="upload-zone">
            <span className="zone-kicker">Upload area</span>
            <strong>Drop a travel photo here</strong>
            <p>
              Read EXIF first, then run landmark and visual similarity analysis if metadata is weak.
            </p>
          </div>
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
          <div className="workflow-list compact">
            {travelWorkflow.map((item) => (
              <div key={item.title} className="workflow-item">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <SectionIntro
            title="Food photo branch"
            detail="Use food type, country, city, and recent uploads to estimate restaurant candidates."
          />
          <div className="upload-zone warm">
            <span className="zone-kicker">Upload area</span>
            <strong>Drop a meal photo here</strong>
            <p>
              The layout assumes cuisine detection first, then restaurant search refined by user
              hints and recent personal photo context.
            </p>
          </div>
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
              {uploadedPhotos.map((photo) => (
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
        </article>
      </section>

      <section className="dual-grid">
        <article className="panel">
          <SectionIntro
            title="Expected outputs"
            detail="These cards reserve space for backend results when the APIs are wired in."
          />
          <div className="result-grid">
            <div className="result-card">
              <span className="result-label">Likely place</span>
              <strong>Place candidate card</strong>
              <p>Photo match confidence, coordinates, and a quick compare with alternatives.</p>
            </div>
            <div className="result-card">
              <span className="result-label">Restaurant candidates</span>
              <strong>Food-aware discovery list</strong>
              <p>Restaurant ranking based on cuisine type, hint inputs, and saved travel context.</p>
            </div>
            <div className="result-card">
              <span className="result-label">Route preview</span>
              <strong>Directions entry point</strong>
              <p>
                Transit, walking, or driving handoff once the destination or restaurant is chosen.
              </p>
            </div>
          </div>
        </article>

        <article className="panel">
          <SectionIntro
            title="Roadmap notes"
            detail="The live-chat requirement is visible here, but intentionally marked as a later step."
          />
          <div className="workflow-list">
            {foodWorkflow.map((item) => (
              <div key={item.title} className="workflow-item">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="callout subtle">
            <strong>Deferred: real-time chat</strong>
            <p>
              Keep this for a later milestone after photo analysis, result ranking, and route
              guidance are stable.
            </p>
          </div>
          {!isLoggedIn ? (
            <button
              type="button"
              className="button-secondary"
              onClick={() => onOpenPage('profile')}
            >
              Open Profile to preview sign-in flow
            </button>
          ) : (
            <button
              type="button"
              className="button-secondary"
              onClick={() => onOpenPage('gallery')}
            >
              Open Gallery history
            </button>
          )}
        </article>
      </section>
    </div>
  )
}

function GalleryPage({
  isLoggedIn,
  onOpenPage,
}: {
  isLoggedIn: boolean
  onOpenPage: (page: PageId) => void
}) {
  if (!isLoggedIn) {
    return (
      <section className="locked-shell">
        <div className="panel locked-card">
          <p className="eyebrow">Gallery</p>
          <h2>Private upload gallery</h2>
          <p>
            This page is reserved for signed-in users so they can review their own uploaded photos,
            open the detected place, and jump into guidance.
          </p>
          <div className="hero-actions">
            <button type="button" className="button-primary" onClick={() => onOpenPage('profile')}>
              Go to Profile
            </button>
            <button type="button" className="button-secondary" onClick={() => onOpenPage('search')}>
              Back to Search
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="stack-xl">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Gallery</p>
          <h2>My uploaded photos</h2>
        </div>
        <p className="section-copy">
          Signed-in users can review photo history, revisit estimated places, and open the guidance
          path from each saved memory.
        </p>
      </section>

      <section className="gallery-layout">
        <div className="gallery-grid">
          {uploadedPhotos.map((photo) => (
            <article key={photo.id} className="panel photo-card">
              <div className={`photo-frame photo-frame--${photo.theme}`}>
                <span className="photo-badge">{photo.type}</span>
                <strong>{photo.title}</strong>
                <p>{photo.location}</p>
              </div>
              <div className="photo-meta">
                <span>{photo.date}</span>
                <span>{photo.type}</span>
              </div>
              <p>{photo.insight}</p>
              <div className="photo-actions">
                <button type="button" className="button-secondary">
                  View Place
                </button>
                <button type="button" className="button-primary">
                  Open Guide
                </button>
              </div>
              <small>{photo.nextStep}</small>
            </article>
          ))}
        </div>

        <aside className="panel sidebar-panel">
          <SectionIntro
            title="Gallery notes"
            detail="This sidebar keeps private-user behavior visible in the shell."
          />
          <ul className="bullet-list">
            <li>Photos here belong only to the signed-in account.</li>
            <li>Each card reserves buttons for place details and route guidance.</li>
            <li>Food memories can reopen the restaurant-discovery branch from Search.</li>
          </ul>
          <div className="callout">
            <strong>Next backend handoff</strong>
            <p>Replace these mock cards with actual uploads, predictions, and navigation links.</p>
          </div>
        </aside>
      </section>
    </div>
  )
}

function ProfilePage({
  isLoggedIn,
  role,
}: {
  isLoggedIn: boolean
  role: Role
}) {
  return (
    <div className="stack-xl">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Account and saved context</h2>
        </div>
        <p className="section-copy">
          This page reserves space for login status, preferences, private history controls, and an
          admin view if needed.
        </p>
      </section>

      <section className="profile-grid">
        <article className="panel profile-card">
          <div className="avatar-ring">
            <span>JH</span>
          </div>
          <div>
            <h3>Jinu Hong</h3>
            <p className="muted-copy">
              {isLoggedIn
                ? 'Signed in with a mock secure session.'
                : 'Browsing in guest preview mode.'}
            </p>
          </div>
          <div className="badge-row">
            <span className="pill">{role === 'traveler' ? 'Traveler' : 'Admin'} view</span>
            <span className="pill">{isLoggedIn ? 'Gallery enabled' : 'Gallery locked'}</span>
          </div>
        </article>

        <article className="panel">
          <SectionIntro
            title="Saved preferences"
            detail="Inputs here can later personalize search defaults and routing behavior."
          />
          <div className="workflow-list compact">
            {profileNotes.map((item) => (
              <div key={item.title} className="workflow-item">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <SectionIntro
            title="Recent activity snapshot"
            detail="A simple summary area for uploads, saved places, and restaurant lookups."
          />
          <div className="result-grid">
            <div className="result-card">
              <span className="result-label">Uploads</span>
              <strong>4 recent photos</strong>
              <p>Landmark and food memories are mixed into the same personal timeline.</p>
            </div>
            <div className="result-card">
              <span className="result-label">Saved routes</span>
              <strong>2 draft guides</strong>
              <p>Reserved for future directions and shareable itineraries.</p>
            </div>
          </div>
        </article>

        {role === 'admin' ? (
          <article className="panel admin-panel">
            <SectionIntro
              title="Admin review lane"
              detail="Visible only in the admin mock view to satisfy the multi-role course requirement."
            />
            <div className="workflow-list compact">
              {adminQueue.map((item) => (
                <div key={item.title} className="workflow-item">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </article>
        ) : null}
      </section>
    </div>
  )
}

function SectionIntro({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="section-intro">
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  )
}

export default App
