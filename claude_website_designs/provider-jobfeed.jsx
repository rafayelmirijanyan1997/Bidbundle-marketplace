function ProviderJobFeed() {
  const featured = {
    t: 'Whole-block plumbing inspection',
    addr: 'Maple St · Oakwood Heights · 2.1 mi',
    range: '$1,800–2,400',
    match: 96,
    closes: '6h 12m',
    homes: 8,
    desc: 'HOA-led inspection ahead of spring. Annual leak + main line check, written report per home. Block has used NeighBid 4x — 90% on-time payment history.',
  };
  const jobs = [
    { I: Icon.leaf, av: 'av-sage', t: 'Lawn care · 8-week season', n: 'Lakeview Park · 3.4 mi', range: '$1,440–2,560', match: 88, ends: '23h', homes: 6, tag: 'Recurring', tone: 'sage' },
    { I: Icon.broom, av: 'av-plum', t: 'Gutter cleanup', n: 'Oakwood Heights · 1.8 mi', range: '$240–440', match: 81, ends: '32h', homes: 2, tag: 'New', tone: 'terracotta' },
    { I: Icon.wrench, av: 'av-blue', t: 'Water heater service', n: 'Pine Ave · 4.0 mi', range: '$2,720–4,400', match: 74, ends: '2d 4h', homes: 4, tag: 'High value', tone: 'gold' },
    { I: Icon.broom, av: 'av-gold', t: 'Driveway pressure wash', n: 'Cedar Ln · 2.8 mi', range: '$540–820', match: 70, ends: '3d', homes: 5, tag: 'Repeat block', tone: 'sage' },
    { I: Icon.wrench, av: 'av-terracotta', t: 'Backflow testing', n: 'Birch Ct · 5.1 mi', range: '$640–960', match: 68, ends: '4d', homes: 4 },
    { I: Icon.leaf, av: 'av-sage', t: 'Tree trimming · seasonal', n: 'Willow Way · 2.4 mi', range: '$960–1,400', match: 64, ends: '5d', homes: 3 },
    { I: Icon.wrench, av: 'av-blue', t: 'HVAC tune-up bundle', n: 'Sycamore Dr · 3.9 mi', range: '$1,120–1,680', match: 62, ends: '6d', homes: 7, tag: 'Cross-trade', tone: 'plum' },
  ];
  const filters = ['All trades', 'Plumbing', 'HVAC', 'Lawn', 'Cleaning', 'Handyman'];
  return (
    <div className="app">
      <ProviderSidebar active="jobs" />
      <div className="content">
        <div className="topbar">
          <div>
            <h1>Job feed</h1>
            <p>5 live group RFPs · 3 closing today · matched to your trades & 8 mi service area</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost"><Icon.search /> Search jobs</button>
            <button className="btn btn-quiet">Saved <span style={{ marginLeft: 4, color: 'var(--ink-400)' }}>4</span></button>
            <button className="btn btn-primary"><Icon.spark /> Auto-bid settings</button>
          </div>
        </div>

        <div className="scroll" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 22 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Filter row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', flexWrap: 'wrap' }}>
              {filters.map((f, i) => (
                <button key={f} className="btn btn-sm" style={{
                  background: i === 0 ? 'var(--ink-900)' : 'transparent',
                  color: i === 0 ? 'white' : 'var(--ink-700)',
                  fontWeight: 600,
                }}>{f}</button>
              ))}
              <span style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 6px' }} />
              <button className="btn btn-sm btn-ghost">Within 5 mi</button>
              <button className="btn btn-sm btn-ghost">$500+</button>
              <button className="btn btn-sm btn-ghost">Closing today</button>
              <div style={{ flex: 1 }} />
              <button className="btn btn-ghost btn-sm">Sort: Best match ↓</button>
            </div>

            {/* Featured */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                <span className="chip chip-terracotta chip-dot">Top match · {featured.match}%</span>
                <span className="chip chip-gold">Closes in {featured.closes}</span>
              </div>
              <div style={{
                height: 130,
                background: 'linear-gradient(135deg, var(--terracotta-100), var(--cream-200) 60%, var(--sage-100))',
                position: 'relative',
              }}>
                {/* schematic block of homes */}
                <svg viewBox="0 0 400 130" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.6 }}>
                  {[...Array(8)].map((_, i) => (
                    <g key={i} transform={`translate(${30 + i * 45}, 70)`}>
                      <rect x="0" y="10" width="32" height="28" rx="2" fill="white" stroke="#C2552B" strokeOpacity="0.5"/>
                      <polygon points="-2,12 16,-4 34,12" fill="#C2552B" fillOpacity="0.7"/>
                      <rect x="13" y="22" width="6" height="16" fill="#C2552B" fillOpacity="0.6"/>
                    </g>
                  ))}
                </svg>
              </div>
              <div style={{ padding: '20px 28px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em' }}>{featured.t}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>{featured.addr} · {featured.homes} homes</div>
                    <p style={{ margin: '12px 0 0', fontSize: 14, color: 'var(--ink-700)', lineHeight: 1.55, maxWidth: 560 }}>{featured.desc}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Bid range</div>
                    <div className="numeral" style={{ fontSize: 30, color: 'var(--terracotta-600)', lineHeight: 1, marginTop: 4 }}>{featured.range}</div>
                    <div style={{ fontSize: 12, color: 'var(--sage-700)', fontWeight: 600, marginTop: 4 }}>~$2,100 likely revenue</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex' }}>
                      {['#E08758', '#7A9A7E', '#B07AA0', '#5C7E60'].map((c, i) => (
                        <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i ? -7 : 0, color: 'white', fontSize: 10, fontWeight: 600, display: 'grid', placeItems: 'center' }}>{['SM','JK','AP','DL'][i]}</div>
                      ))}
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cream-200)', color: 'var(--ink-700)', border: '2px solid white', marginLeft: -7, fontSize: 10, fontWeight: 600, display: 'grid', placeItems: 'center' }}>+4</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-700)' }}>8 neighbors joined · <span style={{ color: 'var(--sage-700)', fontWeight: 600 }}>3 are repeat customers</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm">Save</button>
                    <button className="btn btn-quiet btn-sm">View details</button>
                    <button className="btn btn-primary">Submit bid <Icon.arrowR /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Job rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {jobs.map((j, i) => (
                <div key={i} className="card" style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: 'auto 1fr 100px 130px auto', gap: 18, alignItems: 'center' }}>
                  <div className={`avatar ${j.av}`} style={{ width: 42, height: 42, borderRadius: 12 }}><j.I style={{ color: 'white' }} /></div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{j.t}</div>
                      {j.tag ? <span className={`chip chip-${j.tone || 'sage'}`}>{j.tag}</span> : null}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{j.n} · {j.homes} homes · ends in {j.ends}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--cream-200)' }}>
                        <div style={{ width: `${j.match}%`, height: '100%', background: 'var(--terracotta-500)', borderRadius: 3 }}/>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>{j.match}%</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 4 }}>match score</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="numeral" style={{ fontSize: 16 }}>{j.range}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>bid range</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm">Save</button>
                    <button className="btn btn-primary btn-sm">Bid</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card card-pad" style={{ background: 'linear-gradient(160deg, var(--sage-50), white)' }}>
              <div className="eyebrow">Auto-bid is <span style={{ color: 'var(--sage-700)' }}>ON</span></div>
              <div style={{ fontSize: 13, color: 'var(--ink-700)', marginTop: 8, lineHeight: 1.5 }}>
                We'll draft a quote when a job matches <strong>≥85%</strong> within <strong>5 mi</strong>. You approve before sending.
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <button className="btn btn-quiet btn-sm" style={{ background: 'white', flex: 1 }}>Pause</button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Edit rules</button>
              </div>
            </div>
            <div className="card card-pad">
              <div className="eyebrow">Closing soon</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {[
                  ['Plumbing inspection', '6h 12m', 'terracotta'],
                  ['Lawn care · 8-week', '23h', 'gold'],
                  ['Gutter cleanup', '32h', 'gold'],
                ].map(([t, time, tone]) => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--ink-700)' }}>{t}</span>
                    <span className={`chip chip-${tone}`}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card card-pad">
              <div className="eyebrow">Service map</div>
              <div style={{ marginTop: 10, height: 140, borderRadius: 12, background: 'linear-gradient(160deg, var(--sage-50), var(--cream-100))', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <svg viewBox="0 0 280 140" width="100%" height="100%">
                  <path d="M0 80 Q40 60 90 70 T180 60 T280 80 L280 140 L0 140 Z" fill="rgba(122,154,126,0.18)"/>
                  <path d="M0 100 Q40 90 90 95 T180 85 T280 105" fill="none" stroke="rgba(184,134,43,0.4)" strokeWidth="1" strokeDasharray="3 3"/>
                  <circle cx="140" cy="70" r="55" fill="rgba(194,85,43,0.08)" stroke="#C2552B" strokeOpacity="0.4" strokeDasharray="3 3"/>
                  {[[80,55],[120,80],[160,50],[195,90],[100,90],[170,30]].map(([x,y], i) => (
                    <g key={i}><circle cx={x} cy={y} r="6" fill="#C2552B"/><circle cx={x} cy={y} r="3" fill="white"/></g>
                  ))}
                  <g transform="translate(140, 70)">
                    <circle r="9" fill="white" stroke="#C2552B" strokeWidth="2"/>
                    <circle r="3" fill="#C2552B"/>
                  </g>
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-500)', marginTop: 10 }}>
                <span>Radius: <strong style={{ color: 'var(--ink-900)' }}>8 mi</strong></span>
                <a href="#" onClick={(e)=>e.preventDefault()} style={{ color: 'var(--terracotta-600)', fontWeight: 600, textDecoration: 'none' }}>Adjust →</a>
              </div>
            </div>
            <div className="card card-pad" style={{ background: 'var(--cream-100)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500 }}>Bidding tip</div>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.5 }}>
                Crews who quote within <strong>2 hours</strong> of a group RFP win <strong>3.4×</strong> more often.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ProviderJobFeed = ProviderJobFeed;
