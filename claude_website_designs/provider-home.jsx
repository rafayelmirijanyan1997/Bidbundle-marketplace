function ProviderHome() {
  return (
    <div className="app">
      <ProviderSidebar active="home" />
      <div className="content">
        <div className="topbar">
          <div>
            <h1>Good morning, ProFix</h1>
            <p>5 new group jobs match your trades · 3 unread messages</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost"><PIcon.inbox /> Messages <span className="chip chip-terracotta" style={{ marginLeft: 4, height: 18 }}>3</span></button>
            <button className="btn btn-primary"><Icon.plus /> Quick bid</button>
          </div>
        </div>

        <div className="scroll" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Hero opportunity */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                padding: '24px 28px',
                background: 'linear-gradient(135deg, var(--terracotta-50), white)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className="chip chip-terracotta chip-dot">Top match · 96%</span>
                    <span className="chip">Plumbing</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>Closes in 6h 12m</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em' }}>
                    Plumbing leak inspection — 3 homes
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Maple St · Oakwood Heights · 2.1 mi away</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Bid range</div>
                  <div className="numeral" style={{ fontSize: 30, color: 'var(--terracotta-600)', lineHeight: 1, marginTop: 4 }}>$450–620</div>
                  <div style={{ fontSize: 12, color: 'var(--sage-700)', fontWeight: 600, marginTop: 4 }}>Est. $570 revenue</div>
                </div>
              </div>
              <div style={{ padding: '16px 28px 22px', display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex' }}>
                    {['#E08758', '#7A9A7E', '#B07AA0'].map((c, i) => (
                      <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i ? -6 : 0, color: 'white', fontSize: 10, fontWeight: 600, display: 'grid', placeItems: 'center' }}>{['SM','JK','AP'][i]}</div>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-700)' }}>3 neighbors joined · <span style={{ color: 'var(--sage-700)', fontWeight: 600 }}>2 are repeat customers</span></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm">View details</button>
                  <button className="btn btn-primary">Submit bid <Icon.arrowR /></button>
                </div>
              </div>
            </div>

            {/* Job feed */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <div className="eyebrow">Smart job feed</div>
                  <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>Matched to your trades & service area</span>
                </div>
                <a href="#" onClick={(e)=>e.preventDefault()} style={{ fontSize: 13, color: 'var(--terracotta-600)', fontWeight: 600, textDecoration: 'none' }}>See all 5 →</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { I: Icon.leaf, av: 'av-sage', t: 'Lawn care bundle', n: '6 homes · Lakeview Park · 3.4 mi', range: '$180–320', match: 88, ends: '23h' },
                  { I: Icon.broom, av: 'av-plum', t: 'Gutter cleanup', n: '2 homes · Oakwood Heights · 1.8 mi', range: '$120–220', match: 81, ends: '32h', upcoming: true },
                  { I: Icon.wrench, av: 'av-blue', t: 'Water heater service', n: '4 homes · Pine Ave · 4.0 mi', range: '$680–1,100', match: 74, ends: '2d' },
                ].map((j, i) => (
                  <div key={i} className="card" style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 18, alignItems: 'center' }}>
                    <div className={`avatar ${j.av}`} style={{ width: 40, height: 40, borderRadius: 11 }}><j.I style={{ color: 'white' }} /></div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{j.t}</div>
                        {j.upcoming ? <span className="chip chip-gold">Opens soon</span> : <span className="chip chip-sage chip-dot">Live</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{j.n} · ends in {j.ends}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="numeral" style={{ fontSize: 18 }}>{j.range}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{j.match}% match</div>
                    </div>
                    <button className={j.upcoming ? 'btn btn-ghost btn-sm' : 'btn btn-primary btn-sm'}>{j.upcoming ? 'Notify me' : 'Bid'}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's schedule */}
            <div className="card">
              <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="eyebrow">Today · Tue Apr 30</div>
                <a href="#" onClick={(e)=>e.preventDefault()} style={{ fontSize: 13, color: 'var(--terracotta-600)', fontWeight: 600, textDecoration: 'none' }}>Full schedule →</a>
              </div>
              <hr className="hr" />
              {[
                { time: '9:00 AM', t: 'Lawn care — Oak St', sub: 'Block of 5 · GreenThumb crew', dur: '2h', tone: 'sage', status: 'En route' },
                { time: '1:30 PM', t: 'Plumbing leak — Maple St', sub: 'Block of 3 · Inspection only', dur: '1.5h', tone: 'terracotta', status: 'Up next' },
                { time: '4:00 PM', t: 'Water heater — Pine Ave', sub: 'Block of 4 · Service call', dur: '3h', tone: 'gold', status: 'Scheduled' },
              ].map((row, i) => (
                <div key={i} style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: '70px auto 1fr auto', gap: 16, alignItems: 'center', borderTop: i ? '1px solid var(--border)' : 0 }}>
                  <div>
                    <div className="numeral" style={{ fontSize: 16 }}>{row.time}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{row.dur}</div>
                  </div>
                  <div style={{ width: 4, height: 36, borderRadius: 2, background: `var(--${row.tone}-500, var(--terracotta-500))` }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{row.t}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{row.sub}</div>
                  </div>
                  <span className={`chip chip-${row.tone}`}>{row.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Earnings */}
            <div className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div className="eyebrow">Revenue · last 30 days</div>
                <span className="chip chip-sage">+18% vs last mo</span>
              </div>
              <div className="numeral" style={{ fontSize: 38, marginTop: 8, color: 'var(--terracotta-600)' }}>$12,420</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>$3,545 this week · 14 jobs completed</div>
              <div style={{ marginTop: 18, height: 110, position: 'relative' }}>
                <svg viewBox="0 0 300 110" width="100%" height="100%" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="ph-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#E08758" stopOpacity="0.32"/>
                      <stop offset="100%" stopColor="#E08758" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0 80 L25 70 L50 75 L75 55 L100 60 L125 45 L150 50 L175 35 L200 38 L225 25 L250 30 L275 18 L300 22 L300 110 L0 110 Z" fill="url(#ph-grad)"/>
                  <path d="M0 80 L25 70 L50 75 L75 55 L100 60 L125 45 L150 50 L175 35 L200 38 L225 25 L250 30 L275 18 L300 22" fill="none" stroke="#C2552B" strokeWidth="2" strokeLinejoin="round"/>
                  <circle cx="300" cy="22" r="4" fill="#C2552B"/>
                  <circle cx="300" cy="22" r="8" fill="#C2552B" fillOpacity="0.18"/>
                </svg>
              </div>
              <hr className="hr" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', paddingTop: 12 }}>
                <Mini big="$1,820" sub="Pending payout" />
                <Mini big="92%" sub="Win rate" accent />
                <Mini big="3.2d" sub="Avg. job lead" />
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <KStat eyebrow="Jobs completed" big="14" sub="this month" tone="sage" />
              <KStat eyebrow="Avg. rating" big="4.9" sub={<span><Icon.star style={{ color: 'var(--gold-500)' }}/> 128 reviews</span>} tone="gold" />
            </div>

            {/* Inbox preview */}
            <div className="card">
              <div style={{ padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="eyebrow">Recent messages</div>
                <span className="chip chip-terracotta">3 unread</span>
              </div>
              <hr className="hr" />
              {[
                { mk: 'SM', av: 'av-plum', name: 'Sarah M.', t: 'When can your team start?', time: '12m', unread: true },
                { mk: 'JK', av: 'av-blue', name: 'James K.', t: 'Thanks for the quick quote!', time: '1h', unread: true },
                { mk: 'AP', av: 'av-sage', name: 'Aisha P. · HOA', t: 'New group RFP for your block', time: '3h', unread: true },
              ].map((m, i) => (
                <div key={i} style={{ padding: '12px 22px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center', borderTop: i ? '1px solid var(--border)' : 0 }}>
                  <div className={`avatar ${m.av}`} style={{ width: 32, height: 32, fontSize: 11 }}>{m.mk}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.t}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-400)' }}>{m.time}</div>
                    {m.unread ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--terracotta-500)' }} /> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ big, sub, accent }) {
  return (
    <div style={{ borderRight: '1px solid var(--border)', paddingRight: 8 }}>
      <div className="numeral" style={{ fontSize: 18, color: accent ? 'var(--terracotta-600)' : 'var(--ink-900)' }}>{big}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}
function KStat({ eyebrow, big, sub, tone }) {
  return (
    <div className="card card-pad">
      <div className="eyebrow">{eyebrow}</div>
      <div className="numeral" style={{ fontSize: 30, marginTop: 6, color: tone === 'sage' ? 'var(--sage-700)' : tone === 'gold' ? 'var(--gold-600)' : 'var(--ink-900)' }}>{big}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

window.ProviderHome = ProviderHome;
