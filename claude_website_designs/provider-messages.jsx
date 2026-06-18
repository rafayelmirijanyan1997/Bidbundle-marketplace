function ProviderMessages() {
  const threads = [
    { mk: 'SM', av: 'av-plum', name: 'Sarah M.', t: 'When can your team start?', time: '12m', unread: 2, job: 'Plumbing · 3 homes', active: true },
    { mk: 'JK', av: 'av-blue', name: 'James K.', t: 'Thanks for the quick quote!', time: '1h', unread: 1, job: 'Inspection · solo' },
    { mk: 'AP', av: 'av-sage', name: 'Aisha P. · HOA', t: 'New group RFP for your block — interested?', time: '3h', unread: 1, job: 'Block service' },
    { mk: 'DL', av: 'av-gold', name: 'David L.', t: 'Receipt received, thanks ProFix!', time: 'Yest', job: 'Water heater' },
    { mk: 'PA', av: 'av-terracotta', name: 'Priya A.', t: 'Could we move the appt to Friday?', time: 'Mon', job: 'Drain repair' },
    { mk: 'LO', av: 'av-gold', name: 'Lulu O.', t: 'Left a 5-star review!', time: 'Mar 22', job: 'Block service · 8' },
    { mk: 'TB', av: 'av-blue', name: 'Tom B.', t: 'No water in the kitchen since this morning', time: 'Mar 18', job: 'Emergency call' },
  ];
  const messages = [
    { from: 'them', t: 'Hey ProFix — saw the bid you sent for our block. We have 3 households in. Was wondering when your team could start?', time: '10:42 AM' },
    { from: 'me', t: 'Hi Sarah! Thanks for getting back. We have an opening Thursday or Friday this week, or the following Monday. All-day window of 8 AM – 4 PM.', time: '10:51 AM' },
    { from: 'them', t: 'Friday works for the Hendersons & us. Let me check with the third household.', time: '11:03 AM' },
    { from: 'them', t: 'Confirmed — Friday 8 AM is good for everyone. What do you need from us beforehand?', time: '11:18 AM' },
    { from: 'me', t: 'Just access to the main shutoff. We\'ll bring the inspection cameras and write a per-home report. Should take ~90 min total.', time: '11:22 AM' },
  ];
  return (
    <div className="app">
      <ProviderSidebar active="inbox" />
      <div className="content" style={{ padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr 300px', height: '100%' }}>
          {/* Threads list */}
          <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'white' }}>
            <div style={{ padding: '22px 22px 14px' }}>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em' }}>Inbox</h1>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>4 unread · 7 active threads</div>
              <div style={{ position: 'relative', marginTop: 14 }}>
                <Icon.search style={{ position: 'absolute', left: 12, top: 11, color: 'var(--ink-400)' }} />
                <input placeholder="Search messages…" style={{
                  width: '100%', height: 36, padding: '0 12px 0 34px',
                  borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--cream-50)', fontSize: 13, fontFamily: 'var(--font-body)',
                  color: 'var(--ink-900)', outline: 'none', boxSizing: 'border-box',
                }} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <span className="chip" style={{ background: 'var(--ink-900)', color: 'white' }}>All</span>
                <span className="chip">Unread <span style={{ color: 'var(--terracotta-600)', marginLeft: 4 }}>4</span></span>
                <span className="chip">Active jobs</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {threads.map((th, i) => (
                <div key={i} style={{
                  padding: '12px 22px',
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'flex-start',
                  borderBottom: '1px solid var(--border)',
                  background: th.active ? 'var(--cream-100)' : 'white',
                  borderLeft: th.active ? '3px solid var(--terracotta-500)' : '3px solid transparent',
                  cursor: 'pointer',
                }}>
                  <div className={`avatar ${th.av}`} style={{ width: 36, height: 36, fontSize: 12, marginTop: 2 }}>{th.mk}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{th.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--ink-400)', whiteSpace: 'nowrap' }}>{th.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{th.t}</div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                      <span className="chip" style={{ height: 18, padding: '0 7px', fontSize: 10 }}>{th.job}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    {th.unread ? <span className="chip chip-terracotta" style={{ height: 18, padding: '0 7px', fontSize: 10 }}>{th.unread}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active thread */}
          <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--cream-50)' }}>
            <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar av-plum" style={{ width: 40, height: 40, fontSize: 13 }}>SM</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Sarah Morrison</span>
                    <span className="chip chip-sage chip-dot" style={{ height: 18, fontSize: 10 }}>Verified neighbor</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Maple St · Plumbing inspection · 3 homes</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm">View bid</button>
                <button className="btn btn-quiet btn-sm">Schedule visit</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ alignSelf: 'center', fontSize: 11, color: 'var(--ink-400)', padding: '4px 12px', background: 'var(--cream-100)', borderRadius: 999 }}>Today · April 29</div>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.5,
                    background: m.from === 'me' ? 'var(--terracotta-600)' : 'white',
                    color: m.from === 'me' ? 'white' : 'var(--ink-900)',
                    border: m.from === 'me' ? '0' : '1px solid var(--border)',
                    boxShadow: m.from === 'me' ? '0 4px 12px -6px rgba(194,85,43,0.4)' : 'none',
                    borderBottomRightRadius: m.from === 'me' ? 4 : 14,
                    borderBottomLeftRadius: m.from === 'me' ? 14 : 4,
                  }}>
                    <div>{m.t}</div>
                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: m.from === 'me' ? 'right' : 'left' }}>{m.time}</div>
                  </div>
                </div>
              ))}
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'white', border: '1px solid var(--border)', borderRadius: 14, fontSize: 12, color: 'var(--ink-500)' }}>
                <span style={{ display: 'flex', gap: 3 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--ink-300)' }} />
                  <span style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--ink-300)' }} />
                  <span style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--ink-300)' }} />
                </span>
                Sarah is typing…
              </div>
            </div>

            <div style={{ padding: 18, borderTop: '1px solid var(--border)', background: 'white' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                <span className="chip" style={{ background: 'var(--terracotta-50)', color: 'var(--terracotta-600)' }}><Icon.spark /> Send Friday confirmation</span>
                <span className="chip">📅 Share calendar invite</span>
                <span className="chip">💵 Send updated quote</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--cream-50)', border: '1px solid var(--border)', borderRadius: 14 }}>
                <Icon.paperclip style={{ color: 'var(--ink-500)' }} />
                <input placeholder="Reply to Sarah…" style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink-900)' }} />
                <button className="btn btn-primary btn-sm"><Icon.send /> Send</button>
              </div>
            </div>
          </div>

          {/* Context rail */}
          <div style={{ borderLeft: '1px solid var(--border)', background: 'white', padding: 22, display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
            <div>
              <div className="eyebrow">Job context</div>
              <div className="card card-pad" style={{ marginTop: 8, background: 'var(--cream-50)' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Plumbing inspection</div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>Maple St · 3 homes</div>
                <hr className="hr" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-500)' }}>Bid amount</span><span className="numeral">$570</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-500)' }}>Status</span><span className="chip chip-gold" style={{ height: 18, fontSize: 10 }}>Awaiting decision</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-500)' }}>Submitted</span><span style={{ fontWeight: 600 }}>Apr 27</span></div>
                </div>
              </div>
            </div>
            <div>
              <div className="eyebrow">About Sarah</div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <Detail k="Member since" v="Aug 2023" />
                <Detail k="Jobs together" v="2" />
                <Detail k="Avg payment" v="6 days" />
                <Detail k="Rating left for you" v="★ 4.9 avg" />
              </div>
            </div>
            <div>
              <div className="eyebrow">Shared files</div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['quote-april.pdf', 'before-photos.zip'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--cream-50)', borderRadius: 8, fontSize: 12 }}>
                    <Icon.paperclip style={{ color: 'var(--ink-500)' }} />
                    <span style={{ flex: 1 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Detail({ k, v }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-500)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>;
}
window.ProviderMessages = ProviderMessages;
