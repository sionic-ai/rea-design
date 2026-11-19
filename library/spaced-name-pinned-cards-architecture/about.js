// Expertise (original ExpertisesList + ExpertiseModal): row lift and fade, closing the opened panel (if it was opened from a pressed row it shrinks back into that row),
// Press a row and it swells open into a rounded panel. The panel scrolls on its own with a separate Lenis inside
(() => {
  const { gsap, ScrollTrigger, reduce } = window.P;
  const root = document.documentElement;
  const list = document.querySelector("[data-xp-rows]");
  const rows = [...list.querySelectorAll("[data-xp-row]")];
  const backdrop = document.querySelector("[data-xp-backdrop]");
  const scroller = document.querySelector("[data-xp-scroller]");
  const content = document.querySelector("[data-xp-content]");
  const panel = document.querySelector("[data-xp-panel]");
  const target = document.querySelector("[data-xp-target]");
  const body = document.querySelector("[data-xp-body]");
  const no = document.querySelector("[data-xp-no]"), title = document.querySelector("[data-xp-title]");
  const closeBtn = document.querySelector("[data-xp-close]"), icon = closeBtn.firstElementChild;
  const touch = matchMedia("(hover: none)");
  const rem = () => parseFloat(getComputedStyle(root).fontSize);
  const d = (t) => (reduce ? 0 : t);
  let hovered = -1, active = -1, from = null, open = true, busy = false, inner = null, tl = null;

  // Row: raised 2rem on hover (.75s expo.out) and lowered on release (.5s). Text outside the raised row blurs and that row’s circle spins out
  const lift = (row, on) => { gsap.killTweensOf(row, "y"); gsap.to(row, { y: on ? -2 * rem() : 0, duration: d(on ? 0.75 : 0.5), ease: "expo.out" }); };
  const mark = (k) => {
    hovered = k;
    list.classList.toggle("is-dim", k !== -1 || active !== -1);
    rows.forEach((r, i) => r.classList.toggle("is-on", i === (k !== -1 ? k : active)));
  };
  rows.forEach((row, k) => {
    row.addEventListener("mouseenter", () => { if (touch.matches || busy) return; mark(k); lift(row, true); });
    row.addEventListener("mouseleave", () => { if (touch.matches || busy) return; mark(-1); lift(row, false); });
    row.addEventListener("click", (e) => { e.preventDefault(); openFrom(k); });
  });
  // Touch devices: when a row’s top edge passes the screen center, that row lifts
  window.P.ready(() => {
    if (!touch.matches) return;
    rows.forEach((row, k) => ScrollTrigger.create({ trigger: row, start: "top center", end: "bottom center",
      onEnter: () => { mark(k); lift(row, true); if (k > 0) lift(rows[k - 1], false); },
      onEnterBack: () => { mark(k); lift(row, true); if (k < rows.length - 1) lift(rows[k + 1], false); },
      onLeaveBack: () => { mark(k > 0 ? k - 1 : -1); lift(row, false); if (k > 0) lift(rows[k - 1], true); } }));
  });

  // Scrolling inside the plate: only while the plate is open, set up Lenis on the plate and pause the outer (window) Lenis
  const startInner = () => {
    scroller.style.pointerEvents = "auto";
    window.P.lenis?.stop();
    if (!reduce && window.Lenis) inner = new window.Lenis({ wrapper: scroller, content, easing: (t) => 1 - (1 - t) ** 5, wheelEventsTarget: document.body, autoRaf: true });
  };
  const stopInner = () => {
    inner?.destroy();
    inner = null;
    scroller.scrollTop = 0;
    scroller.style.pointerEvents = "";
  };
  startInner();
  // The outer Lenis turns back on when the page descent finishes, so if the panel is open, stop it again
  window.P.entered(() => open && window.P.lenis?.stop());

  // Open: a panel is laid over the clicked row’s spot, and while the shade spreads in .35s the panel swells to the center spot in .85s expo.out (corners 0 → 2rem)
  // The lines below go off screen. The circle turns 45° after .1s into ×, and the panel contents turn on in .3s after .1s
  function openFrom(k) {
    if (open || busy) return;
    busy = true;
    open = true;
    active = k;
    tl?.kill();
    const row = rows[k];
    gsap.set(row, { opacity: 0 });
    const r = row.getBoundingClientRect();
    from = { top: r.top, left: r.left, width: r.width, height: r.height };
    root.classList.remove("is-xp-closed");
    no.textContent = String(k + 1).padStart(2, "0");
    title.textContent = row.dataset.title;
    gsap.set(panel, { position: "absolute", top: r.top, left: r.left, width: r.width, height: r.height, marginLeft: 0, borderRadius: 0, opacity: 1 });
    gsap.set(icon, { rotation: 0 });
    gsap.set(closeBtn, { opacity: 1 });
    gsap.set(body, { opacity: 0, pointerEvents: "none" });
    gsap.set(backdrop, { opacity: 0 });
    window.P.lenis?.stop();
    scroller.style.pointerEvents = "auto";
    const u = target.getBoundingClientRect();
    tl = gsap.timeline({ onComplete: () => {
      gsap.set(panel, { position: "relative", top: "auto", left: "auto", height: "auto", clearProps: "marginLeft,width" });
      busy = false;
      startInner();
    } })
      .to(backdrop, { opacity: 1, duration: d(0.35), ease: "power2.out" }, 0)
      .to(panel, { top: u.top, left: u.left, width: u.width, height: "auto", borderRadius: "2rem", duration: d(0.85), ease: "expo.out" }, 0)
      .to(icon, { rotation: 45, duration: d(0.4), ease: "expo.out" }, d(0.1))
      .to(body, { opacity: 1, duration: d(0.3), pointerEvents: "auto" }, d(0.1));
    rows.forEach((x, i) => {
      if (i <= k) return;
      gsap.killTweensOf(x);
      gsap.set(x, { zIndex: 21 + rows.length - i });
      tl.to(x, { y: innerHeight - x.getBoundingClientRect().top, duration: d(0.85), ease: "expo.out" }, 0);
    });
  }

  // Close: the inside of the panel turns off in .12s and the shade in .25s, and if opened from a row the panel shrinks back to that row spot in .45s (corners 0) while the rows below return in .85s.
  // If it started with the plate already open like this page, the plate turns off in .3s
  function close() {
    if (!open || busy) return;
    busy = true;
    open = false;
    tl?.kill();
    const k = active;
    active = -1;
    inner?.scrollTo(0, { immediate: true });
    stopInner();
    const p = panel.getBoundingClientRect();
    gsap.set(panel, { position: "absolute", top: p.top, left: p.left, width: p.width, height: panel.offsetHeight, marginLeft: 0 });
    gsap.set(rows, { pointerEvents: "none" });
    tl = gsap.timeline({ onComplete: () => {
      busy = false;
      window.P.lenis?.start();
      root.classList.add("is-xp-closed");
      gsap.set(panel, { clearProps: "all" });
      if (k >= 0) gsap.set(rows[k], { y: 0, opacity: 1 });
      gsap.set(rows, { clearProps: "zIndex,pointerEvents" });
      mark(-1);
    } })
      .to(closeBtn, { opacity: 0, duration: d(0.35), ease: "power2.out" }, 0)
      .to(body, { opacity: 0, duration: d(0.12), pointerEvents: "none" }, 0)
      .to(backdrop, { opacity: 0, duration: d(0.25), ease: "power2.out" }, 0);
    if (k >= 0 && from) tl.to(panel, { top: touch.matches ? from.top : from.top + 2 * rem(), left: from.left, width: from.width, height: from.height, borderRadius: 0, duration: d(0.45), ease: "expo.out" }, 0);
    else tl.to(panel, { opacity: 0, duration: d(0.3), ease: "expo.out" }, 0);
    rows.forEach((x, i) => { if (k >= 0 && i > k) { gsap.killTweensOf(x); tl.to(x, { y: i === hovered ? -2 * rem() : 0, opacity: 1, duration: d(0.85), ease: "expo.out" }, 0); } });
  }
  closeBtn.addEventListener("click", (e) => { e.stopPropagation(); close(); });
  scroller.addEventListener("click", (e) => { if (open && !panel.contains(e.target)) close(); });
  addEventListener("keydown", (e) => e.key === "Escape" && close());
})();
