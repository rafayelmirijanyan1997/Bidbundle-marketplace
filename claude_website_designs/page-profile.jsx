// Profile / Account — cleaner sections, calmer hierarchy
function PageProfile() {
  return (
    <div className="app">
      <Sidebar active="profile" />
      <div className="content">
        <div className="topbar">
          <div>
            <h1>Account</h1>
            <p>Profile, neighborhood, notifications.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="chip chip-sage chip-dot">HOA verified</span>
            <button className="btn btn-ghost"><Icon.edit /> Edit profile</button>
          </div>
        </div>

        <div className="scroll" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, alignItems: 'start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Profile header card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: 88,
                background: 'linear-gradient(135deg, var(--terracotta-100), var(--cream-200) 60%, var(--sage-100))',
              }} />
              <div style={{ padding: '0 28px 24px', marginTop: -38 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                  <div className="avatar av-terracotta" style={{ width: 76, height: 76, fontSize: 24, border: '4px solid white', boxShadow: 'var(--shadow-md)' }}>LS</div>
                  <div style={{ flex: 1, paddingBottom: 6 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em' }}>Lance Silva</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, color: 'var(--ink-500)', fontSize: 13 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {[1,2,3,4].map((s) => <Icon.star key={s} style={{ color: 'var(--gold-500)' }} />)}
                        <Icon.star style={{ color: 'var(--ink-200)' }} />
                        <span style={{ marginLeft: 4 }}>4.0 · 3 bookings</span>
                      </span>
                      <span style={{ color: 'var(--ink-300)' }}>·</span>
                      <span>Member since Nov 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal info */}
            <div className="card">
              <div style={{ padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="eyebrow">Personal information</div>
                <button className="btn btn-ghost btn-sm">Edit all</button>
              </div>
              <hr className="hr" />
              {[
                { k: 'Full name', v: 'Lance Silva' },
                { k: 'Email', v: 'lance@email.com' },
                { k: 'Phone', v: '+1 (215) 555-0192' },
              ].map((row, i) => (
                <div key={i} style={{ padding: '14px 24px', display: 'grid', gridTemplateColumns: '160px 1fr auto', alignItems: 'center', borderBottom: i < 2 ? '1px solid var(--border)' : 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>{row.k}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-900)' }}>{row.v}</div>
                  <button className="iconbtn"><Icon.edit /></button>
                </div>
              ))}
            </div>

            {/* Service area */}
            <div className="card">
              <div style={{ padding: '20px 24px 12px' }}>
                <div className="eyebrow">Service area</div>
              </div>
              <hr className="hr" />
              <div style={{ padding: '18px 24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Icon.pin style={{ color: 'var(--terracotta-600)' }} />
                    <div style={{ fontWeight: 600, fontSize: 14 }}>123 Maple St, Oakwood Heights</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 16 }}>Used to match local providers and neighbor groups.</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Community radius</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--terracotta-600)' }}>8 mi</div>
                  </div>
                  <div style={{ position: 'relative', height: 6, background: 'var(--cream-200)', borderRadius: 999 }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '55%', background: 'var(--terracotta-500)', borderRadius: 999 }} />
                    <div style={{ position: 'absolute', left: '55%', top: -5, width: 16, height: 16, background: 'white', border: '3px solid var(--terracotta-600)', borderRadius: '50%', transform: 'translateX(-50%)' }} />
                  </div>
                </div>
                {/* Decorative map */}
                <div style={{ position: 'relative', height: 140, borderRadius: 14, overflow: 'hidden', background: 'var(--sage-50)' }}>
                  <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="none">
                    <rect width="200" height="140" fill="#EBF1EC" />
                    <path d="M0 60 L60 50 L100 70 L160 55 L200 65 L200 80 L0 80 Z" fill="#DCE7DD" />
                    <path d="M20 100 L80 90 L130 110 L200 100 L200 140 L0 140 Z" fill="#C9DBCB" />
                    <path d="M0 30 H200" stroke="#B5C9B7" strokeWidth="0.6" strokeDasharray="2 3" />
                    <circle cx="100" cy="70" r="38" fill="rgba(194,85,43,0.10)" stroke="rgba(194,85,43,0.4)" strokeDasharray="3 3" />
                    <circle cx="100" cy="70" r="6" fill="#C2552B" stroke="white" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <div style={{ padding: '20px 24px 12px' }}>
                <div className="eyebrow">Notifications</div>
              </div>
              <hr className="hr" />
              {[
                { t: 'Bid updates', s: 'When providers submit or update bids', on: true, ch: ['Email', 'Push'] },
                { t: 'Group activity', s: 'When neighbors join or comment', on: true, ch: ['Push'] },
                { t: 'Savings reports', s: 'Monthly recap of money saved', on: false, ch: ['Email'] },
              ].map((n, i) => (
                <div key={i} style={{ padding: '14px 24px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'center', borderBottom: i < 2 ? '1px solid var(--border)' : 0 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{n.t}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{n.s}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {n.ch.map((c) => <span key={c} className="chip" style={{ height: 22 }}>{c}</span>)}
                  </div>
                  <div style={{
                    width: 38, height: 22, borderRadius: 11,
                    background: n.on ? 'var(--sage-600)' : 'var(--cream-300)',
                    position: 'relative', cursor: 'pointer',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: n.on ? 18 : 2,
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.15s',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, position: 'sticky', top: 0 }}>
            {/* Impact */}
            <div style={{
              background: 'linear-gradient(160deg, var(--cream-100), var(--cream-200))',
              borderRadius: 22, padding: 24, border: '1px solid var(--border)',
            }}>
              <div className="eyebrow">Your impact</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 14 }}>
                <div>
                  <div className="numeral" style={{ fontSize: 28, color: 'var(--terracotta-600)', lineHeight: 1 }}>$310</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 4 }}>Saved</div>
                </div>
                <div>
                  <div className="numeral" style={{ fontSize: 28, lineHeight: 1 }}>7</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 4 }}>Neighbors</div>
                </div>
                <div>
                  <div className="numeral" style={{ fontSize: 28, lineHeight: 1 }}>3</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 4 }}>Active bids</div>
                </div>
              </div>
              <div style={{
                marginTop: 16, padding: 12, borderRadius: 12,
                background: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--sage-50)', color: 'var(--sage-700)', display: 'grid', placeItems: 'center' }}>
                  <Icon.shield />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>HOA verified</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Oakwood Heights · 14 months</div>
                </div>
                <Icon.check style={{ color: 'var(--sage-700)' }} />
              </div>
            </div>

            {/* Quick links */}
            <div className="card card-pad">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Quick links</div>
              {[
                { t: 'View my bids', s: 'Active and past bookings', I: Icon.bids },
                { t: 'Savings history', s: '$310 across 4 services', I: Icon.spark },
                { t: 'Neighborhood chat', s: '3 unread messages', I: Icon.chat },
              ].map((l, i) => (
                <a key={i} href="#" onClick={(e)=>e.preventDefault()} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderTop: i ? '1px solid var(--border)' : 0,
                  textDecoration: 'none', color: 'var(--ink-900)',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--cream-100)', color: 'var(--terracotta-600)', display: 'grid', placeItems: 'center' }}>
                    <l.I />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{l.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{l.s}</div>
                  </div>
                  <Icon.arrowR style={{ color: 'var(--ink-400)' }} />
                </a>
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
        </div>
      </div>
    </div>
  );
}

window.PageProfile = PageProfile;
