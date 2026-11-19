// Shared by all pages — Lenis (lerp .1 · wheel 1.1x), line-rise text, contact email copy swap, footer wordmark growth
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.oLenis = lenis;

  // Line splitting — measures lines by glyph width and wraps each line in a mask (Korean words are not broken)
  window.oLines = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    const spans = words.map((w, i) => {
      const s = document.createElement("span");
      s.textContent = w + (i < words.length - 1 ? " " : "");
      el.append(s);
      return s;
    });
    const rows = [];
    let top = null;
    spans.forEach((s) => {
      const t = Math.round(s.offsetTop);
      if (t !== top) { rows.push([]); top = t; }
      rows[rows.length - 1].push(s.textContent);
    });
    el.textContent = "";
    return rows.map((r, i) => {
      const mask = document.createElement("span");
      mask.className = "o-line";
      const inner = document.createElement("span");
      inner.textContent = r.join("");
      if (i === 0 && el.dataset.indent) inner.style.textIndent = el.dataset.indent;
      mask.append(inner);
      el.append(mask);
      return inner;
    });
  };
  // At 90% of the screen, each line runs 1.2s power4.out at .08 intervals — delay it with data-split-delay
  const splitAll = () => document.querySelectorAll("[data-split]:not([data-split-hold])").forEach((el) => {
    gsap.set(el, { opacity: 1 });
    if (reduce) return;
    const lines = window.oLines(el);
    // The hero intro counts from when the page opened (original 7.3s) — delayed less by the time spent waiting for the font
    const d = +(el.dataset.splitDelay ?? 0), delay = el.closest(".o-hero") ? Math.max(0, d - performance.now() / 1000) : d;
    gsap.from(lines, { yPercent: 110, opacity: 0, duration: 1.2, stagger: 0.08, ease: "power4.out", delay, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });
  (document.fonts?.ready || Promise.resolve()).then(splitAll);

  // Contact — pressing copies the email address, the text switches to ”Copied” for .6s and returns after 2s
  const EASE = "cubic-bezier(.87,0,.13,1)";
  const slide = (el, y, on) => { el.style.transition = on ? `transform 600ms ${EASE}` : "none"; el.style.transform = `translateY(${y}%)`; };
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("[data-copy]");
    if (!a) return;
    e.preventDefault();
    navigator.clipboard?.writeText(a.dataset.copy).catch(() => {});
    if (!a._cc) {
      const label = a.textContent.trim();
      a.innerHTML = '<span class="o-copy__mask"><span></span><span aria-hidden="true"></span></span>';
      const [A, B] = a.querySelectorAll(".o-copy__mask > span");
      A.textContent = label;
      B.textContent = a.dataset.copyLabel || "Copied";
      slide(A, 0, false); slide(B, 110, false);
      a._cc = { A, B, busy: false };
    }
    const c = a._cc;
    if (c.busy) return;
    c.busy = true;
    slide(c.A, -110, true); slide(c.B, 0, true);
    setTimeout(() => {
      slide(c.A, 110, false); void c.A.offsetHeight; slide(c.A, 0, true); slide(c.B, -110, true);
      setTimeout(() => { slide(c.B, 110, false); c.busy = false; }, 600);
    }, 2000);
  });

  // Footer wordmark — from when the footer touches the screen bottom to the end, each line grows in height from 0 to full height
  const logo = document.querySelector(".o-footer__logo");
  if (logo) {
    const rows = [...logo.querySelectorAll(".o-footer__row")];
    let full = [];
    const st = { p: reduce ? 1 : 0 };
    const measure = () => {
      logo.style.minHeight = "";
      rows.forEach((r) => (r.style.height = ""));
      full = rows.map((r) => r.getBoundingClientRect().height);
      logo.style.minHeight = logo.getBoundingClientRect().height + "px";
      logo.style.justifyContent = "flex-end";
    };
    const paint = () => rows.forEach((r, i) => (r.style.height = (full[i] * st.p).toFixed(2) + "px"));
    measure(); paint();
    if (!reduce) {
      ScrollTrigger.addEventListener("refreshInit", measure);
      gsap.to(st, { p: 1, ease: "none", onUpdate: paint, scrollTrigger: { trigger: ".o-footer", start: "top bottom", end: "bottom bottom", scrub: true, onRefresh: paint } });
    }
  }

  // Leave a flag so navigating between our own pages skips the loader
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href$='.html']");
    if (a) try { sessionStorage.setItem("o-soft", "1"); } catch {}
  });
})();
