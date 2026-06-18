// Landing page — hero, how it works, roles, CTA, footer
function Landing() {
  return (
    <div style={{ width: '100%', background: 'var(--cream-50)', color: 'var(--ink-900)', fontFamily: 'var(--font-body)' }}>
      <LandingNav />
      <Hero />
      <HowItWorks />
      <Roles />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function LandingNav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(251,247,241,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '14px 48px',
      display: 'flex', alignItems: 'center', gap: 32,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="sidebar-brand-mark" style={{ width: 32, height: 32, borderRadius: 10 }}>N</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, letterSpacing: '-0.01em' }}>NeighBid</div>
      </div>
      <div style={{ display: 'flex', gap: 28, fontSize: 14, color: 'var(--ink-700)', fontWeight: 500 }}>
        <a href="#" onClick={(e)=>e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>How it works</a>
        <a href="#" onClick={(e)=>e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>For providers</a>
        <a href="#" onClick={(e)=>e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>For HOAs</a>
        <a href="#" onClick={(e)=>e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Group savings</a>
      </div>
      <div style={{ flex: 1 }} />
      <a href="#" onClick={(e)=>e.preventDefault()} style={{ fontSize: 14, color: 'var(--ink-700)', fontWeight: 500, textDecoration: 'none' }}>Sign in</a>
      <button className="btn btn-primary">Get started free</button>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{
      position: 'relative',
      padding: '80px 48px 100px',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, var(--cream-50) 0%, var(--cream-100) 100%)',
    }}>
      {/* Soft warm orb */}
      <div style={{
        position: 'absolute', right: -120, top: -80,
        width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(224,135,88,0.18), transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', left: -200, bottom: -160,
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(122,154,126,0.14), transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 64, alignItems: 'center', position: 'relative' }}>
        <div>
          <div className="chip chip-sage chip-dot" style={{ height: 28 }}>Live in 80+ neighborhoods</div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 84,
            lineHeight: 0.98,
            letterSpacing: '-0.035em',
            fontWeight: 500,
            margin: '24px 0 0',
            color: 'var(--ink-900)',
          }}>
            Bid together,<br />
            <span style={{
              fontStyle: 'italic',
              fontWeight: 500,
              background: 'linear-gradient(90deg, var(--terracotta-600), var(--terracotta-400))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>save together.</span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-500)', maxWidth: 480, marginTop: 20 }}>
            NeighBid groups your home-service requests with neighbors so providers compete for the whole block — and you all save.
          </p>

          <div style={{ display: 'flex', gap: 14, marginTop: 32, alignItems: 'center' }}>
            <button className="btn btn-primary" style={{ height: 48, padding: '0 24px', fontSize: 15 }}>
              Get started free <Icon.arrowR />
            </button>
            <button className="btn btn-ghost" style={{ height: 48, padding: '0 22px', fontSize: 15, background: 'white' }}>
              See how it works
            </button>
          </div>

          <div style={{ marginTop: 48, display: 'flex', gap: 40, alignItems: 'flex-start' }}>
            <Stat big="2,400+" label="Homeowners" />
            <Divider />
            <Stat big="$310" label="Avg. saved" accent />
            <Divider />
            <Stat big="47" label="Verified providers" />
          </div>

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-500)' }}>
            <div style={{ display: 'flex' }}>
              {['#E08758', '#7A9A7E', '#D6A23E', '#B07AA0', '#6F8DB8'].map((c, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: c, border: '2px solid var(--cream-50)',
                  marginLeft: i === 0 ? 0 : -6,
                }} />
              ))}
            </div>
            Trusted by neighbors in <strong style={{ color: 'var(--ink-900)' }}>Oakwood Heights</strong>, <strong style={{ color: 'var(--ink-900)' }}>Lakeview Park</strong> + 78 more.
          </div>
        </div>

        <HeroBidPanel />
      </div>
    </section>
  );
}

function Stat({ big, label, accent }) {
  return (
    <div>
      <div className="numeral" style={{ fontSize: 30, color: accent ? 'var(--terracotta-600)' : 'var(--ink-900)', lineHeight: 1 }}>{big}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 6 }}>{label}</div>
    </div>
  );
}
function Divider() { return <div style={{ width: 1, height: 36, background: 'var(--border-strong)' }} />; }

