// Dashboard (Home) — overview, decluttered
function PageDashboard() {
  return (
    <div className="app">
      <Sidebar active="home" />
      <div className="content">
        <div className="topbar">
          <div>
            <h1>Good morning, Lance</h1>
            <p>Tuesday, April 28 · You have <strong style={{ color: 'var(--terracotta-600)' }}>1 bid awaiting your call</strong> and 2 active groups.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost"><Icon.bell /> 3</button>
            <button className="btn btn-primary"><Icon.plus /> New request</button>
          </div>
        </div>

        <div className="scroll">
          {/* Hero — needs your attention */}
          <div style={{
            background: 'linear-gradient(135deg, #2D261D 0%, #1F1A14 60%, #3D2A1F 100%)',
            borderRadius: 22,
            padding: '26px 28px',
            color: '#FBF7F1',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 22,
          }}>
            <div style={{
              position: 'absolute', right: -40, top: -40,
              width: 220, height: 220, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(224,135,88,0.25), transparent 70%)',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span className="chip" style={{ background: 'rgba(224,135,88,0.2)', color: '#F7DDCB' }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: '#E08758', display: 'inline-block', boxShadow: '0 0 0 4px rgba(224,135,88,0.25)' }} />
                Live bidding
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#B5AC9C' }}>
                <Icon.clock /> Closes in 32h 18m
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 24, alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                  Plumbing leak inspection
                </div>
                <div style={{ color: '#B5AC9C', fontSize: 14, marginTop: 6 }}>
                  3 bids in · 3 neighbors joined · ProFix Plumbing leading
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="eyebrow" style={{ color: '#8C8273' }}>Best bid</div>
                <div className="numeral" style={{ fontSize: 38, lineHeight: 1, color: '#FBF7F1', marginTop: 4 }}>$490</div>
                <div style={{ fontSize: 12, color: '#7A9A7E', fontWeight: 600, marginTop: 2 }}>−$85 vs solo</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary">Review bids <Icon.arrowR /></button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.08)', color: '#FBF7F1' }}>
                  <Icon.spark /> Ask AI
                </button>
              </div>
            </div>
          </div>

          {/* Two-column overview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Active requests */}
              <div className="card">
                <div style={{ padding: '20px 24px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500 }}>Active requests</div>
                    <div style={{ color: 'var(--ink-500)', fontSize: 13, marginTop: 2 }}>3 open · group bidding to lower prices</div>
                  </div>
                  <a href="#" style={{ color: 'var(--terracotta-600)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>View all →</a>
                </div>
                <hr className="hr" />
                {[
                  { Icon: Icon.wrench, color: 'av-blue', name: 'Plumbing leak inspection', loc: 'Oakwood Heights', neighbors: 3, status: 'Live', chip: 'chip-terracotta', budget: '$450 – $620' },
                  { Icon: Icon.leaf, color: 'av-sage', name: 'Lawn care bundle', loc: 'Lakeview Park', neighbors: 5, status: 'Grouping', chip: 'chip-sage', budget: '$180 – $320' },
                  { Icon: Icon.broom, color: 'av-gold', name: 'Gutter cleanup', loc: 'Oakwood Heights', neighbors: 1, status: 'Draft', chip: '', budget: '$120 – $220' },
                ].map((r, i) => (
                  <div key={i} style={{ padding: '14px 24px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 14, alignItems: 'center', borderBottom: i < 2 ? '1px solid var(--border)' : 0 }}>
                    <div className={`avatar ${r.color}`} style={{ width: 38, height: 38 }}>
                      <r.Icon style={{ color: 'white' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-900)' }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>
                        {r.loc} · {r.neighbors} {r.neighbors === 1 ? 'neighbor' : 'neighbors'}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--ink-700)' }}>{r.budget}</div>
                    <span className={`chip ${r.chip || ''}`}>{r.status === 'Live' ? <span style={{ width: 6, height: 6, borderRadius: 3, background: 'currentColor' }} /> : null}{r.status}</span>
                  </div>
                ))}
                <div style={{ padding: 14, borderTop: '1px dashed var(--border-strong)' }}>
                  <button style={{
                    width: '100%', height: 42, borderRadius: 12,
                    border: '1px dashed var(--border-strong)',
                    background: 'transparent', color: 'var(--ink-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  }}>
                    <Icon.plus /> Add a new service request
                  </button>
                </div>
              </div>

              {/* Neighborhood pulse */}
              <div className="card card-pad">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Neighborhood pulse</div>
                    <div style={{ color: 'var(--ink-500)', fontSize: 12, marginTop: 2 }}>What your neighbors are up to</div>
                  </div>
                  <span className="chip chip-sage chip-dot">12 today</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { who: 'Maria Chen', avatar: 'MC', av: 'av-terracotta', what: 'joined your', highlight: 'plumbing bid', when: '2h ago' },
                    { who: 'ProFix Plumbing', avatar: 'PF', av: 'av-blue', what: 'submitted a bid', highlight: '$490 · saves $85', when: '4h ago' },
                    { who: 'Lawn care group', avatar: 'LC', av: 'av-sage', what: 'formed in Lakeview Park', highlight: '5 neighbors', when: 'Yesterday' },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div className={`avatar ${a.av}`} style={{ width: 32, height: 32, fontSize: 11 }}>{a.avatar}</div>
                      <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-700)' }}>
                        <strong style={{ color: 'var(--ink-900)' }}>{a.who}</strong> {a.what}{' '}
                        <span style={{ color: 'var(--terracotta-600)', fontWeight: 600 }}>{a.highlight}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-400)' }}>{a.when}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Savings card */}
              <div style={{
                background: 'linear-gradient(160deg, var(--cream-100), var(--cream-200))',
                border: '1px solid var(--border)',
                borderRadius: 22,
                padding: 24,
              }}>
                <div className="eyebrow">Your savings this year</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
                  <div className="numeral" style={{ fontSize: 56, lineHeight: 1, color: 'var(--ink-900)' }}>$310</div>
                  <span className="chip chip-sage" style={{ height: 22 }}>↓ 22% vs solo</span>
                </div>
                <div style={{ color: 'var(--ink-500)', fontSize: 13, marginTop: 6 }}>
                  Across 4 services · vs. solo booking
                </div>

                {/* Mini bar chart */}
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-end', gap: 8, height: 56 }}>
                  {[
                    { m: 'Jan', h: 14 }, { m: 'Feb', h: 0 }, { m: 'Mar', h: 32 }, { m: 'Apr', h: 48 }, { m: 'May', h: 22 }, { m: 'Jun', h: 36 },
                  ].map((b, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: '100%', height: Math.max(b.h, 4),
                        background: b.h > 0 ? 'var(--terracotta-500)' : 'var(--cream-300)',
                        borderRadius: 4,
                      }} />
                      <div style={{ fontSize: 10, color: 'var(--ink-400)' }}>{b.m}</div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)',
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Neighbors</div>
                    <div className="numeral" style={{ fontSize: 22, color: 'var(--ink-900)', marginTop: 2 }}>14</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Active bids</div>
                    <div className="numeral" style={{ fontSize: 22, color: 'var(--ink-900)', marginTop: 2 }}>2</div>
                  </div>
                </div>
              </div>

              {/* AI nudge */}
              <div className="card" style={{ padding: 20, borderColor: 'var(--terracotta-100)', background: 'linear-gradient(180deg, white, var(--terracotta-50))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--terracotta-600)', display: 'grid', placeItems: 'center', color: 'white' }}>
                    <Icon.spark />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--terracotta-600)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>NeighBid AI</div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, lineHeight: 1.35, color: 'var(--ink-900)' }}>
                  ProFix is your best plumbing pick — 4.9★, fastest, and saves you $85.
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm">Accept bid</button>
                  <button className="btn btn-quiet btn-sm">Why?</button>
                </div>
              </div>

              {/* HOA verified */}
              <div className="card" style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sage-50)', color: 'var(--sage-700)', display: 'grid', placeItems: 'center' }}>
                  <Icon.shield />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>HOA verified member</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Oakwood Heights · since Nov 2024</div>
                </div>
                <Icon.check style={{ color: 'var(--sage-700)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PageDashboard = PageDashboard;
