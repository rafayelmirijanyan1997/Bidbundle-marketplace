"use client";

import { useEffect } from "react";

export function LandingAnimations() {
  useEffect(() => {
    /* ── 1. Smooth scroll ── */
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    const handleClick = (e: MouseEvent) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top: (target as HTMLElement).offsetTop - 60,
            behavior: "smooth",
          });
        }
      }
    };
    links.forEach((a) => a.addEventListener("click", handleClick));

    /* ── 2. Bid row rotation ── */
    const rows = document.querySelectorAll<HTMLElement>(".bid-row");
    const bestTag = document.querySelector<HTMLElement>(".best-tag");
    let idx = 0;
    const bidInterval = setInterval(() => {
      rows.forEach((r) => r.classList.remove("best"));
      if (rows[idx]) {
        rows[idx].classList.add("best");
        if (bestTag) {
          const nameEl = rows[idx].querySelector(".br-name");
          if (nameEl && !nameEl.contains(bestTag)) nameEl.appendChild(bestTag);
        }
      }
      idx = (idx + 1) % rows.length;
    }, 3200);

    /* ── 3. Scroll reveal setup ── */
    // Elements to reveal — with optional stagger delay (ms per sibling index)
    const revealTargets: { selector: string; stagger: number }[] = [
      { selector: ".how .sec-head", stagger: 0 },
      { selector: ".step", stagger: 90 },
      { selector: ".how-strip", stagger: 0 },
      { selector: ".roles .sec-head", stagger: 0 },
      { selector: ".role", stagger: 100 },
      { selector: ".preview .sec-head", stagger: 0 },
      { selector: ".savings-card", stagger: 0 },
      { selector: ".ai-card", stagger: 0 },
      { selector: ".verified", stagger: 120 },
      { selector: ".pulse .sec-eye", stagger: 0 },
      { selector: ".pulse-list", stagger: 0 },
      { selector: ".pl-row", stagger: 70 },
      { selector: ".pulse-copy h2", stagger: 0 },
      { selector: ".pulse-copy p", stagger: 80 },
      { selector: ".pulse-copy .btn", stagger: 160 },
      { selector: ".pulse-meta > div", stagger: 80 },
      { selector: ".final .sec-eye", stagger: 0 },
      { selector: ".final .sec-title", stagger: 60 },
      { selector: ".final .lead", stagger: 120 },
      { selector: ".final .ctas", stagger: 180 },
    ];

    const allRevealEls: { el: HTMLElement; delay: number }[] = [];

    revealTargets.forEach(({ selector, stagger }) => {
      const els = document.querySelectorAll<HTMLElement>(selector);
      els.forEach((el, i) => {
        const delay = stagger > 0 ? i * stagger : 0;
        el.classList.add("sr");
        el.style.transitionDelay = `${delay}ms`;
        allRevealEls.push({ el, delay });
      });
    });

    /* ── 4. Bar chart — store heights then reset to 0 ── */
    const bars = document.querySelectorAll<HTMLElement>(".chart .bar");
    const originalHeights: string[] = [];
    bars.forEach((bar) => {
      originalHeights.push(bar.style.height);
      bar.style.height = "0%";
      bar.style.transition = "height 0.65s cubic-bezier(0.16, 1, 0.3, 1)";
    });

    /* ── 5. IntersectionObserver for reveal ── */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("sr-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    allRevealEls.forEach(({ el }) => revealObserver.observe(el));

    /* ── 6. Bar chart observer ── */
    const chart = document.querySelector<HTMLElement>(".chart");
    if (chart) {
      const barObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            bars.forEach((bar, i) => {
              setTimeout(() => {
                bar.style.height = originalHeights[i] ?? "0%";
              }, i * 80);
            });
            barObserver.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      barObserver.observe(chart);
    }

    return () => {
      clearInterval(bidInterval);
      links.forEach((a) => a.removeEventListener("click", handleClick));
      revealObserver.disconnect();
    };
  }, []);

  return null;
}
