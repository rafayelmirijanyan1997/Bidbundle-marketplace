type Testimonial = {
  quote: string;
  name: string;
  location: string;
  initials: string;
};

const defaultTestimonial: Testimonial = {
  quote: "We saved $420 on landscaping by joining our block's group bid. Took two minutes to set up.",
  name: "Maria Chen",
  location: "Oakwood Heights",
  initials: "MC",
};

const stats = [
  { value: "2,400+", label: "Members" },
  { value: "$310", label: "Avg saved", accent: true },
  { value: "40%", label: "Off solo", accent: true },
];

export function AuthShowcase({ testimonial = defaultTestimonial }: { testimonial?: Testimonial }) {
  return (
    <div
      className="relative hidden overflow-hidden lg:flex lg:w-[44%] lg:flex-col"
      style={{ background: "#07111e" }}
    >
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-55" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="orb-a absolute left-[-8%] top-[16%] h-[560px] w-[560px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 66%)", filter: "blur(72px)" }}
        />
        <div
          className="orb-b absolute bottom-[4%] right-[-8%] h-[440px] w-[440px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(224,135,88,0.16) 0%, transparent 65%)", filter: "blur(60px)" }}
        />
      </div>

      <div className="relative flex h-full flex-col justify-between px-12 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
            <span className="font-display text-[15px] font-bold italic text-white">B</span>
          </div>
          <span className="font-display text-[17px] font-semibold italic text-white">BidBundle</span>
        </div>

        <div className="max-w-sm pt-14 pb-8">
          <h2
            className="font-display font-bold italic leading-[1.04] tracking-tightest text-white"
            style={{ fontSize: "clamp(2.15rem, 3.5vw, 3.7rem)" }}
          >
            Your neighbourhood.
            <br />
            <span style={{ color: "#f59e0b" }}>Your savings.</span>
          </h2>

          <p className="mt-4 text-[14px] leading-[1.75] text-white/50">
            Join thousands of homeowners, service providers, and HOA admins
            getting better prices through collective power.
          </p>

          <div className="my-7 h-px bg-gradient-to-r from-white/10 via-white/6 to-transparent" />

          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[22px] border px-3 py-4 text-center backdrop-blur-sm"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              >
                <p
                  className="font-display text-[1.8rem] font-bold italic leading-none"
                  style={{ color: stat.accent ? "#f59e0b" : "#ffffff" }}
                >
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-white/35">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <ul className="mt-6 space-y-3">
            {[
              "Group pricing beats solo quotes every time",
              "AI-powered category & neighbor matching",
              "Transparent bids from verified providers",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-[13px] text-white/50">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <svg className="h-2.5 w-2.5 text-amber-400" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2 6 2.5 2.5 5-5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-[24px] border p-5"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
        >
          <div className="mb-3 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-[13px] text-amber-400">★</span>
            ))}
          </div>
          <p className="text-[13px] leading-[1.7] text-white/60 italic">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--terracotta-600)] text-[11px] font-bold text-white">
              {testimonial.initials}
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white/80">{testimonial.name}</p>
              <p className="text-[11px] text-white/35">{testimonial.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
