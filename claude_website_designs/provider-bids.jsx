function ProviderBids() {
  const bids = [
    { mk: 'P', av: 'av-sage', t: 'Plumbing leak', addr: 'Maple St · 3 homes', amount: '$3,325', date: 'Apr 18', status: 'won' },
    { mk: 'L', av: 'av-blue', t: 'Lawn care bundle', addr: 'Oak St · 6 homes', amount: '$720', date: 'Today', status: 'progress' },
    { mk: 'H', av: 'av-sage', t: 'Handyman block', addr: 'Elm Ct · 2 homes', amount: '$680', date: 'Apr 10', status: 'won' },
    { mk: 'W', av: 'av-blue', t: 'Water heater service', addr: 'Pine Ave · 4 homes', amount: '$880', date: 'Mar 30', status: 'progress' },
    { mk: 'G', av: 'av-plum', t: 'Gutter clean', addr: 'Ash Blvd · 2 homes', amount: '—', date: 'Mar 26', status: 'lost' },
    { mk: 'D', av: 'av-gold', t: 'Driveway pressure wash', addr: 'Cedar Ln · 5 homes', amount: 'Pending', date: '8h left', status: 'pending' },
  ];
  const statusChip = {
    won: { c: 'chip-sage chip-dot', label: 'Won' },
    progress: { c: 'chip-gold', label: 'In progress' },
    lost: { c: '', label: 'Lost' },
    pending: { c: 'chip-terracotta chip-dot', label: 'Awaiting decision' },
  };
  return (
    <div className="app">
      <ProviderSidebar active="bids" />
      <div className="content">
        <div className="topbar">
          <div>
            <h1>My bids</h1>
            <p>6 bids · $5,605 won this month · 92% win rate</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost"><Icon.search /> Search</button>
            <button className="btn btn-primary"><Icon.plus /> Quick bid</button>
          </div>
        </div>

        <div className="scroll">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
            <KStat eyebrow="Pending" big="1" sub="awaiting decision" tone="terracotta" />
            <KStat eyebrow="Won" big="3" sub="$4,725 booked" tone="sage" />
            <KStat eyebrow="Win rate" big="92%" sub="last 30 days" tone="gold" />
            <KStat eyebrow="Avg bid value" big="$934" sub="per group" tone="ink" />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '0 4px' }}>
            {[
              { l: 'All', n: 6, on: true },
              { l: 'Pending', n: 1 },
              { l: 'Active', n: 2 },
              { l: 'Won', n: 2 },
              { l: 'Lost', n: 1 },
            ].map((t, i) => (
              <button key={i} className="btn btn-sm" style={{
                background: t.on ? 'var(--ink-900)' : 'transparent',
                color: t.on ? 'white' : 'var(--ink-700)',
                fontWeight: 600,
              }}>{t.l} <span style={{ marginLeft: 4, fontSize: 11, padding: '1px 7px', borderRadius: 9, background: t.on ? 'rgba(255,255,255,0.18)' : 'var(--cream-200)', color: t.on ? 'white' : 'var(--ink-500)' }}>{t.n}</span></button>
            ))}
            <div style={{ flex: 1 }} />
            <button className="btn btn-ghost btn-sm">Sort: Recent ↓</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bids.map((b, i) => {
              const s = statusChip[b.status];
              return (
                <div key={i} className="card" style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', gap: 18, alignItems: 'center' }}>
                  <div className={`avatar ${b.av}`} style={{ width: 40, height: 40, borderRadius: 11, fontFamily: 'var(--font-display)', fontSize: 14 }}>{b.mk}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{b.t}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{b.addr}</div>
                  </div>
                  <span className={`chip ${s.c}`}>{s.label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div className="numeral" style={{ fontSize: 17, color: b.status === 'lost' ? 'var(--ink-400)' : 'var(--ink-900)' }}>{b.amount}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{b.date}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm">Open →</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
window.ProviderBids = ProviderBids;
