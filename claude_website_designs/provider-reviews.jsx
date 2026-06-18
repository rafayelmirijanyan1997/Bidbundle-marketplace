function ProviderReviews() {
  const dist = [{ s: 5, n: 108, p: 84 }, { s: 4, n: 14, p: 11 }, { s: 3, n: 4, p: 3 }, { s: 2, n: 1, p: 1 }, { s: 1, n: 1, p: 1 }];
  const reviews = [
    { mk: 'SM', av: 'av-plum', name: 'Sarah M.', date: 'Apr 20', stars: 5, t: 'I shared the group plumbing job for 2 homes on our block and they coordinated perfectly. Saved us both ~$120.', tag: 'Plumbing · group of 3' },
    { mk: 'JK', av: 'av-blue', name: 'James K.', date: 'Apr 12', stars: 4, t: 'Showed up on time and left no mess. Would use through NeighBid again.', tag: 'Inspection · solo' },
    { mk: 'PA', av: 'av-terracotta', name: 'Priya A.', date: 'Mar 30', stars: 5, t: 'Best quote in the group bid. Saved everyone money and did quality work — ProFix was patient with our scheduling.', tag: 'Plumbing · group of 5' },
    { mk: 'LO', av: 'av-gold', name: 'Lulu O.', date: 'Mar 22', stars: 5, t: 'Coordinated the whole block. Saved everyone money. Highly recommend for HOA-wide jobs.', tag: 'Block service · 8 homes' },
  ];
  return (
    <div className="app">
      <ProviderSidebar active="reviews" />
      <div className="content">
        <div className="topbar">
          <div>
            <h1>Reviews</h1>
            <p>128 verified reviews from NeighBid neighbors</p>
          </div>
          <button className="btn btn-ghost"><Icon.edit /> Reply settings</button>
        </div>

        <div className="scroll" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 22 }}>
          {/* Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card card-pad" style={{ background: 'linear-gradient(160deg, white, var(--cream-100))' }}>
              <div className="eyebrow">Overall</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
                <div className="numeral" style={{ fontSize: 56, color: 'var(--gold-600)', lineHeight: 1 }}>4.9</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(i=><Icon.star key={i} style={{ color: 'var(--gold-500)', width: 16, height: 16 }} />)}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>128 reviews · 30d</div>
                </div>
              </div>
              <hr className="hr" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dist.map((d) => (
                  <div key={d.s} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 36px', gap: 10, alignItems: 'center', fontSize: 12 }}>
                    <span style={{ color: 'var(--ink-500)' }}>{d.s}★</span>
                    <div style={{ height: 6, background: 'var(--cream-200)', borderRadius: 999 }}>
                      <div style={{ height: '100%', width: `${d.p}%`, background: 'var(--gold-500)', borderRadius: 999 }} />
                    </div>
                    <span style={{ color: 'var(--ink-500)', textAlign: 'right' }}>{d.n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card card-pad">
              <div className="eyebrow">What neighbors mention</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {[['On time', 92], ['Clean work', 78], ['Communication', 64], ['Fair price', 58], ['Coordinated block', 41], ['Friendly', 33]].map(([k, n]) => (
                  <span key={k} className="chip" style={{ background: 'var(--cream-100)' }}>{k} <span style={{ color: 'var(--ink-400)', marginLeft: 4 }}>{n}</span></span>
                ))}
              </div>
            </div>
            <div className="card card-pad">
              <div className="eyebrow">Trend</div>
              <div className="numeral" style={{ fontSize: 22, marginTop: 4 }}>+0.2 ★ <span style={{ fontSize: 12, color: 'var(--sage-700)', fontWeight: 600 }}>vs last 90d</span></div>
              <svg viewBox="0 0 200 60" width="100%" height="50" preserveAspectRatio="none" style={{ marginTop: 8 }}>
                <path d="M0 40 L25 38 L50 35 L75 30 L100 28 L125 22 L150 20 L175 16 L200 12" fill="none" stroke="#B8862B" strokeWidth="2"/>
                <circle cx="200" cy="12" r="3" fill="#B8862B"/>
              </svg>
            </div>
          </div>

          {/* Reviews list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px' }}>
              <span className="chip" style={{ background: 'var(--ink-900)', color: 'white' }}>All</span>
              <span className="chip">5★ only</span>
              <span className="chip">Needs reply <span style={{ color: 'var(--terracotta-600)', marginLeft: 4 }}>2</span></span>
              <div style={{ flex: 1 }} />
              <button className="btn btn-ghost btn-sm">Sort: Recent</button>
            </div>
            {reviews.map((r, i) => (
              <div key={i} className="card card-pad">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div className={`avatar ${r.av}`} style={{ width: 40, height: 40, fontSize: 12 }}>{r.mk}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                        <span className="chip chip-sage chip-dot" style={{ height: 18, fontSize: 10 }}>Verified neighbor</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{r.date}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                      {[1,2,3,4,5].map(s => <Icon.star key={s} style={{ color: s <= r.stars ? 'var(--gold-500)' : 'var(--ink-200)', width: 14, height: 14 }}/>)}
                      <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-500)' }}>{r.tag}</span>
                    </div>
                    <p style={{ margin: '10px 0 0', fontSize: 14, color: 'var(--ink-700)', lineHeight: 1.55 }}>{r.t}</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                      <button className="btn btn-quiet btn-sm">Reply publicly</button>
                      <button className="btn btn-ghost btn-sm">Thank privately</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.ProviderReviews = ProviderReviews;
