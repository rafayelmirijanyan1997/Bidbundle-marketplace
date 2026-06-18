function ProviderProfile() {
  return (
    <div className="app">
      <ProviderSidebar active="profile" />
      <div className="content">
        <div className="topbar">
          <div>
            <h1>Profile & business</h1>
            <p>Public profile, payouts, service area, notifications</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost"><Icon.edit /> Edit public profile</button>
            <span className="chip chip-sage chip-dot" style={{ height: 30, padding: '0 12px' }}><Icon.shield /> Verified · Insured</span>
          </div>
        </div>

        <div className="scroll" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Identity */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 88, background: 'linear-gradient(135deg, var(--terracotta-100), var(--cream-200) 50%, var(--sage-100))' }} />
              <div style={{ padding: '0 28px 24px', marginTop: -36 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
                  <div className="avatar av-terracotta" style={{ width: 76, height: 76, fontSize: 22, border: '4px solid white', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-display)' }}>PF</div>
                  <div style={{ flex: 1, paddingBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500 }}>ProFix Plumbing</div>
                      <span className="chip chip-sage chip-dot">Verified</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>Licensed · Insured · 10 yrs · Oakwood Heights area</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, fontSize: 13 }}>
                      <span style={{ color: 'var(--gold-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {[1,2,3,4,5].map(i=> <Icon.star key={i}/>)} <strong style={{ color: 'var(--ink-900)', marginLeft: 4 }}>4.9</strong>
                      </span>
                      <span style={{ color: 'var(--ink-500)' }}>· 128 reviews · 14 mo on NeighBid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="card card-pad">
              <div className="eyebrow">Performance · last 90 days</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 14 }}>
                <PStat big="$12.4k" label="Earnings" tone="terracotta" />
                <PStat big="92%" label="Win rate" tone="sage" />
                <PStat big="4.9" label="Rating" tone="gold" />
                <PStat big="3.2d" label="Avg lead" tone="ink" />
              </div>
            </div>

            {/* Settings sections */}
            <div className="card">
              {[
                { I: PIcon.dollar, t: 'Payment methods', s: 'Bank account •••• 7821 · Direct deposit Tue/Fri', tone: 'sage' },
                { I: Icon.bell, t: 'Notifications', s: 'Push & Email · job alerts within 5 mi', tone: 'terracotta' },
                { I: Icon.pin, t: 'Service area & trades', s: 'Oakwood Heights · 8 mi · 4 trades', tone: 'gold' },
                { I: PIcon.cal, t: 'Working hours', s: 'Mon–Sat · 7:00 AM – 6:00 PM', tone: 'sage' },
                { I: Icon.shield, t: 'Documents', s: 'License, insurance, W-9 · all current', tone: 'sage' },
                { I: PIcon.briefcase, t: 'Quote templates', s: '4 saved · last edited Apr 18', tone: 'terracotta' },
                { I: Icon.user, t: 'Crew & team', s: '3 members · 1 pending invite', tone: 'gold' },
                { I: Icon.spark, t: 'Help & support', s: 'FAQ, Contact · 24h response', tone: 'ink' },
              ].map((row, i) => (
                <div key={i} style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center', borderBottom: i < 7 ? '1px solid var(--border)' : 0, cursor: 'pointer' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: row.tone === 'sage' ? 'var(--sage-50)' : row.tone === 'gold' ? 'var(--gold-50)' : row.tone === 'terracotta' ? 'var(--terracotta-50)' : 'var(--cream-100)',
                    color: row.tone === 'sage' ? 'var(--sage-700)' : row.tone === 'gold' ? 'var(--gold-600)' : row.tone === 'terracotta' ? 'var(--terracotta-600)' : 'var(--ink-700)',
                    display: 'grid', placeItems: 'center',
                  }}><row.I /></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{row.t}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{row.s}</div>
                  </div>
                  <Icon.arrowR style={{ color: 'var(--ink-400)' }} />
                </div>
              ))}
            </div>

            {/* Sign out */}
            <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Sign out</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>End session on this device</div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-600)', borderColor: 'rgba(182,68,48,0.3)' }}>Sign out</button>
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 0 }}>
            <div style={{ background: 'linear-gradient(160deg, var(--terracotta-50), var(--cream-100))', borderRadius: 22, padding: 24, border: '1px solid var(--border)' }}>
              <div className="eyebrow">Next payout</div>
              <div className="numeral" style={{ fontSize: 38, color: 'var(--terracotta-600)', marginTop: 6 }}>$1,820</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Tue, May 5 · Direct deposit</div>
              <hr className="hr" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <Row k="Completed jobs" v="6" />
                <Row k="Gross earnings" v="$2,015" />
                <Row k="Platform fee" v="−$195" muted />
                <Row k="Tips received" v="+$0" muted />
              </div>
              <button className="btn btn-quiet btn-sm" style={{ width: '100%', marginTop: 12, background: 'white' }}>View full payout breakdown</button>
            </div>

            <div className="card card-pad">
              <div className="eyebrow">Verification status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {[
                  ['Business license', 'Verified · expires Aug 2027'],
                  ['Liability insurance', 'Verified · $2M coverage'],
                  ['Background check', 'Verified · Mar 2026'],
                  ['HOA partnerships', '3 active · Oakwood, Pinecrest, Lakeview'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--sage-50)', color: 'var(--sage-700)', display: 'grid', placeItems: 'center' }}><Icon.check /></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{k}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-pad">
              <div className="eyebrow">Trades offered</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {['Plumbing', 'Drain cleaning', 'Water heaters', 'Leak detection'].map(t => <span key={t} className="chip chip-terracotta">{t}</span>)}
                <span className="chip" style={{ borderStyle: 'dashed', cursor: 'pointer' }}>+ Add</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PStat({ big, label, tone }) {
  return (
    <div>
      <div className="numeral" style={{ fontSize: 26, color: tone === 'terracotta' ? 'var(--terracotta-600)' : tone === 'sage' ? 'var(--sage-700)' : tone === 'gold' ? 'var(--gold-600)' : 'var(--ink-900)', lineHeight: 1 }}>{big}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginTop: 6 }}>{label}</div>
    </div>
  );
}
function Row({ k, v, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--ink-500)' }}>{k}</span>
      <span style={{ fontWeight: 600, color: muted ? 'var(--ink-500)' : 'var(--ink-900)' }}>{v}</span>
    </div>
  );
}
window.ProviderProfile = ProviderProfile;
