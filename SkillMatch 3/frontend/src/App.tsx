import { useState, useEffect } from 'react'
import './App.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  id: number
  jobTitle: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  explanation: string
  recommendations: string[]
  createdAt: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:8081/api'

const DEFAULT_ROADMAP = [
  {
    number: '01',
    title: 'Strengthen React fundamentals',
    detail: 'Components, hooks and state management',
    duration: '1 week',
  },
  {
    number: '02',
    title: 'Practice REST API integration',
    detail: 'Connect frontend applications to APIs',
    duration: '5 days',
  },
  {
    number: '03',
    title: 'Build a portfolio project',
    detail: 'Create and deploy a complete application',
    duration: '2 weeks',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusLabel(score: number): string {
  if (score >= 80) return 'Strong match'
  if (score >= 60) return 'Good potential'
  if (score >= 40) return 'Moderate match'
  return 'Needs improvement'
}

function statusClass(score: number): string {
  if (score >= 80) return 'status-strong'
  if (score >= 60) return 'status-good'
  return 'status-needs-work'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86_400_000) return 'Today'
  if (diff < 172_800_000) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Component ─────────────────────────────────────────────────────────────────

function App() {
  // Form state
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [userSkills, setUserSkills] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Results state
  const [result, setResult] = useState<AnalysisResult | null>(null)

  // History state
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)

  // Load recent analyses on mount
  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const res = await fetch(`${API_BASE}/analyses`)
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const data: AnalysisResult[] = await res.json()
      setRecentAnalyses(data)
    } catch {
      setHistoryError('Could not load analysis history. Is the backend running?')
    } finally {
      setHistoryLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!jobDescription.trim()) {
      setFormError('Please paste a job description to continue.')
      return
    }
    if (jobDescription.trim().length < 20) {
      setFormError('Job description must be at least 20 characters.')
      return
    }

    setFormError(null)
    setResult(null)
    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/analyses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: jobTitle.trim() || null,
          jobDescription: jobDescription.trim(),
          userSkills: userSkills.trim() || null,
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Unknown error from server.' }))
        throw new Error(errBody.error ?? `Server error ${res.status}`)
      }

      const data: AnalysisResult = await res.json()
      setResult(data)
      // Refresh history
      fetchHistory()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Derived dashboard metrics from real history
  const totalAnalyses = recentAnalyses.length
  const avgScore = totalAnalyses > 0
    ? Math.round(recentAnalyses.reduce((sum, a) => sum + a.matchScore, 0) / totalAnalyses)
    : 0
  const totalMissing = recentAnalyses.reduce((sum, a) => sum + (a.missingSkills?.length ?? 0), 0)

  return (
    <div className="app-shell">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-mark">S</span>
          <span>
            <strong>skillmatch</strong>
            <small>CAREER INTELLIGENCE</small>
          </span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="side-nav">
          <a className="nav-link active" href="#dashboard">
            <span className="nav-icon">⌂</span>
            Dashboard
          </a>
          <a className="nav-link" href="#analyze">
            <span className="nav-icon">⌕</span>
            Skill analysis
          </a>
          <a className="nav-link" href="#roadmap">
            <span className="nav-icon">◎</span>
            Learning roadmap
          </a>
          <a className="nav-link" href="#applications">
            <span className="nav-icon">▤</span>
            Applications
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">✦</div>
            <strong>Your next opportunity starts here.</strong>
            <p>Build the skills that move your career forward.</p>
            <a href="#analyze">Analyze a role <span>↗</span></a>
          </div>

          <div className="profile">
            <div className="avatar">SM</div>
            <div className="profile-info">
              <strong>Your profile</strong>
              <span>Career explorer</span>
            </div>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>Dashboard</strong>
          </div>
          <div className="topbar-right">
            <span className="status-dot" />
            <span className="system-status">Career workspace</span>
            <button className="icon-button" aria-label="Notifications">♧</button>
            <div className="avatar top-avatar">SM</div>
          </div>
        </header>

        <div className="page-content">

          {/* ── Welcome ─────────────────────────────────────────────────── */}
          <section className="welcome-section">
            <div className="welcome-copy">
              <span className="eyebrow">
                <span className="eyebrow-line" /> YOUR CAREER OVERVIEW
              </span>
              <h1>Make your next move<br />a <span>smarter one.</span></h1>
              <p>
                Understand your strengths, uncover skill gaps, and build a
                clear path to the opportunities you want.
              </p>
              <div className="welcome-actions">
                <a className="primary-button" href="#analyze">
                  Analyze a job description <span>↗</span>
                </a>
                <a className="text-button" href="#roadmap">
                  View learning roadmap <span>→</span>
                </a>
              </div>
            </div>

            <div className="welcome-art" aria-hidden="true">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />
              <div className="art-sun" />
              <div className="art-hill hill-back" />
              <div className="art-hill hill-front" />
              <div className="art-path" />
              <div className="floating-card">
                <span className="floating-icon">↗</span>
                <div>
                  <strong>Growth in progress</strong>
                  <small>One step at a time</small>
                </div>
              </div>
            </div>
          </section>

          {/* ── Metrics ─────────────────────────────────────────────────── */}
          <section className="section-block">
            <div className="section-heading">
              <div>
                <span className="section-kicker">AT A GLANCE</span>
                <h2>Your career snapshot</h2>
              </div>
              <span className="muted-label">
                {historyLoading ? 'Loading…' : totalAnalyses === 0 ? 'No analyses yet' : 'Live data from your history'}
              </span>
            </div>

            <div className="metrics-grid">
              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-icon blue">⌕</span>
                  <span className="metric-caption">ALL TIME</span>
                </div>
                <div className="metric-value">{historyLoading ? '—' : totalAnalyses}</div>
                <div className="metric-label">Jobs analyzed</div>
                <div className="metric-foot">Your exploration history</div>
              </article>

              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-icon navy">◈</span>
                  <span className="metric-caption">AVERAGE</span>
                </div>
                <div className="metric-value">
                  {historyLoading ? '—' : totalAnalyses === 0 ? 'N/A' : <>{avgScore}<span className="metric-unit">/100</span></>}
                </div>
                <div className="metric-label">Skill match score</div>
                <div className="metric-foot">Across analyzed roles</div>
              </article>

              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-icon lavender">✳</span>
                  <span className="metric-caption">TO WORK ON</span>
                </div>
                <div className="metric-value">{historyLoading ? '—' : totalMissing}</div>
                <div className="metric-label">Skills to strengthen</div>
                <div className="metric-foot">Identified from job requirements</div>
              </article>

              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-icon green">✓</span>
                  <span className="metric-caption">IN PROGRESS</span>
                </div>
                <div className="metric-value">
                  {historyLoading ? '—' : result?.recommendations.length ?? 0}
                </div>
                <div className="metric-label">Learning goals</div>
                <div className="metric-foot">From your latest analysis</div>
              </article>
            </div>
          </section>

          {/* ── Grid: Recent + Roadmap ───────────────────────────────────── */}
          <div className="dashboard-grid">

            {/* Recent analyses */}
            <section className="panel recent-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">YOUR ACTIVITY</span>
                  <h2>Recent analyses</h2>
                </div>
                <a href="#analyze" className="small-link">View all <span>→</span></a>
              </div>

              <div className="analysis-list">
                {historyLoading && (
                  <p className="empty-state">Loading history…</p>
                )}
                {!historyLoading && historyError && (
                  <p className="empty-state error-state">{historyError}</p>
                )}
                {!historyLoading && !historyError && recentAnalyses.length === 0 && (
                  <p className="empty-state">No analyses yet. Run your first analysis below!</p>
                )}
                {!historyLoading && recentAnalyses.map((analysis) => (
                  <article className="analysis-row" key={analysis.id}>
                    <div className="company-symbol">
                      {(analysis.jobTitle ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="analysis-details">
                      <strong>{analysis.jobTitle}</strong>
                      <span>Keyword match <span className="separator">·</span> {formatDate(analysis.createdAt)}</span>
                    </div>
                    <div className="analysis-score">
                      <strong>{analysis.matchScore}%</strong>
                      <div className="score-track">
                        <div className="score-fill" style={{ width: `${analysis.matchScore}%` }} />
                      </div>
                    </div>
                    <span className={`match-status ${statusClass(analysis.matchScore)}`}>
                      {statusLabel(analysis.matchScore)}
                    </span>
                  </article>
                ))}
              </div>

              <a className="panel-footer-link" href="#analyze">
                + Start a new analysis
              </a>
            </section>

            {/* Learning roadmap */}
            <section className="panel roadmap-panel" id="roadmap">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">YOUR NEXT STEPS</span>
                  <h2>Learning roadmap</h2>
                </div>
                <span className="roadmap-count">
                  {result ? `${result.recommendations.length} goals` : '03 goals'}
                </span>
              </div>

              <div className="roadmap-list">
                {result && result.recommendations.length > 0
                  ? result.recommendations.map((rec, i) => (
                    <article className="roadmap-item" key={i}>
                      <div className="roadmap-number">{String(i + 1).padStart(2, '0')}</div>
                      <div className="roadmap-details">
                        <strong>{rec}</strong>
                        <span>Based on your latest analysis</span>
                        <small>From SkillMatch keyword analysis</small>
                      </div>
                    </article>
                  ))
                  : DEFAULT_ROADMAP.map((item) => (
                    <article className="roadmap-item" key={item.number}>
                      <div className="roadmap-number">{item.number}</div>
                      <div className="roadmap-details">
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                        <small>{item.duration}</small>
                      </div>
                    </article>
                  ))
                }
              </div>

              <a className="panel-footer-link" href="#analyze">
                Explore your skill gaps <span>→</span>
              </a>
            </section>
          </div>

          {/* ── Analysis form ───────────────────────────────────────────── */}
          <section className="panel analyze-panel" id="analyze">
            <div className="analyze-copy">
              <span className="section-kicker">START HERE</span>
              <h2>Find your fit.</h2>
              <p>
                Paste an internship or job description to discover how your
                skills align with what employers are looking for.
              </p>
              <div className="analyze-points">
                <span><b>01</b> Identify skill gaps</span>
                <span><b>02</b> Get a learning plan</span>
                <span><b>03</b> Prepare with confidence</span>
              </div>
            </div>

            <form className="job-form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="job-title">Job title <span>OPTIONAL</span></label>
              <input
                id="job-title"
                type="text"
                placeholder="e.g. Frontend Developer Intern"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={isSubmitting}
              />

              <label htmlFor="job-description">Job description <span>REQUIRED</span></label>
              <textarea
                id="job-description"
                required
                rows={5}
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isSubmitting}
              />

              <label htmlFor="user-skills">Your skills <span>OPTIONAL</span></label>
              <textarea
                id="user-skills"
                rows={3}
                placeholder="e.g. React, TypeScript, Java, SQL, Docker (comma-separated or free text)"
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
                disabled={isSubmitting}
              />

              {formError && (
                <div className="form-error" role="alert">{formError}</div>
              )}

              <button
                type="submit"
                className="primary-button form-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Analyzing…' : <>Analyze skill match <span>↗</span></>}
              </button>

              <p className="form-note">
                Skill matching uses keyword analysis — not AI or resume parsing.
                Enter your skills above for accurate results.
              </p>
            </form>
          </section>

          {/* ── Analysis Result ─────────────────────────────────────────── */}
          {result && (
            <section className="panel result-panel" id="result">
              <div className="result-header">
                <div>
                  <span className="section-kicker">ANALYSIS RESULT</span>
                  <h2>{result.jobTitle}</h2>
                </div>
                <div className={`result-score-badge ${statusClass(result.matchScore)}`}>
                  <span className="score-big">{result.matchScore}</span>
                  <span className="score-label">/ 100</span>
                </div>
              </div>

              <p className="result-explanation">{result.explanation}</p>

              <div className="result-grid">
                <div className="result-col">
                  <h3 className="result-col-heading matched">✓ Matched skills ({result.matchedSkills.length})</h3>
                  {result.matchedSkills.length > 0 ? (
                    <ul className="skill-list">
                      {result.matchedSkills.map((s) => (
                        <li key={s} className="skill-tag matched-tag">{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-state">No known skills matched. Try adding your skills in the form.</p>
                  )}
                </div>

                <div className="result-col">
                  <h3 className="result-col-heading missing">✗ Skills to develop ({result.missingSkills.length})</h3>
                  {result.missingSkills.length > 0 ? (
                    <ul className="skill-list">
                      {result.missingSkills.map((s) => (
                        <li key={s} className="skill-tag missing-tag">{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-state">All detected skills matched — great fit!</p>
                  )}
                </div>
              </div>

              {result.recommendations.length > 0 && (
                <div className="result-recs">
                  <h3 className="result-col-heading">📚 Recommendations</h3>
                  <ol className="rec-list">
                    {result.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ol>
                </div>
              )}

              <p className="result-id-note">Analysis ID #{result.id} saved to database.</p>
            </section>
          )}

          {/* ── Applications ────────────────────────────────────────────── */}
          <section className="applications-section" id="applications">
            <div>
              <span className="section-kicker">KEEP MOVING FORWARD</span>
              <h2>Every application is progress.</h2>
              <p>Your application tracker will help you organize opportunities, deadlines, and next steps.</p>
            </div>
            <a href="#analyze" className="secondary-button">Explore opportunities <span>→</span></a>
          </section>

          <footer className="footer">
            <span>SKILLMATCH <span className="footer-dot">·</span> CAREER INTELLIGENCE</span>
            <span>Build skills. Create opportunities.</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
