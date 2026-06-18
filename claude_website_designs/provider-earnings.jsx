function ProviderEarnings() {
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const monthData = [6800, 7200, 8100, 9400, 10800, 12420];
  const max = Math.max(...monthData);
  const transactions = [
    { d: 'Apr 28', t: 'Plumbing inspection', sub: 'Maple St · 3 homes', amt: 570, type: 'in', state: 'Pending' },
    { d: 'Apr 26', t: 'Lawn care bundle', sub: 'Oak St · 5 homes', amt: 720, type: 'in', state: 'Cleared' },
    { d: 'Apr 24', t: 'Platform fee', sub: 'April invoice', amt: -195, type: 'out', state: 'Auto' },
    { d: 'Apr 22', t: 'Water heater service', sub: 'Pine Ave · 4 homes', amt: 880, type: 'in', state: 'Cleared' },
    { d: 'Apr 18', t: 'Block plumbing', sub: 'Maple St · 3 homes', amt: 3325, type: 'in', state: 'Cleared' },
    { d: 'Apr 12', t: 'Tip from James K.', sub: 'Inspection', amt: 50, type: 'in', state: 'Cleared' },
    { d: 'Apr 10', t: 'Handyman block', sub: 'Elm Ct · 2 homes', amt: 680, type: 'in', state: 'Cleared' },
  ];
  return (
    <div className="app">
      <ProviderSidebar active="earnings" />
      <div className="content">
        <div className="topbar">
          <div>
            <h1>Earnings</h1>
            <p>April 2026 · 14 jobs · $12,420 gross</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost">Download CSV</button>
            <button className="btn btn-quiet">Tax docs</button>
            <button className="btn btn-primary"><Icon.spark /> Forecast</button>
          </div>
        </div>

        <div className="scroll" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 22 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Headline + chart */}
            <div className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="eyebrow">Gross revenue · 6 mo</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
                    <div className="numeral" style={{ fontSize: 48, color: 'var(--terracotta-600)', lineHeight: 1 }}>$54,720</div>
                    <span className="chip chip-sage chip-dot">+18% MoM</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Net after fees: <strong style={{ color: 'var(--ink-900)' }}>$49,248</strong> · 84 jobs · avg $651/job</div>
                </div>
                <div style={{ display: 'flex', background: 'var(--cream-100)', borderRadius: 10, padding: 3 }}>
                  {['Week', '30d', '6mo', 'Year'].map((v, i) => (
                    <button key={v} className="btn btn-sm" style={{
                      background: i === 2 ? 'white' : 'transparent',
                      boxShadow: i === 2 ? 'var(--shadow-sm)' : 'none',
                      fontWeight: 600, height: 28,
                    }}>{v}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 24, height: 220, display: 'flex', alignItems: 'flex-end', gap: 18, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                  {['$15k', '$10k', '$5k', '$0'].map(v => (
                    <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)', width: 36 }}>{v}</span>
                      <div style={{ flex: 1, borderTop: '1px dashed var(--border)' }} />
                    </div>
                  ))}
                </div>
                <div style={{ width: 36 }} />
                {months.map((m, i) => (
                  <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', gap: 4, height: 200 }}>
                      <div style={{
                        flex: 1,
                        height: `${(monthData[i] / max) * 90}%`,
                        background: i === 5 ? 'linear-gradient(to top, var(--terracotta-600), var(--terracotta-400))' : 'linear-gradient(to top, var(--cream-300), var(--terracotta-100))',
                        borderRadius: '8px 8px 0 0',
                        position: 'relative',
                      }}>
                        {i === 5 ? (
                          <div style={{ position: 'absolute', top: -32, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink-900)', color: 'white', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>$12,420</div>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>{m}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* By trade */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
              <div className="card card-pad">
                <div className="eyebrow">Revenue by trade</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
                  {[
                    ['Plumbing & leaks', 6840, 0.55, 'terracotta'],
                    ['Water heaters', 2980, 0.24, 'gold'],
                    ['Drain cleaning', 1640, 0.13, 'sage'],
                    ['Inspections', 960, 0.08, 'plum'],
                  ].map(([t, n, p, tone]) => (
                    <div key={t}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ fontWeight: 600 }}>{t}</span>
                        <span><span className="numeral">${n.toLocaleString()}</span> <span style={{ color: 'var(--ink-500)', marginLeft: 6 }}>{Math.round(p*100)}%</span></span>
                      </div>
                      <div style={{ height: 8, background: 'var(--cream-200)', borderRadius: 999, marginTop: 6 }}>
                        <div style={{ width: `${p*100}%`, height: '100%', background: `var(--${tone}-500)`, borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card card-pad">
                <div className="eyebrow">Win/loss</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14, position: 'relative' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="60" fill="none" stroke="var(--cream-200)" strokeWidth="20"/>
                    <circle cx="80" cy="80" r="60" fill="none" stroke="var(--terracotta-500)" strokeWidth="20" strokeDasharray="377" strokeDashoffset="30" transform="rotate(-90 80 80)" strokeLinecap="round"/>
                  </svg>
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div className="numeral" style={{ fontSize: 32, color: 'var(--terracotta-600)', lineHeight: 1 }}>92%</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>win rate</div>
                  </div>
                </div>
                <hr className="hr" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <Detail k="Bids submitted" v="38" />
                  <Detail k="Won" v="35" />
                  <Detail k="Avg time to bid" v="1h 42m" />
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="card">
              <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="eyebrow">Transactions · April</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="chip" style={{ background: 'var(--ink-900)', color: 'white' }}>All</span>
                  <span className="chip">Income</span>
                  <span className="chip">Fees</span>
                  <span className="chip">Pending</span>
                </div>
              </div>
              <hr className="hr" />
              {transactions.map((tx, i) => (
                <div key={i} style={{ padding: '12px 22px', display: 'grid', gridTemplateColumns: '60px 1fr auto auto', gap: 14, alignItems: 'center', borderTop: i ? '1px solid var(--border)' : 0 }}>
                  <div className="numeral" style={{ fontSize: 12, color: 'var(--ink-500)' }}>{tx.d}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{tx.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{tx.sub}</div>
                  </div>
                  <span className={`chip chip-${tx.state === 'Pending' ? 'gold' : tx.state === 'Cleared' ? 'sage' : ''}`} style={{ height: 20, fontSize: 11 }}>{tx.state}</span>
                  <div className="numeral" style={{ fontSize: 16, color: tx.amt > 0 ? 'var(--sage-700)' : 'var(--ink-500)', textAlign: 'right', minWidth: 80 }}>
                    {tx.amt > 0 ? '+' : '−'}${Math.abs(tx.amt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card card-pad" style={{ background: 'linear-gradient(160deg, var(--terracotta-600), var(--terracotta-500))', color: 'white', border: 0 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Next payout</div>
              <div className="numeral" style={{ fontSize: 38, marginTop: 6 }}>$1,820</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Tue, May 5 · Direct deposit</div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '14px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <Row k="Cleared" v="$2,015" />
                <Row k="Platform fee" v="−$195" />
                <Row k="Tips" v="+$0" />
              </div>
              <button className="btn btn-sm" style={{ width: '100%', marginTop: 14, background: 'white', color: 'var(--terracotta-600)', fontWeight: 600 }}>View payout breakdown</button>
            </div>

            <div className="card card-pad">
              <div className="eyebrow">YTD summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                <Detail k="Gross" v="$54,720" />
                <Detail k="Net" v="$49,248" />
                <Detail k="Tips" v="$1,140" />
                <Detail k="Tax set-aside" v="$11,800" />
              </div>
              <button className="btn btn-quiet btn-sm" style={{ width: '100%', marginTop: 12 }}>Download 1099</button>
            </div>

            <div className="card card-pad">
              <div className="eyebrow">Goal · April</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                <span className="numeral" style={{ fontSize: 22 }}>$12,420</span>
                <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>of $14,000</span>
              </div>
              <div className="progress" style={{ marginTop: 10 }}>
                <div className="progress-fill" style={{ width: '88%' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--sage-700)', fontWeight: 600, marginTop: 6 }}>$1,580 to go · 3 days left</div>
            </div>

            <div className="card card-pad" style={{ background: 'var(--cream-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon.spark style={{ color: 'var(--terracotta-600)' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500 }}>Forecast</div>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.5 }}>
                Based on your last 6 months and 5 active bids, you're on pace for <strong style={{ color: 'var(--terracotta-600)' }}>$13,800</strong> in May.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ProviderEarnings = ProviderEarnings;
