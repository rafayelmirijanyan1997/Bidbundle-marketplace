import Link from "next/link";

import { LandingAnimations } from "@/components/marketing/LandingAnimations";

import "./landing.css";

export default function HomePage() {
  return (
    <div>
      <nav className="top">
        <div className="wrap nav-row">
          <Link className="brand" href="/">
            <div className="logo">N</div>
            <div className="brand-name">BidBundle</div>
          </Link>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#roles">For Providers</a>
            <a href="#savings">Group Savings</a>
            <a href="#pulse">Neighborhoods</a>
          </div>
          <div className="nav-right">
            <Link className="signin" href="/sign-in">
              Sign in
            </Link>
            <Link className="btn btn-primary" href="/get-started">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">
              <span className="dot"></span> Live in 80+ neighborhoods
            </span>
            <h1 className="hero-title serif">
              <span className="lt serif-i">Bid together,</span>
              <span className="lb serif-i">save together.</span>
            </h1>
            <p className="hero-sub">
              When neighbors need the same service, BidBundle groups your demand and gets
              providers competing for the whole block — so you pay group prices, not solo
              ones.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary btn-lg" href="/get-started">
                Get started free <span className="arrow">→</span>
              </Link>
              <a className="secondary-link" href="#how">
                See how it works <span className="arrow">→</span>
              </a>
            </div>
            <div className="hero-stats">
              <div className="hstat">
                <div className="n">2,400+</div>
                <div className="l">Homeowners</div>
              </div>
              <div className="hstat">
                <div className="n accent">$310</div>
                <div className="l">Avg. saved</div>
              </div>
              <div className="hstat">
                <div className="n">47</div>
                <div className="l">Verified providers</div>
              </div>
            </div>
          </div>

          <div className="hero-card-wrap">
            <div className="hero-card">
              <div className="hc-head">
                <span className="hc-pill">
                  <span className="dot"></span> Live bidding
                </span>
                <span className="hc-time">Closes in 32h 18m</span>
              </div>
              <div className="hc-title">Plumbing — pipe repair</div>
              <div className="hc-sub">Oakwood Heights · 14 neighbors joined</div>
              <div className="hc-avatars">
                <div className="av-stack">
                  <div className="av av-1">MC</div>
                  <div className="av av-2">PG</div>
                  <div className="av av-3">LC</div>
                  <div className="av av-4">JR</div>
                </div>
                <span className="av-count">+10 more</span>
              </div>

              <div className="bid-row best">
                <div className="br-left">
                  <div className="br-icon pf">PF</div>
                  <div>
                    <div className="br-name">
                      ProFix Plumbing <span className="best-tag">Best</span>
                    </div>
                    <div className="br-meta">★ 4.9 · 248 jobs · 2 days</div>
                  </div>
                </div>
                <div>
                  <div className="br-price">$280</div>
                  <div className="br-est">2d est.</div>
                </div>
              </div>
              <div className="bid-row">
                <div className="br-left">
                  <div className="br-icon ah">AH</div>
                  <div>
                    <div className="br-name">AquaHome Services</div>
                    <div className="br-meta">★ 4.7 · 183 jobs · 4 days</div>
                  </div>
                </div>
                <div>
                  <div className="br-price">$320</div>
                  <div className="br-est">4d est.</div>
                </div>
              </div>
              <div className="bid-row">
                <div className="br-left">
                  <div className="br-icon cp">CP</div>
                  <div>
                    <div className="br-name">City Pro Plumbing</div>
                    <div className="br-meta">★ 4.8 · 207 jobs · 3 days</div>
                  </div>
                </div>
                <div>
                  <div className="br-price">$350</div>
                  <div className="br-est">3d est.</div>
                </div>
              </div>

              <div className="savings-strip">
                <div className="l">
                  ⚡ <span><b>$280 group bid</b> · solo avg. $400</span>
                </div>
                <div className="r">−$120 vs solo</div>
              </div>
              <button className="accept-btn">Accept bid — $280</button>
            </div>

            <div className="float-card">
              <div className="fc-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#79C39B"
                  strokeWidth="2.4"
                >
                  <path d="M3 12l2 2 4-4M3 17l2 2 4-4M14 7h7M14 12h7M14 17h7" />
                </svg>
              </div>
              <div className="fc-text">
                <div className="t">New neighbor joined</div>
                <div className="s">103 Maple St · just now</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-eye">How it works</span>
            <h2 className="sec-title serif-i">Group demand gives neighbors better pricing.</h2>
            <p className="sec-sub">
              Three steps. No solo negotiating. No middlemen. Just better prices because
              your neighbors need the same thing.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-body">
                <div className="t">
                  Describe what you need <span className="badge badge-ai">AI-powered</span>
                </div>
                <div className="d">
                  Tell BidBundle the service you need in plain language. AI detects the
                  category and surfaces nearby neighbors with the same request — instantly.
                </div>
              </div>
              <div className="step-arrow">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </div>
            </div>

            <div className="step">
              <div className="step-num">02</div>
              <div className="step-body">
                <div className="t">
                  Get grouped automatically <span className="badge badge-instant">Instant</span>
                </div>
                <div className="d">
                  Neighbors on the same request form a buying group. Providers quote the
                  whole block at once — bulk demand means dramatically better pricing.
                </div>
              </div>
              <div className="step-arrow">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </div>
            </div>

            <div className="step">
              <div className="step-num">03</div>
              <div className="step-body">
                <div className="t">
                  Compare bids, confirm{" "}
                  <span className="badge badge-trans">Transparent</span>
                </div>
                <div className="d">
                  Providers submit transparent bids. You see every offer ranked by value
                  and rating. Pick who you trust, confirm in one click.
                </div>
              </div>
              <div className="step-arrow">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="how-strip">
            <div className="l">Up to 40% off vs. solo quotes</div>
            <div className="how-strip-stats">
              <div className="hss">
                <div className="n accent">$310</div>
                <div className="l">Avg. saved</div>
              </div>
              <div className="hss">
                <div className="n">14</div>
                <div className="l">Neighbors / bid</div>
              </div>
              <div className="hss">
                <div className="n">40%</div>
                <div className="l">Typical discount</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="roles" id="roles">
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-eye">Built for everyone</span>
            <h2 className="sec-title serif-i">One platform, three roles.</h2>
          </div>

          <div className="roles-grid">
            <div className="role">
              <div className="role-icon h">H</div>
              <div className="pill">Homeowner</div>
              <h3>Save more by sticking together</h3>
              <p>Join neighbors on shared bids and watch your savings compound over time.</p>
              <ul>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  Group pricing on every service
                </li>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  AI category &amp; group detection
                </li>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  End-to-end bid tracking
                </li>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  Chat with verified neighbors
                </li>
              </ul>
            </div>

            <div className="role">
              <div className="role-icon p">P</div>
              <div className="pill">Service provider</div>
              <h3>Win bulk jobs, grow faster</h3>
              <p>
                Real-time group job alerts, competitive bidding, and a verified reputation
                engine.
              </p>
              <ul>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  Live group job notifications
                </li>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  Competitive bulk bidding
                </li>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  Verified review system
                </li>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  Direct homeowner chat
                </li>
              </ul>
            </div>

            <div className="role">
              <div className="role-icon a">A</div>
              <div className="pill">HOA admin</div>
              <h3>Manage community savings</h3>
              <p>
                Oversee eligibility, monitor participation, and report savings to your
                board.
              </p>
              <ul>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  Approve HOA eligibility
                </li>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  Community-wide analytics
                </li>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  Savings &amp; bid reports
                </li>
                <li>
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  Activity audit log
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="preview" id="savings">
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-eye">Your dashboard</span>
            <h2 className="sec-title serif-i">Track every saving in real time.</h2>
            <p className="sec-sub">
              A single home for live bids, group activity, and AI recommendations —
              designed to make confirming a bid feel as easy as accepting one.
            </p>
          </div>

          <div className="savings-grid">
            <div className="savings-card">
              <div className="sc-eye">Your savings this year</div>
              <div className="sc-amt acc serif-i">$310</div>
              <div className="sc-meta">
                <span className="down">↓ 22% vs solo</span> · across 4 services
              </div>
              <div className="chart">
                <div className="bar dim" style={{ height: "32%" }}></div>
                <div className="bar" style={{ height: "55%" }}></div>
                <div className="bar" style={{ height: "48%" }}></div>
                <div className="bar" style={{ height: "78%" }}></div>
                <div className="bar dim" style={{ height: "38%" }}></div>
                <div className="bar" style={{ height: "88%" }}></div>
              </div>
              <div className="bar-labels">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
              <div className="sc-foot">
                <div>
                  <div className="v">14</div>
                  <div className="l">Neighbors</div>
                </div>
                <div>
                  <div className="v">2</div>
                  <div className="l">Active bids</div>
                </div>
                <div>
                  <div className="v">4</div>
                  <div className="l">Booked</div>
                </div>
                <div>
                  <div className="v">1</div>
                  <div className="l">Completed</div>
                </div>
              </div>
            </div>

            <div>
              <div className="ai-card">
                <div className="ai-head">
                  <div className="ai-icon">N</div>
                  <div className="ai-eye">BidBundle AI</div>
                </div>
                <p className="ai-text">
                  ProFix is your best plumbing pick —{" "}
                  <b>4.9★, fastest, and saves you $85.</b>
                </p>
                <div className="ai-actions">
                  <button className="ai-btn">Accept bid</button>
                  <button className="ai-link">Why?</button>
                </div>
              </div>

              <div className="verified">
                <div className="l">
                  <div className="ico">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </div>
                  <div>
                    <div className="t">HOA verified member</div>
                    <div className="s">Oakwood Heights · since Nov 2024</div>
                  </div>
                </div>
                <button className="btn-mini">Ask BidBundle AI →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pulse" id="pulse">
        <div className="wrap pulse-grid">
          <div className="pulse-list">
            <div className="pulse-head">
              <div className="t serif-i">Neighborhood pulse</div>
              <div className="s">12 today</div>
            </div>
            <div className="pl-row">
              <div className="pl-av pl-1">MC</div>
              <div className="pl-text">
                Maria Chen joined your <span className="a">plumbing bid</span>
              </div>
              <div className="pl-time">2h ago</div>
            </div>
            <div className="pl-row">
              <div className="pl-av pl-2">PF</div>
              <div className="pl-text">
                ProFix Plumbing submitted a bid <span className="a">$490 · saves $85</span>
              </div>
              <div className="pl-time">4h ago</div>
            </div>
            <div className="pl-row">
              <div className="pl-av pl-3">LC</div>
              <div className="pl-text">
                Lawn care group formed in Lakeview Park <span className="g">5 neighbors</span>
              </div>
              <div className="pl-time">Yesterday</div>
            </div>
            <div className="pl-row">
              <div className="pl-av pl-4">JR</div>
              <div className="pl-text">
                Jamie R. saved <span className="g">$140</span> on house cleaning
              </div>
              <div className="pl-time">2d ago</div>
            </div>
          </div>

          <div className="pulse-copy">
            <span className="sec-eye">Real activity</span>
            <h2 className="serif-i">Watch your neighborhood save, in real time.</h2>
            <p>
              Every bid, group, and saving is shared with your block — so you can trust
              the prices and see what's working before you commit.
            </p>
            <Link className="btn btn-dark btn-lg" href="/get-started">
              Join your neighborhood <span className="arrow">→</span>
            </Link>
            <div className="pulse-meta">
              <div>
                <div className="v acc">$750K</div>
                <div className="l">Total saved</div>
              </div>
              <div>
                <div className="v">4.8★</div>
                <div className="l">Avg. rating</div>
              </div>
              <div>
                <div className="v">80+</div>
                <div className="l">Neighborhoods</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <span
            className="sec-eye"
            style={{
              background: "rgba(255,255,255,.06)",
              borderColor: "rgba(255,255,255,.1)",
              color: "rgba(255,255,255,.6)",
            }}
          >
            Ready to start saving?
          </span>
          <h2 className="sec-title serif-i">
            Stop overpaying for <span className="accent-w">home services alone.</span>
          </h2>
          <p className="lead">
            Join thousands of homeowners getting better prices, transparent bids, and
            verified providers — by simply teaming up with their neighbors.
          </p>
          <div className="ctas">
            <Link className="btn btn-primary btn-lg" href="/get-started">
              Get started free <span className="arrow">→</span>
            </Link>
            <a className="btn btn-outline-w btn-lg" href="#how">
              See how it works
            </a>
          </div>
          <div className="fine">Free to join · No credit card required · Cancel anytime</div>
        </div>
      </section>

      <footer>
        <div className="wrap foot-grid">
          <div className="foot-brand">
            <Link className="b" href="/">
              <div className="logo">N</div>
              <div className="brand-name">BidBundle</div>
            </Link>
            <div className="foot-tags">
              <div className="ftag">
                <span className="dot"></span> Live in 80+ neighborhoods
              </div>
              <div className="ftag">★ 4.8 avg. provider rating</div>
            </div>
          </div>
          <div className="foot-col">
            <div className="h">Product</div>
            <a href="#">How it works</a>
            <a href="#">For Homeowners</a>
            <a href="#">For Providers</a>
            <a href="#">For HOA Admins</a>
            <a href="#">Group Savings</a>
          </div>
          <div className="foot-col">
            <div className="h">Platform</div>
            <a href="#">Get started</a>
            <a href="#">Sign in</a>
            <a href="#">Mobile app</a>
            <a href="#">API</a>
          </div>
          <div className="foot-col">
            <div className="h">Company</div>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
        <div className="wrap foot-bottom">
          <div>© 2026 BidBundle Inc. All rights reserved.</div>
          <div>Made with neighbors in mind.</div>
        </div>
      </footer>

      <LandingAnimations />
    </div>
  );
}
