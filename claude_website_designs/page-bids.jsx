// My Bids — better progress, status emphasis
function PageBids() {
  return (
    <div className="app">
      <Sidebar active="bids" />
      <div className="content">
        <div className="topbar">
          <div>
            <h1>My bids</h1>
            <p>Track bookings, savings, and provider work in progress.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost"><Icon.search /> Search bids</button>
            <button className="btn btn-primary"><Icon.plus /> New request</button>
          </div>
        </div>

        <div className="scroll">
          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
            {[
              { eyebrow: 'Total saved', big: '$310', sub: 'across 4 services', accent: 'var(--terracotta-600)', tone: 'terracotta' },
              { eyebrow: 'Booked', big: '4', sub: 'all-time', accent: 'var(--ink-900)', tone: 'neutral' },
              { eyebrow: 'Active now', big: '2', sub: 'in progress', accent: 'var(--sage-700)', tone: 'sage' },
              { eyebrow: 'Completed', big: '1', sub: 'this year', accent: 'var(--gold-600)', tone: 'gold' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
                <div className="eyebrow">{s.eyebrow}</div>
                <div className="numeral" style={{ fontSize: 36, marginTop: 8, color: s.accent, lineHeight: 1 }}>{s.big}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 6 }}>{s.sub}</div>
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0, height: 3,
                  background: s.tone === 'terracotta' ? 'var(--terracotta-500)'
                    : s.tone === 'sage' ? 'var(--sage-500)'
                    : s.tone === 'gold' ? 'var(--gold-500)'
                    : 'var(--ink-200)',
                }} />
              </div>
            ))}
          </div>

          {/* Tabs + filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, padding: '0 4px' }}>
            {[
              { k: 'all', label: 'All', n: 4, active: true },
              { k: 'active', label: 'Active', n: 2 },
              { k: 'completed', label: 'Completed', n: 1 },
              { k: 'archived', label: 'Archived', n: 1 },
            ].map((t) => (
              <button key={t.k} className="btn btn-sm" style={{
                background: t.active ? 'var(--ink-900)' : 'transparent',
                color: t.active ? 'white' : 'var(--ink-700)',
                fontWeight: 600,
              }}>
                {t.label} <span style={{
                  marginLeft: 4,
                  background: t.active ? 'rgba(255,255,255,0.18)' : 'var(--cream-200)',
                  color: t.active ? 'white' : 'var(--ink-500)',
                  fontSize: 11, padding: '1px 7px', borderRadius: 9,
                }}>{t.n}</span>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button className="btn btn-ghost btn-sm">Sort: Recent ↓</button>
          </div>

          {/* Active section */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 4px' }}>
              <div className="eyebrow">Active</div>
              <span className="chip chip-sage chip-dot">2 in progress</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Active bid 1 */}
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 18, alignItems: 'center' }}>
                  <div className="avatar av-blue" style={{ width: 44, height: 44, borderRadius: 12 }}>
                    <Icon.wrench style={{ color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Plumbing leak inspection</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 2 }}>
                      ProFix Plumbing · 3 neighbors · booked 18m ago
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="numeral" style={{ fontSize: 22, fontWeight: 500 }}>$490</div>
                    <div style={{ fontSize: 12, color: 'var(--sage-700)', fontWeight: 600, marginTop: 2 }}>−$85 vs solo</div>
                  </div>
                  <button className="btn btn-quiet btn-sm">Track →</button>
                </div>
                <div style={{ padding: '0 24px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--sage-700)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--sage-600)' }} />
                      In progress
                    </span>
                    <span style={{ color: 'var(--ink-500)' }}>35% complete · ETA tomorrow</span>
                  </div>
                  <div className="progress" style={{ background: 'var(--cream-200)' }}>
                    <div className="progress-fill" style={{ width: '35%' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    {['Booked', 'En route', 'Inspecting', 'Report', 'Done'].map((s, i) => (
                      <div key={i} style={{
                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                        padding: '6px 8px', borderRadius: 8,
                        background: i <= 1 ? 'var(--sage-50)' : 'transparent',
                      }}>
                        <div style={{ fontSize: 10, color: i <= 1 ? 'var(--sage-700)' : 'var(--ink-400)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{i === 0 ? '18m ago' : i === 1 ? 'now' : '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active bid 2 */}
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 18, alignItems: 'center' }}>
                  <div className="avatar av-sage" style={{ width: 44, height: 44, borderRadius: 12 }}>
                    <Icon.leaf style={{ color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Lawn care bundle</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 2 }}>
                      GreenThumb Co · 5 neighbors · booked today
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="numeral" style={{ fontSize: 22, fontWeight: 500 }}>$275</div>
                    <div style={{ fontSize: 12, color: 'var(--sage-700)', fontWeight: 600, marginTop: 2 }}>−$105 vs solo</div>
                  </div>
                  <button className="btn btn-quiet btn-sm">Track →</button>
                </div>
                <div style={{ padding: '0 24px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--sage-700)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--sage-600)' }} />
                      In progress
                    </span>
                    <span style={{ color: 'var(--ink-500)' }}>70% complete · finishing today</span>
                  </div>
                  <div className="progress"><div className="progress-fill" style={{ width: '70%' }} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 4px' }}>
              <div className="eyebrow">Completed</div>
              <span className="chip">1 awaiting review</span>
            </div>
            <div className="card" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center' }}>
              <div className="avatar av-plum" style={{ width: 44, height: 44, borderRadius: 12 }}>
                <Icon.broom style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>House cleaning</div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 2 }}>SparkleClean · April 10 · solo booking</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  {[1,2,3,4,5].map((s) => (
                    <Icon.star key={s} style={{ color: s <= 5 ? 'var(--gold-500)' : 'var(--ink-200)' }} />
                  ))}
                  <span style={{ fontSize: 12, color: 'var(--ink-500)', marginLeft: 6 }}>5.0</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div className="numeral" style={{ fontSize: 22 }}>$140</div>
                <button className="btn btn-ghost btn-sm"><Icon.edit /> Leave review</button>
              </div>
            </div>
          </div>

          {/* Archived */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 4px' }}>
              <div className="eyebrow">Archived</div>
            </div>
            <div className="card" style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center', opacity: 0.85 }}>
              <div className="avatar av-gold" style={{ width: 36, height: 36, borderRadius: 10 }}>
                <Icon.broom style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Gutter repair</div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>AllWeather Crew · Mar 26</div>
              </div>
              <div className="numeral" style={{ fontSize: 18, color: 'var(--ink-500)' }}>$330</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PageBids = PageBids;
