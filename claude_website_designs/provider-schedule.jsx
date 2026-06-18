function ProviderSchedule() {
  const days = [
    { d: 'Mon', n: 28, jobs: 2 },
    { d: 'Tue', n: 29, jobs: 3, today: true },
    { d: 'Wed', n: 30, jobs: 2 },
    { d: 'Thu', n: 1, jobs: 4 },
    { d: 'Fri', n: 2, jobs: 1 },
    { d: 'Sat', n: 3, jobs: 0 },
    { d: 'Sun', n: 4, jobs: 0 },
  ];
  const hours = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'];
  const events = [
    { day: 1, start: 0.5, h: 1.5, t: 'Lawn — Oak St', sub: '5 homes', tone: 'sage' },
    { day: 1, start: 2.7, h: 1.5, t: 'Plumbing — Maple', sub: '3 homes', tone: 'terracotta' },
    { day: 1, start: 4, h: 2, t: 'Water heater — Pine', sub: '4 homes', tone: 'gold' },
    { day: 0, start: 1, h: 2, t: 'Gutter clean', sub: '2 homes', tone: 'gold' },
    { day: 0, start: 3.5, h: 1.5, t: 'Inspection', sub: '1 home', tone: 'plum' },
    { day: 2, start: 0.7, h: 1.8, t: 'Backflow tests', sub: '4 homes', tone: 'terracotta' },
    { day: 2, start: 3.2, h: 1.5, t: 'Lawn — Cedar Ln', sub: '6 homes', tone: 'sage' },
    { day: 3, start: 0.3, h: 2.5, t: 'Block plumbing', sub: '8 homes', tone: 'terracotta' },
    { day: 3, start: 3.5, h: 1, t: 'Drain repair', sub: '1 home', tone: 'terracotta' },
    { day: 4, start: 1, h: 3, t: 'HVAC tune-up', sub: '7 homes', tone: 'plum' },
  ];
  const toneBg = { sage: 'var(--sage-100)', terracotta: 'var(--terracotta-100)', gold: 'var(--gold-100)', plum: 'var(--plum-100)' };
  const toneFg = { sage: 'var(--sage-700)', terracotta: 'var(--terracotta-600)', gold: 'var(--gold-600)', plum: 'var(--plum-600)' };

  return (
    <div className="app">
      <ProviderSidebar active="schedule" />
      <div className="content">
        <div className="topbar">
          <div>
            <h1>Schedule</h1>
            <p>Apr 28 – May 4 · 12 jobs · 28 hrs booked</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost"><Icon.back /></button>
            <button className="btn btn-quiet">Today</button>
            <button className="btn btn-ghost"><Icon.arrowR /></button>
            <span style={{ width: 1, background: 'var(--border)' }} />
            <div style={{ display: 'flex', background: 'var(--cream-100)', borderRadius: 10, padding: 3 }}>
              {['Day', 'Week', 'Month'].map((v, i) => (
                <button key={v} className="btn btn-sm" style={{
                  background: i === 1 ? 'white' : 'transparent',
                  boxShadow: i === 1 ? 'var(--shadow-sm)' : 'none',
                  fontWeight: 600, height: 28,
                }}>{v}</button>
              ))}
            </div>
            <button className="btn btn-primary"><Icon.plus /> Block time</button>
          </div>
        </div>

        <div className="scroll" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 22 }}>
          {/* Calendar */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Day header */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '14px 0', fontSize: 11, color: 'var(--ink-400)', textAlign: 'center', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>EDT</div>
              {days.map((day, i) => (
                <div key={i} style={{ padding: '14px 16px', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{day.d}</div>
                  <div className="numeral" style={{ fontSize: 22, marginTop: 4, color: day.today ? 'var(--terracotta-600)' : 'var(--ink-900)' }}>{day.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{day.jobs} {day.jobs === 1 ? 'job' : 'jobs'}</div>
                </div>
              ))}
            </div>
            {/* Grid */}
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', height: 540 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {hours.map(h => (
                  <div key={h} style={{ flex: 1, fontSize: 10, color: 'var(--ink-400)', textAlign: 'right', padding: '4px 8px 0 0', fontFamily: 'var(--font-mono)', borderTop: '1px solid var(--border)' }}>{h}</div>
                ))}
              </div>
              {days.map((day, di) => (
                <div key={di} style={{ position: 'relative', borderLeft: '1px solid var(--border)', background: day.today ? 'rgba(194,85,43,0.025)' : 'transparent' }}>
                  {hours.map((_, hi) => (
                    <div key={hi} style={{ height: 90, borderTop: '1px solid var(--border)' }} />
                  ))}
                  {events.filter(e => e.day === di).map((e, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      top: e.start * 90,
                      left: 4, right: 4,
                      height: e.h * 90 - 4,
                      background: toneBg[e.tone],
                      borderLeft: `3px solid ${toneFg[e.tone]}`,
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 12,
                      overflow: 'hidden',
                    }}>
                      <div style={{ fontWeight: 700, color: toneFg[e.tone], fontSize: 12 }}>{e.t}</div>
                      <div style={{ color: 'var(--ink-700)', fontSize: 11, marginTop: 2 }}>{e.sub}</div>
                    </div>
                  ))}
                  {day.today ? (
                    <div style={{ position: 'absolute', top: 235, left: 0, right: 0, borderTop: '2px solid var(--terracotta-500)', zIndex: 5 }}>
                      <div style={{ position: 'absolute', left: -5, top: -5, width: 8, height: 8, borderRadius: '50%', background: 'var(--terracotta-500)' }} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Right rail — today's run sheet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card card-pad">
              <div className="eyebrow">Today · Tue Apr 29</div>
              <div className="numeral" style={{ fontSize: 26, marginTop: 6 }}>3 jobs · 5 hrs</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Est. revenue $1,450</div>
              <hr className="hr" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { time: '9:00', t: 'Lawn — Oak St', dur: '2h', tone: 'sage', state: 'En route', d: '0.4 mi' },
                  { time: '13:30', t: 'Plumbing — Maple', dur: '1.5h', tone: 'terracotta', state: 'Up next', d: '2.1 mi' },
                  { time: '16:00', t: 'Water heater — Pine', dur: '2h', tone: 'gold', state: 'Scheduled', d: '4.0 mi' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '4px 1fr', gap: 12 }}>
                    <div style={{ background: toneFg[row.tone], borderRadius: 2 }} />
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span className="numeral" style={{ fontSize: 14 }}>{row.time}</span>
                        <span className={`chip chip-${row.tone}`}>{row.state}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{row.t}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{row.dur} · {row.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card card-pad">
              <div className="eyebrow">Availability</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Open for new jobs</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Auto-accept up to 2/day</div>
                </div>
                <div style={{ width: 40, height: 22, background: 'var(--sage-500)', borderRadius: 999, position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 2, top: 2, width: 18, height: 18, background: 'white', borderRadius: '50%' }} />
                </div>
              </div>
              <hr className="hr" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-500)' }}>Working hours</span><span style={{ fontWeight: 600 }}>7 AM – 6 PM</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-500)' }}>Days off</span><span style={{ fontWeight: 600 }}>Sun</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-500)' }}>Buffer between jobs</span><span style={{ fontWeight: 600 }}>30 min</span></div>
              </div>
            </div>
            <div className="card card-pad" style={{ background: 'var(--cream-100)' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>3 conflicts detected</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4 }}>Thu has 4 jobs in 2-hr windows. Consider buffer.</div>
              <button className="btn btn-quiet btn-sm" style={{ width: '100%', marginTop: 10, background: 'white' }}>Auto-resolve</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ProviderSchedule = ProviderSchedule;
