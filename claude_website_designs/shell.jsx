// Inline SVG icons — small set used across all pages
const Icon = {
  home: (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>,
  chat: (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z" /></svg>,
  bids: (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 6h16M4 12h16M4 18h10" /></svg>,
  user: (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>,
  settings: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a7.97 7.97 0 0 0 0-6l1.6-1.2-2-3.4-1.9.8a8 8 0 0 0-5.2-3L11.5 0h-.001L11 0l-.5 2.2a8 8 0 0 0-5.2 3l-1.9-.8-2 3.4 1.6 1.2a7.97 7.97 0 0 0 0 6L1.4 16l2 3.4 1.9-.8a8 8 0 0 0 5.2 3L11 24l1-2.2a8 8 0 0 0 5.2-3l1.9.8 2-3.4-1.6-1.2z"/></svg>,
  back: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 6l-6 6 6 6"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  arrowR: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12l5 5L20 6"/></svg>,
  spark: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.8 5L19 9.8 14 11.6 12 17l-1.8-5.4L5 9.8 10.2 8z"/></svg>,
  bell: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  search: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>,
  shield: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/></svg>,
  leaf: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 19c0-9 7-14 16-14-1 9-5 16-14 16a4 4 0 0 1-2-2z"/><path d="M5 19l8-8"/></svg>,
  wrench: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 6a4 4 0 0 1 5 5l-9 9-4 1 1-4 9-9z"/></svg>,
  broom: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 4l6 6-7 7H6v-7z"/><path d="M6 14l-3 6 6-3"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none" {...p}><path d="M12 2l3 6.5 7 .9-5.1 4.7 1.3 7-6.2-3.4-6.2 3.4 1.3-7L2 9.4l7-.9z"/></svg>,
  send: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>,
  paperclip: (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12l-9 9a5 5 0 1 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 1 1-3-3l8-8"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  edit: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 21l3.5-1 11-11-2.5-2.5-11 11z"/><path d="M14 5l2.5 2.5"/></svg>,
};

// Sidebar — used by every page
function Sidebar({ active = 'home' }) {
  const items = [
    { key: 'home', label: 'Home', Icon: Icon.home },
    { key: 'chat', label: 'Chat', Icon: Icon.chat, badge: 3 },
    { key: 'bids', label: 'My bids', Icon: Icon.bids },
    { key: 'profile', label: 'Profile', Icon: Icon.user },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">N</div>
        <div>NeighBid</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(({ key, label, Icon: I, badge }) => (
          <a key={key} className={active === key ? 'active' : ''} onClick={(e) => e.preventDefault()} href="#">
            <I />
            <span style={{ flex: 1 }}>{label}</span>
            {badge ? <span className="chip chip-terracotta" style={{ height: 18, padding: '0 7px', fontSize: 11 }}>{badge}</span> : null}
          </a>
        ))}
      </div>

      <div className="sidebar-section-label">Your neighborhood</div>
      <div style={{ padding: '0 4px' }}>
        <div style={{
          padding: 12,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E8DFCF', fontSize: 13, fontWeight: 600 }}>
            <Icon.pin /> Oakwood Heights
          </div>
          <div style={{ color: '#8C8273', fontSize: 11, marginTop: 4 }}>47 neighbors · 2 new this week</div>
          <div style={{ marginTop: 10, display: 'flex' }}>
            {['#E08758', '#7A9A7E', '#D6A23E', '#B07AA0'].map((c, i) => (
              <div key={i} style={{
                width: 22, height: 22, borderRadius: '50%',
                background: c, border: '2px solid #221C16',
                marginLeft: i === 0 ? 0 : -6, fontSize: 10, color: 'white',
                display: 'grid', placeItems: 'center', fontWeight: 600,
              }}>{['MC', 'JR', 'AP', 'TS'][i]}</div>
            ))}
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: '#3D362B', border: '2px solid #221C16',
              marginLeft: -6, fontSize: 9, color: '#E8DFCF',
              display: 'grid', placeItems: 'center', fontWeight: 600,
            }}>+43</div>
          </div>
        </div>
      </div>

      <div className="sidebar-spacer" />

      <div className="sidebar-footer">
        <button className="nav"><Icon.settings /> Settings</button>
        <button className="nav"><Icon.back /> Back to site</button>
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">LS</div>
          <div className="sidebar-user-meta">
            <div className="sidebar-user-name">Lance Silva</div>
            <div className="sidebar-user-role">Homeowner · HOA verified</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Icon, Sidebar });
