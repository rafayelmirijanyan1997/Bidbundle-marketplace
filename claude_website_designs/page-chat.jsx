// Chat page — clear hierarchy, AI as hero, threads tidy
function PageChat() {
  return (
    <div className="app">
      <Sidebar active="chat" />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', overflow: 'hidden' }}>
        {/* Threads list */}
        <div style={{ borderRight: '1px solid var(--border)', background: 'var(--cream-50)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 20px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>Messages</div>
              <span className="chip chip-terracotta">3 new</span>
            </div>
            <div className="field" style={{ marginTop: 14, height: 36 }}>
              <Icon.search />
              <input placeholder="Search neighbors, bids, providers…" />
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '0 12px 16px' }}>
            {/* AI assistant — pinned */}
            <div className="eyebrow" style={{ padding: '10px 8px 6px' }}>AI assistant</div>
            <div style={{
              padding: 12,
              borderRadius: 12,
              background: 'linear-gradient(135deg, white, var(--terracotta-50))',
              border: '1px solid var(--terracotta-100)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
              boxShadow: '0 0 0 3px rgba(194,85,43,0.05)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--terracotta-600)', display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
                <Icon.spark />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>NeighBid AI</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-400)' }}>Just now</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Based on the 3 bids received, ProFix is the best…
                </div>
              </div>
            </div>

            <div className="eyebrow" style={{ padding: '18px 8px 6px' }}>Group bids · 2</div>
            {[
              { name: 'Plumbing group', avatar: 'PG', av: 'av-blue', preview: 'Has everyone agreed on ProFix?', time: '8:52 AM', unread: 2 },
              { name: 'Lawn care group', avatar: 'LC', av: 'av-sage', preview: 'Great! Once we hit 6 neighbors…', time: '7:32 AM', unread: 0 },
            ].map((t, i) => (
              <div key={i} style={{
                padding: 12, borderRadius: 12, marginTop: 4,
                display: 'flex', gap: 10, alignItems: 'center',
                cursor: 'pointer',
              }}>
                <div className={`avatar ${t.av}`} style={{ width: 36, height: 36, fontSize: 12 }}>{t.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-400)' }}>{t.time}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.preview}
                  </div>
                </div>
                {t.unread ? (
                  <span style={{ minWidth: 18, height: 18, padding: '0 6px', borderRadius: 9, background: 'var(--terracotta-600)', color: 'white', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{t.unread}</span>
                ) : null}
              </div>
            ))}

            <div className="eyebrow" style={{ padding: '18px 8px 6px' }}>Providers · 1</div>
            <div style={{ padding: 12, borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
              <div className="avatar av-gold" style={{ width: 36, height: 36, fontSize: 12 }}>PF</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ProFix Plumbing
                    <span title="Verified" style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--sage-50)', color: 'var(--sage-700)', display: 'grid', placeItems: 'center' }}><Icon.check /></span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-400)' }}>9:00 AM</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Absolutely — if confirmed today…
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>
          {/* Conversation header */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--terracotta-600)', display: 'grid', placeItems: 'center', color: 'white' }}>
              <Icon.spark />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>NeighBid AI</div>
                <span className="chip chip-sage chip-dot">Online</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Bids · providers · savings · group decisions</div>
            </div>
            <button className="btn btn-ghost btn-sm">View bids</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Today</div>

            {/* AI bubble */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', maxWidth: 640 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--terracotta-600)', display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
                <Icon.spark />
              </div>
              <div>
                <div style={{
                  background: 'var(--cream-100)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px',
                  fontSize: 14, lineHeight: 1.55, color: 'var(--ink-900)',
                }}>
                  Hi Lance. I can compare bids, explain ratings, and help you decide when to confirm. What's on your mind?
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 4, marginLeft: 4 }}>now</div>
              </div>
            </div>

            {/* User bubble */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ maxWidth: 480 }}>
                <div style={{
                  background: 'var(--terracotta-600)',
                  color: 'white',
                  borderRadius: '18px 18px 4px 18px',
                  padding: '12px 16px',
                  fontSize: 14, lineHeight: 1.5,
                }}>
                  Which bid should I accept for the plumbing inspection?
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 4, textAlign: 'right' }}>Just now</div>
              </div>
            </div>

            {/* AI rich response — comparison card */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', maxWidth: 720 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--terracotta-600)', display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
                <Icon.spark />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: 0,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ padding: '14px 18px 8px', fontSize: 14, lineHeight: 1.55 }}>
                    Based on the 3 bids received, <strong>ProFix Plumbing</strong> is the best choice:
                  </div>
                  <div style={{ padding: '0 18px 14px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 6 }}>
                      <thead>
                        <tr style={{ color: 'var(--ink-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600 }}>Provider</th>
                          <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600 }}>Bid</th>
                          <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600 }}>Rating</th>
                          <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600 }}>ETA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { p: 'ProFix Plumbing', b: '$490', r: '4.9', e: '2 days', best: true },
                          { p: 'AquaFlow', b: '$530', r: '4.6', e: '4 days', best: false },
                          { p: 'PipePro', b: '$575', r: '4.4', e: '3 days', best: false },
                        ].map((row, i) => (
                          <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 0', fontWeight: 600, color: row.best ? 'var(--terracotta-600)' : 'var(--ink-900)' }}>
                              {row.p} {row.best ? <span className="chip chip-sage" style={{ marginLeft: 4, height: 18, fontSize: 10 }}>Best</span> : null}
                            </td>
                            <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{row.b}</td>
                            <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--ink-700)' }}><Icon.star style={{ color: 'var(--gold-500)', verticalAlign: '-2px' }} /> {row.r}</td>
                            <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--ink-700)' }}>{row.e}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '12px 18px', background: 'var(--cream-50)', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--ink-700)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 600, color: 'var(--terracotta-600)' }}>Recommendation:</span>
                    Accept ProFix — saves $85 vs solo, fastest, highest rated.
                    <div style={{ flex: 1 }} />
                    <button className="btn btn-primary btn-sm">Accept bid</button>
                    <button className="btn btn-ghost btn-sm">Compare</button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 4, marginLeft: 4 }}>just now</div>
              </div>
            </div>
          </div>

          {/* Composer */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '14px 28px 22px', background: 'white' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {['Which bid is best value?', 'Compare ProFix vs AquaFlow', 'When should I confirm?', 'What\'s a fair price?'].map((s, i) => (
                <button key={i} className="btn btn-quiet btn-sm" style={{ background: 'var(--cream-100)' }}>{s}</button>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 6px 6px 14px',
              background: 'var(--cream-100)',
              borderRadius: 22,
              border: '1px solid transparent',
            }}>
              <Icon.paperclip style={{ color: 'var(--ink-400)' }} />
              <input
                placeholder="Ask NeighBid AI anything…"
                style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 14, fontFamily: 'inherit', color: 'var(--ink-900)', padding: '10px 0' }}
              />
              <button className="btn btn-primary" style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}>
                <Icon.send />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PageChat = PageChat;
