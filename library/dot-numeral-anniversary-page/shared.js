// Common: draws smooth scroll (same Lenis 1.0.34 as the original · 2s duration · expo curve), number loader, header, section title entrance, and footer.
// Original values: one beat .8s · curve power2(.out) · header .24s later .8s power2.inOut · section title line .8s power2.in → dot .8s back.out(2).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MC = (window.MC = { reduce, beat: 0.8, ease: "power2.out", loaded: false, onLoaded: [], wake: reduce ? 0 : 1.3 });
  const html = document.documentElement;
  // The original hides the whole screen until the app wakes and fonts load (measured 1.3s), then shows it all at once (the transition declaration is void so it switches on immediately)
  if (MC.wake) { html.classList.add("is-waking"); setTimeout(() => html.classList.remove("is-waking"), MC.wake * 1000); }

  if (!reduce && window.Lenis) {
    const lenis = new Lenis({
      duration: 2, easing: (e) => Math.min(1, 1.001 - Math.pow(2, -10 * e)),
      smoothWheel: true, normalizeWheel: true, infinite: false, syncTouch: true, syncTouchLerp: 0.06, touchInertiaMultiplier: 32,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    MC.lenis = lenis;
  }

  // A newly drawn symbol (dot inside a ring) plus a placeholder wordmark instead of the original logo
  const mark = '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="none" stroke="var(--kf-accent)" stroke-width="5"/><circle cx="14" cy="14" r="3.6" fill="var(--kf-accent)"/></svg>';
  MC.mark = mark;
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "mc-head";
    head.innerHTML = `<div class="mc-head__logo"><a class="mc-head__mark" href="index.html" aria-label="Home">${mark}<b>WORDMARK</b><i>Company name</i></a><h1>00th anniversary site</h1></div>`;
  }
  const arrowUR = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5" stroke="var(--kf-accent)" stroke-width="1.6"/></svg>';
  MC.arrowUR = arrowUR;
  MC.dot = `<span class="mc-dotwrap"><span class="mc-dot"><svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5" stroke="var(--kf-surface)" stroke-width="2"/></svg></span></span>`;
  document.querySelectorAll("[data-dot]").forEach((b) => b.insertAdjacentHTML("afterbegin", MC.dot));

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "mc-foot";
    foot.innerHTML = `<div class="mc-head__logo"><a class="mc-head__mark" href="index.html" aria-label="Home">${mark}<b>WORDMARK</b><i>Company name</i></a><h1>00th anniversary site</h1></div>
      <nav class="mc-foot__nav" aria-label="Bottom Menu"><a href="#top">Top</a><a href="#portfolio">Portfolio</a><a href="#data">Data</a><a href="#movie">Movie</a><a href="#story">Story</a><a href="#" target="_blank">Corporate ${arrowUR}</a></nav>
      <div class="mc-foot__stage" data-slot="footer-stage"></div>`;
  }
  // Internal links glide via Lenis
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || a.getAttribute("href") === "#") return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    if (MC.lenis) MC.lenis.scrollTo(t); else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  // ── Number loader ── each digit slot rolls two 0~9 strips by -5% steps to count progress. When done, the digits vanish one after another at .04s over .8s
  const loader = document.querySelector(".mc-loader");
  const done = () => {
    MC.loaded = true;
    html.classList.remove("is-loading");
    MC.lenis?.start();
    gsap.fromTo(".mc-head", { opacity: 0 }, { delay: 0.24, opacity: 1, duration: MC.beat, ease: "power2.inOut" });
    MC.onLoaded.forEach((f) => f());
  };
  if (loader && !reduce) {
    html.classList.add("is-loading");
    MC.lenis?.stop();
    const digits = [...loader.querySelectorAll(".mc-loader__digit")];
    digits.forEach((d) => (d.innerHTML = `<span class="mc-loader__strip">${"0123456789".repeat(2).split("").map((n) => `<span>${n}</span>`).join("")}</span>`));
    const strips = digits.map((d) => d.firstElementChild);
    // The original has a blank background for the first 1.3s (the time the app wakes up) and then the number appears — waits exactly as measured
    const wake = MC.wake;
    gsap.fromTo(digits, { y: 8, opacity: 0 }, { y: "-0.05em", opacity: 1, duration: MC.beat, ease: MC.ease, stagger: { each: 0.04 }, delay: wake });
    gsap.fromTo(".mc-loader__pct", { opacity: 0 }, { opacity: 1, duration: MC.beat, ease: MC.ease, delay: wake });
    const shown = [0, 0, 0];
    const show = (v) => {
      const s = String(Math.min(100, Math.round(v))).padStart(3, "0");
      [...s].forEach((ch, i) => {
        const n = +ch;
        if (n === shown[i]) return;
        // Each time a digit goes up, the strip rolls — the ones place with no curve, the rest with power2.out
        const to = n < shown[i] ? n + 10 : n;
        gsap.to(strips[i], { yPercent: -(to / 20) * 100, duration: i === 2 ? 0.1 : 0.4, ease: i === 2 ? "none" : MC.ease, onComplete: () => gsap.set(strips[i], { yPercent: -(n / 20) * 100 }) });
        shown[i] = n;
      });
    };
    // The original counts the progress of loading images and chunks — this placeholder has nothing to load, so it counts to a length measured from the original (after the number appears, about 3.6s to the end — the probe screen change rises straight from 1.3s to 5.9s)
    const prog = { v: 0 };
    gsap.to(prog, { v: 100, duration: 3.6, ease: "none", delay: wake + 0.3, onUpdate: () => show(prog.v), onComplete: () => {
      gsap.to(digits, { opacity: 0, duration: MC.beat, ease: MC.ease, stagger: { each: 0.04 }, onComplete: () => { loader.remove(); done(); } });
      gsap.to(".mc-loader__pct", { opacity: 0, duration: MC.beat, ease: MC.ease });
    } });
  } else {
    loader?.remove();
    addEventListener("DOMContentLoaded", done);
    if (document.readyState !== "loading") done();
  }

  // ── Section title ── when it enters the screen the English letters stand up from a skewed position (motion part skew-chars-in), a line is drawn in .8s power2.in, then a dot pops out
  document.querySelectorAll(".mc-heading").forEach((h) => {
    const run = () => {
      h.querySelector('[data-fx~="skew-chars-in"]')?.fxPlay?.();
      if (reduce) return;
      gsap.to(h.querySelector(".mc-heading__line"), { width: "100%", duration: MC.beat, ease: "power2.in", onComplete: () => gsap.to(h.querySelector(".mc-heading__dot"), { opacity: 1, scale: 1, duration: MC.beat, ease: "back.out(2)" }) });
    };
    ScrollTrigger.create({ trigger: h, start: "top 80%", once: true, onEnter: run });
  });
})();
