// Work detail — title line reveal, meta, rise-up, type cell hover, and the pinned scroll for Next Work at the end (moves on when full)
KK.page("detail", (c) => {
  const $ = (s) => c.querySelector(s), $$ = (s) => [...c.querySelectorAll(s)];
  const reduce = KK.reduce, offs = [];
  // ?work in the URL=Swap the title and next work with n so details can be flipped through one after another
  const n = Math.max(1, Math.min(5, +(new URL(location.href).searchParams.get("work") || 1)));
  const names = ["Project 01", "Project 02", "Project 03", "Project 04", "Project 05"];
  const nx = (n % 5) + 1, pv = ((n + 3) % 5) + 1;
  const title = $("[data-wd-title]");
  if (title) title.textContent = names[n - 1];
  $$("[data-next-title]").forEach((t) => (t.textContent = names[nx - 1]));
  $$('[data-direction="next"]').forEach((a) => a.setAttribute("href", `detail.html?work=${nx}`));
  $$('[data-direction="previous"]').forEach((a) => a.setAttribute("href", `detail.html?work=${pv}`));

  // Typeface cell — on hover or press, the big letter becomes that letter
  const glyph = $("[data-glyph]");
  $$("[data-cells]").forEach((grid) => {
    grid.innerHTML = [...grid.dataset.cells].map((ch) => `<button type="button" class="kk-type__cell" aria-label="${ch} View">${ch}</button>`).join("");
  });
  const cells = $$(".kk-type__cell");
  const pick = (cell) => { cells.forEach((x) => x.classList.toggle("is-selected", x === cell)); if (glyph) glyph.textContent = cell.textContent; };
  if (cells[0]) pick(cells[0]);
  const cellOffs = cells.map((cell) => { const f = () => pick(cell); cell.addEventListener("mouseenter", f); cell.addEventListener("focus", f); cell.addEventListener("click", f); return () => { cell.removeEventListener("mouseenter", f); cell.removeEventListener("focus", f); cell.removeEventListener("click", f); }; });
  offs.push(() => cellOffs.forEach((f) => f()));

  const skip = reduce || c.hasAttribute("data-skip-intro");
  const ctx = gsap.context(() => {
    // Heading — each line rises 115% from below inside a mask (1.05s osmo, .08 gap)
    if (title) {
      if (skip) gsap.set(title, { visibility: "visible" });
      else {
        const sp = new SplitText(title, { type: "lines", mask: "lines" });
        gsap.set(title, { visibility: "visible" });
        gsap.fromTo(sp.lines, { yPercent: 115 }, { yPercent: 0, duration: 1.05, ease: "osmo", stagger: 0.08 });
        offs.push(() => sp.revert());
      }
    }
    if (skip) return;
    const meta = $$(".kk-wd__meta-item");
    if (meta.length) {
      gsap.set(meta, { autoAlpha: 0, yPercent: 30 });
      ScrollTrigger.create({ trigger: $("[data-wd-meta]"), start: "top 88%", once: true, onEnter: () => gsap.to(meta, { autoAlpha: 1, yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.07 }) });
    }
    $$("[data-wd-reveal]").forEach((el) => {
      gsap.set(el, { autoAlpha: 0, y: 32 });
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out" }) });
    });
    $$("[data-wd-item]").forEach((el, i) => {
      gsap.set(el, { autoAlpha: 0, y: 24 });
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", delay: (i % 2) * 0.08 }) });
    });
  }, c);
  offs.push(() => ctx.revert());

  // Floating pager row — hides on entering the next Work section
  const visit = $(".kk-visit");
  const hideVisit = (on) => { if (!visit || (!on && document.body.dataset.pageTransition === "active")) return; visit.classList.toggle("is-hidden", on); };

  // ───── Next work — pin the section for 2 screens and advance when the bar is 82% full ─────
  const wrap = $("[data-next]");
  if (wrap && matchMedia("(min-width: 761px)").matches) {
    const link = $("[data-next-link]"), fill = $("[data-next-fill]"), bg = $("[data-next-bg]"), shade = $("[data-next-shade]");
    const A = 0.82;
    let fired = false;
    gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });
    const go = () => {
      if (fired || document.body.dataset.pageTransition === "active") return;
      fired = true;
      gsap.set(fill, { scaleX: 1 });
      if (!reduce) { gsap.set(bg, { scale: 1.12 }); gsap.set(shade, { opacity: 0.54 }); }
      KK.go(link.href, link);
    };
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: wrap, start: "top top", end: () => "+=" + innerHeight * 2, scrub: 0.1, pin: true } });
    tl.to(fill, { scaleX: 1, duration: A }).call(go, null, ">").to({}, { duration: 1 - A });
    if (!reduce) { tl.to(bg, { scale: 1.12, duration: A }, 0).to(shade, { opacity: 0.54, duration: A }, 0); }
    const st = ScrollTrigger.create({ trigger: wrap, start: "top bottom", onEnter: () => hideVisit(true), onLeaveBack: () => hideVisit(false) });
    // When the next work fills the screen, the header blur, logo and menu button are removed
    const blur = document.querySelector(".kk-blur"), heads = [document.querySelector(".kk-logo"), document.querySelector("[data-menu-toggle]")].filter(Boolean);
    const io = new IntersectionObserver((es) => {
      const on = es.some((e) => e.isIntersecting);
      if (blur) gsap.to(blur, { "--blur-reveal": on ? 0 : 1, duration: on ? 0.3 : 0.45, ease: on ? "power2.in" : "power2.out", overwrite: "auto" });
      gsap.to(heads, { opacity: on ? 0 : 1, duration: 0.3, ease: "power2.inOut", overwrite: "auto" });
    }, { threshold: 0.99 });
    io.observe(wrap);
    offs.push(() => { tl.scrollTrigger?.kill(); tl.kill(); st.kill(); io.disconnect(); gsap.set(heads, { clearProps: "opacity" }); });
  }
  const mob = $("[data-next-mobile]");
  if (mob && matchMedia("(max-width: 760px)").matches) {
    const io = new IntersectionObserver((es) => hideVisit(es.some((e) => e.isIntersecting)), { threshold: 0.05 });
    io.observe(mob);
    offs.push(() => io.disconnect());
  }
  offs.push(() => hideVisit(false));
  return () => offs.forEach((f) => f());
});
