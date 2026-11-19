// Line drawings on the About page keyword cards: the original speaks through pictures here, so they are redrawn with the same position, size and feel
// (bold letters wrapped around a record · two curved bands · an earth wrapped in orbit lines).
sl.onPage("about", () => {
  const ART = {
    disc: `<svg viewBox="0 0 520 294" fill="none" stroke-width="1.6" style="stroke:var(--kf-contrast-ink)">
      <ellipse cx="300" cy="170" rx="210" ry="120" transform="rotate(-14 300 170)"/>
      <ellipse cx="300" cy="170" rx="170" ry="96" transform="rotate(-14 300 170)"/>
      <ellipse cx="300" cy="170" rx="130" ry="72" transform="rotate(-14 300 170)"/>
      <ellipse cx="300" cy="170" rx="90" ry="50" transform="rotate(-14 300 170)"/>
      <ellipse cx="300" cy="160" rx="40" ry="26" transform="rotate(-14 300 160)" style="fill:var(--kf-contrast-ink)"/>
      <ellipse cx="300" cy="158" rx="12" ry="8" stroke="none" style="fill:var(--kf-contrast-bg)"/>
      <defs><path id="sl-arc-a" d="M40 250 Q 300 360 500 120"/></defs>
      <text font-weight="700" font-size="78" stroke-width="2" paint-order="stroke" style="fill:var(--kf-contrast-ink);stroke:var(--kf-contrast-bg);font-family:var(--kf-font-display)"><textPath href="#sl-arc-a">WORDMARK</textPath></text></svg>`,
    map: `<svg viewBox="0 0 520 294" fill="none" stroke-width="1.6" style="stroke:var(--kf-contrast-ink)">
      <defs><path id="sl-rib-a" d="M10 120 Q 220 250 470 110"/><path id="sl-rib-b" d="M40 230 Q 260 330 500 200"/></defs>
      <path d="M10 92 Q 220 222 470 82 L470 138 Q 220 278 10 148 Z" style="fill:var(--kf-contrast-bg)"/>
      <path d="M40 202 Q 260 302 500 172 L500 228 Q 260 358 40 258 Z" style="fill:var(--kf-contrast-bg)"/>
      <text font-weight="800" font-size="24" stroke="none" style="fill:var(--kf-contrast-ink);font-family:var(--kf-font-display)"><textPath href="#sl-rib-a" startOffset="8%">SUB COPY LINE</textPath></text>
      <text font-weight="600" font-size="34" stroke="none" style="fill:var(--kf-contrast-ink);font-family:var(--kf-font-display)"><textPath href="#sl-rib-b" startOffset="6%">LABEL WORDMARK</textPath></text>
      <rect x="260" y="30" width="150" height="56" transform="rotate(-12 335 58)"/>
      <path d="M270 46h120M270 56h100M270 66h110" stroke-width=".8" transform="rotate(-12 335 58)"/>
      <circle cx="232" cy="58" r="14"/><path d="M218 58h28M232 44v28" stroke-width=".8"/></svg>`,
    globe: `<svg viewBox="0 0 520 294" fill="none" stroke-width="1.4" style="stroke:var(--kf-contrast-ink)">
      <circle cx="270" cy="147" r="128"/>
      <ellipse cx="270" cy="147" rx="64" ry="128"/><ellipse cx="270" cy="147" rx="110" ry="128"/>
      <path d="M142 147h256M156 90q114 22 228 0M156 204q114-22 228 0M184 48q86 14 172 0M184 246q86-14 172 0"/>
      <path d="M200 120q30-30 70-20t50 30q-20 30-60 20t-60-30z" stroke-width="1"/>
      <ellipse cx="270" cy="147" rx="250" ry="70" transform="rotate(-18 270 147)" stroke-width="1.2"/>
      <ellipse cx="270" cy="147" rx="230" ry="90" transform="rotate(24 270 147)" stroke-width="1.2"/></svg>`,
  };
  document.querySelectorAll("[data-art]").forEach((el) => { el.innerHTML = ART[el.dataset.art]; });

  // First page — original dotlottie (1296×440·60fps·1.98s, once): appears with the symbol as the curtain starts to lift, and two text lines go letter by letter at .1s intervals
  // Rises from below by the line height over 1s cubic-bezier(0,0,0,1) (140 units for the top line, 160 for the bottom line)
  const hello = document.querySelector(".intro__hello");
  const visual = document.querySelector(".intro__visual");
  if (hello && visual) {
    hello.innerHTML = hello.innerHTML.split(/<br\s*\/?>/i).map((line) =>
      `<span class="intro__row">${[...line.trim()].map((ch) => `<span class="intro__ch">${ch === " " ? "&nbsp;" : ch}</span>`).join("")}</span>`).join("");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      gsap.set(visual.querySelector(".intro__logo"), { autoAlpha: 0 });
      gsap.set(hello.querySelectorAll(".intro__ch"), { yPercent: 110 });
      document.addEventListener("sl:reveal", () => {
        gsap.set(visual.querySelector(".intro__logo"), { autoAlpha: 1 });
        hello.querySelectorAll(".intro__row").forEach((row) =>
          gsap.to(row.querySelectorAll(".intro__ch"), { yPercent: 0, duration: 1, stagger: 0.1, ease: "fx-0,0,0,1" }));
      }, { once: true });
    }
  }
});
