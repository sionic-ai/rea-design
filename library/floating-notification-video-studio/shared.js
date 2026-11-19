// Shared by the whole set — Lenis (the original smooth scroll: duration = Intensity/10 → 1.0, phone .9) · city clocks · position-swap hover on the ‹Book a Consultation› button ·
// Video window·contact window · Lottie·video autoplay. The original is a single-page app so there is no transition curtain — usually left as plain links
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover)").matches;
  const css = getComputedStyle(document.documentElement);
  const SPRING = css.getPropertyValue("--hp-spring").trim() || "ease-out";

  // Imitates Framer layout swapping — measures the boxes before and after, and releases the transform that returns from the new spot to the old shape with a spring.
  // Children are stretched inversely so the text doesn’t look squashed
  const flip = (el, change, { dur = 400, kids = [] } = {}) => {
    const a = el.getBoundingClientRect();
    change();
    const b = el.getBoundingClientRect();
    if (reduce || !b.width || !b.height) return;
    const sx = a.width / b.width, sy = a.height / b.height;
    const dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
    if (Math.abs(sx - 1) < 0.002 && Math.abs(sy - 1) < 0.002 && Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    const opt = { duration: dur, easing: SPRING };
    el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transform: "none" }], opt);
    kids.forEach((k) => k.animate([{ transform: `scale(${1 / sx}, ${1 / sy})` }, { transform: "none" }], opt));
  };
  window.hpFlip = flip;

  // Button: on hover the arrow slot opens and width goes 98 → 126px, and returns on release (a .4s layout spring between the two original variants)
  if (hover) {
    document.querySelectorAll(".hp-btn").forEach((btn) => {
      const kids = [...btn.children];
      // Like the original, swap positions on the frame after changing state
      let raf = 0;
      const later = (on) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => flip(btn, () => btn.classList.toggle("is-hover", on), { kids })); };
      btn.addEventListener("pointerenter", () => later(true));
      btn.addEventListener("pointerleave", () => later(false));
    });
  }

  // Clock — the original shows City and City 24-hour time to the second
  const clocks = document.querySelectorAll("[data-clock]");
  if (clocks.length) {
    const fmt = (tz) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const fs = [...clocks].map((c) => [c, fmt(c.dataset.clock)]);
    const tick = () => { const d = new Date(); fs.forEach(([c, f]) => (c.textContent = f.format(d))); };
    tick();
    setInterval(tick, 1000);
  }

  // Lenis
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: matchMedia("(max-width: 809.98px)").matches ? 0.9 : 1 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    window.hpLenis = lenis;
  }

  // Window — the overlay turns on instantly (original duration 0) and the panel springs in over .6s from 60px below and transparent. On close the overlay goes off instantly and the panel sinks with the same spring and fades out.
  // The original attaches the window at the end of the document (#overlay) and turns it on in the next frame — it turns on three frames after attaching to match the time from press to on (original 127~151ms)
  const open = (m) => {
    if (!m) return;
    if (m !== document.body.lastElementChild) document.body.append(m);
    m.classList.add("is-open");
    m.classList.remove("is-closing");
    lenis?.stop();
    m.querySelector("video")?.play().catch(() => {});
    const on = () => m.classList.contains("is-open") && m.classList.add("is-in");
    // The contact window turns on one frame earlier than the video window in the original (127ms)
    if (m.querySelector(".hp-form")) requestAnimationFrame(() => requestAnimationFrame(on));
    else requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(on)));
  };
  const close = (m) => {
    if (!m || !m.classList.contains("is-in")) return;
    m.classList.remove("is-in");
    m.classList.add("is-closing");
    lenis?.start();
    // The contact window turns off immediately like the original, while the video window is kept for the time the board drops with a spring (.6s)
    setTimeout(() => { if (!m.classList.contains("is-in")) m.classList.remove("is-open", "is-closing"); m.querySelector("video")?.pause(); }, reduce || m.querySelector(".hp-form") ? 0 : 600);
  };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-modal]");
    if (t) { e.preventDefault(); open(document.getElementById(t.dataset.modal)); return; }
    const v = e.target.closest("[data-modal-close]");
    if (v) close(v.closest(".hp-modal"));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".hp-modal.is-in").forEach(close);
    const t = (e.key === "Enter" || e.key === " ") && e.target.closest?.('[role="button"][data-modal]');
    if (t) { e.preventDefault(); open(document.getElementById(t.dataset.modal)); }
  });
  document.querySelectorAll(".hp-form").forEach((f) => f.addEventListener("submit", (e) => { e.preventDefault(); close(f.closest(".hp-modal")); }));

  // Pause off-screen Lottie and video — if twelve cards always run, frames lag and hover response is late
  const seen = new IntersectionObserver((ents) => ents.forEach((e) => e.target.hpPlay?.(e.isIntersecting)), { rootMargin: "100px" });

  // Lottie — original Lottie (loop · playing · speed 1). The fill is overridden by CSS with --kf-*
  if (window.lottie && window.hpLotties) {
    document.querySelectorAll(".hp-lottie[data-lottie]").forEach((el) => {
      const data = hpLotties[el.dataset.lottie];
      if (!data) return;
      const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: false, animationData: JSON.parse(JSON.stringify(data)), rendererSettings: { preserveAspectRatio: el.dataset.fit === "slice" ? "xMidYMid slice" : "xMidYMid meet" } });
      if (reduce) { anim.addEventListener("DOMLoaded", () => anim.goToAndStop(0, true)); return; }
      el.hpPlay = (on) => (on ? anim.play() : anim.pause());
      seen.observe(el);
    });
  }
  document.querySelectorAll("video").forEach((v) => {
    if (v.readyState < 2) {
      v.classList.add("hp-wait");
      v.addEventListener("loadeddata", () => v.classList.remove("hp-wait"), { once: true });
    }
    if (reduce) { v.removeAttribute("autoplay"); v.pause(); return; }
    if (!v.autoplay) return;
    v.hpPlay = (on) => (on ? v.play().catch(() => {}) : v.pause());
    seen.observe(v);
  });
})();