function HeroBidPanel() {
  return (
    <div style={{
      background: 'white',
      borderRadius: 24,
      padding: 22,
      boxShadow: '0 30px 60px -20px rgba(31,26,20,0.18), 0 8px 16px -8px rgba(31,26,20,0.08)',
      border: '1px solid var(--border)',
      position: 'relative',
    }}>
      {/* Floating notification */}
      <div style={{
        position: 'absolute', right: -14, top: 28,
        background: 'white', border: '1px solid var(--border)',
        borderRadius: 14, padding: '10px 14px',
        boxShadow: '0 12px 24px -12px rgba(31,26,20,0.12)',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 12,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--sage-50)', color: 'var(--sage-700)', display: 'grid', placeItems: 'center' }}>
          <Icon.pin />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>New neighbor joined</div>
          <div style={{ color: 'var(--ink-500)', fontSize: 11 }}>123 Maple St · Just now</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="eyebrow" style={{ color: 'var(--terracotta-600)' }}>Live bidding room</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-500)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--terracotta-500)', boxShadow: '0 0 0 4px rgba(194,85,43,0.2)' }} />
          Closes 23h
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
        Plumbing — pipe repair
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex' }}>
          {['#E08758', '#7A9A7E', '#D6A23E', '#B07AA0', '#6F8DB8', '#3D362B'].map((c, i) => (
            <div key={i} style={{
              width: 22, height: 22, borderRadius: '50%',
              background: c, border: '2px solid white',
              marginLeft: i === 0 ? 0 : -6,
              fontSize: 9, color: 'white', fontWeight: 600,
              display: 'grid', placeItems: 'center',
            }}>{['MC','JR','AP','TS','LS','+8'][i]}</div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>14 neighbors joined · 23h left</div>
      </div>

      {/* Bid rows */}
      {[
        { p: 'ProFix Plumbing', av: 'av-blue', mark: 'PF', rating: 4.9, jobs: 248, price: '$280', eta: '2d est.', best: true },
        { p: 'AquaHome Services', av: 'av-sage', mark: 'AH', rating: 4.7, jobs: 183, price: '$320', eta: '4d est.', best: false },
        { p: 'City Pro Plumbing', av: 'av-gold', mark: 'CP', rating: 4.6, jobs: 107, price: '$350', eta: '3d est.', best: false },
      ].map((b, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
          padding: 14, marginBottom: 8,
          borderRadius: 14,
          background: b.best ? 'linear-gradient(180deg, var(--terracotta-50), white)' : 'var(--cream-50)',
          border: b.best ? '1px solid var(--terracotta-100)' : '1px solid var(--border)',
        }}>
          <div className={`avatar ${b.av}`} style={{ width: 36, height: 36, borderRadius: 10, fontSize: 12 }}>{b.mark}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{b.p}</div>
              {b.best ? <span className="chip chip-sage" style={{ height: 18, fontSize: 10 }}>Best value</span> : null}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Icon.star style={{ color: 'var(--gold-500)' }} /> {b.rating} · {b.jobs} jobs
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="numeral" style={{ fontSize: 18, fontWeight: 500, color: b.best ? 'var(--terracotta-600)' : 'var(--ink-900)' }}>{b.price}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 2 }}>{b.eta}</div>
          </div>
        </div>
      ))}

      <div style={{
        margin: '14px 4px 12px',
        padding: '10px 14px',
        borderRadius: 12,
        background: 'var(--sage-50)',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 12, color: 'var(--sage-700)', fontWeight: 600,
      }}>
        <span style={{ display: 'inline-grid', placeItems: 'center', width: 22, height: 22, borderRadius: '50%', background: 'var(--sage-600)', color: 'white' }}><Icon.check /></span>
        $120 saved vs. solo quote (avg $400)
      </div>

      <button className="btn btn-primary" style={{ width: '100%', height: 46, fontSize: 14 }}>
        Accept best bid · $280
      </button>
    </div>
  );
}

window.Landing = Landing;
window.LandingNav = LandingNav;
window.Hero = Hero;
window.HeroBidPanel = HeroBidPanel;
