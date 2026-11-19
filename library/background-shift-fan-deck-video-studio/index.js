(() => {
  const { reduce, fine, $, $$ } = window.site;
  const mm = gsap.matchMedia();

  // ── Hero: one 226-unit timeline (scrub 1.25). Each stage starts before the previous one ends, so there is no stop
  //   w 0~24 green fills up and the wordmark turns into the header logo · m 21~41 the copy slides up and out and the reel rises · r 25~50 the verbs roll by
  //   q 40~60 sky · paper fills and ”What we make” · e 58~90 deck rises · head card 48~74 · video card 68~(4 turns) · pu 72~98 push-out
  //   rail 100~152 card row flows · vz 153~209 last green card fills the screen · vl·vt green section line and title
  function hero() {
    const pin = $(".pin"), logo = $(".logo"), proj = $("#proj"), word = $(".wordmark");
    const cards = $$(".pcard"), head = cards[0], mates = cards.slice(1);
    const vg = $("#vg");
    const measure = () => {
      // The wordmark shrinks to the header logo spot and size (--hx, --hy, --hs)
      gsap.set(pin, { "--w": 0 });
      const a = word.getBoundingClientRect(), b = logo.getBoundingClientRect();
      pin.style.setProperty("--hx", b.left + b.width / 2 - (a.left + a.width / 2) + "px");
      pin.style.setProperty("--hy", b.top + b.height / 2 - (a.top + a.height / 2) + "px");
      pin.style.setProperty("--hs", (b.height / a.height * 1.6).toFixed(3));
    };
    if (reduce) {
      gsap.set([pin, logo], { "--w": 0 });
      cards.forEach((c) => c.style.setProperty("--ei", 1));
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: "#s01", start: "top top", end: "bottom bottom", scrub: 1.25, invalidateOnRefresh: true,
        onRefreshInit: measure,
        onUpdate: (self) => {
          const p = self.progress;
          document.body.classList.toggle("on-green", p > 0.2 && p < 0.5);
          document.body.classList.toggle("on-sky", p >= 0.19 && p < 0.5);
          window.site.readInk();
        },
      },
    });
    const V = [pin, logo];
    tl.to(V, { "--w": 1, duration: 24 }, 0)
      .to(V, { "--m": 1, duration: 20 }, 21)
      .to(V, { "--q": 1, duration: 20 }, 40)
      .to(V, { "--r": 7, duration: 25 }, 25)
      .to(V, { "--e": 1, duration: 32 }, 58)
      .to(head, { "--ei": 1, duration: 26, ease: "power3.out" }, 48)
      .to(mates, { "--ei": 1, duration: 20, ease: "power2.out", stagger: { each: 4 } }, 68)
      .to(proj, { "--pu": 1, duration: 26, ease: "power2.inOut" }, 72)
      .to(proj, { "--rail": cards.length - 2, duration: 52 }, 100)
      .to(proj, { "--vz": 1, duration: 56, ease: "sine.inOut" }, 153)
      .to(vg, { "--vlp": 1, duration: 56 }, 155)
      .to(pin, { opacity: 0, duration: 4 }, 205)
      .to(vg, { "--vt": 1, duration: 15 }, 209)
      .to({}, { duration: 2 }, 224);
    gsap.set(vg, { "--vlp": 0, "--vt": 0 });
    window.site.s01ST = tl.scrollTrigger;
    // Arrow: rolls the row one step (1.1s) into place
    $$(".parr").forEach((b) => b.addEventListener("click", () => {
      const st = tl.scrollTrigger, r = Math.round(parseFloat(getComputedStyle(proj).getPropertyValue("--rail")) || 0);
      const n = Math.max(0, Math.min(cards.length - 2, r + (b.classList.contains("parr--r") ? 1 : -1)));
      const y = st.start + (st.end - st.start) * ((100 + (n / (cards.length - 2)) * 52) / 226);
      window.site.lenis ? window.site.lenis.scrollTo(y, { duration: 1.1 }) : scrollTo(0, y);
    }));
  }

  // ── Green section: video cells turn on and off at their own times, and as the service panel rises the green darkens
  function videoGrid() {
    const cells = $$(".vg-cell");
    if (reduce) { cells.forEach((c) => c.classList.add("on")); return; }
    const plan = [[0.05, 0.2], [0.18, 0.33], [0.31, 0.46], [0.44, 0.59], [0.57, 0.72], [0.7, 0.85]];
    ScrollTrigger.create({ trigger: ".vg-wrap", start: "top top", end: "bottom bottom", onUpdate: (s) => cells.forEach((c, i) => c.classList.toggle("on", s.progress > plan[i][0] && s.progress < plan[i][1])) });
    ScrollTrigger.create({ trigger: ".svc-intro", start: "top bottom", end: "top top", onUpdate: (s) => ($(".vg-shade").style.opacity = (s.progress * 0.55).toFixed(3)) });
  }

  // ── Service: the gap between text lines opens from the center (scrub .8, screen 94% → down to 55%)
  function services() {
    if (reduce) { $(".svc-intro").style.setProperty("--hv", 1); return; }
    gsap.fromTo(".svc-intro", { "--hv": 0 }, { "--hv": 1, ease: "none", scrollTrigger: { trigger: ".svc-intro", start: "top 94%", end: "bottom 55%", scrub: 0.8 } });
  }

  // ── AI: the window grows and sharpens (--in .1→0, blur 12→0), the prompt is typed, three thinking lines → answer → five scenes, and at the end it shrinks again and blurs ──
  function ai() {
    const win = $(".ai-win"), typer = $(".ai-type"), text = typer.dataset.text, inText = $(".ai-in-text");
    const set = (k, v) => win.style.setProperty(k, v);
    if (reduce) { set("--in", 0); set("--bl", 0); set("--ty", 1); set("--th", 3); set("--cl", 1); typer.textContent = text; return; }
    const st = { in: 0.1, bl: 12, ty: 0, th: -1, cl: 0 };
    const draw = () => {
      set("--in", st.in); set("--bl", st.bl); set("--ty", st.ty); set("--th", st.th); set("--cl", st.cl);
      // Typed into the input one letter at a time (ty 0~.95), then rises into a speech bubble when done, and the input empties back to its hint text
      const typing = st.ty > 0 && st.ty < 0.95;
      inText.textContent = typing ? text.slice(0, Math.round(Math.min(1, st.ty / 0.9) * text.length)) : inText.dataset.ph;
      inText.classList.toggle("ai-typing", typing);
      typer.textContent = text;
      document.body.classList.toggle("on-ai", st.in < 0.05);
    };
    const tl = gsap.timeline({ defaults: { ease: "none" }, onUpdate: draw, scrollTrigger: { trigger: "#ai", start: "top top", end: "bottom bottom", scrub: 1.25 } });
    tl.to(st, { in: 0, bl: 0, duration: 20, ease: "power2.out" }, 0)
      .to(st, { ty: 1, duration: 22 }, 42)
      .to(st, { th: 3, duration: 18 }, 62)
      .to(st, { cl: 1, duration: 12 }, 78)
      .to(st, { in: 0.03, bl: 10, duration: 10, ease: "power2.in" }, 90);
    draw();
  }

  // ── Orange band: the big text line drifts left by the scroll amount while pinned (scrub 1.25)
  function works() {
    const inner = $("#mqIn");
    if (reduce) return;
    gsap.to(inner, { x: () => -(inner.firstElementChild.offsetWidth - innerWidth * 0.2), ease: "none", scrollTrigger: { trigger: "#works", start: "top top", end: "bottom bottom", scrub: 1.25, invalidateOnRefresh: true } });
  }

  // ── Team fan: unfolds in order from the center at 2.5 (scrub 1.25, screen 78% → 12%). A hovered card lifts 16px and neighbors step aside (.55s power3.out)
  function fan() {
    const figs = $$("#fanStage figure");
    if (reduce) { figs.forEach((f) => f.style.setProperty("--f", 1)); return; }
    gsap.to(figs, { "--f": 1, duration: 30, ease: "none", stagger: { each: 2.5, from: "center" }, scrollTrigger: { trigger: "#fan", start: "top 78%", end: "top 12%", scrub: 1.25 } });
    if (!fine) return;
    const z0 = figs.map((f) => f.style.getPropertyValue("--z"));
    figs.forEach((f, k) => {
      f.addEventListener("mouseenter", () => figs.forEach((c, j) => {
        gsap.to(c, { "--px": j === k ? "0px" : (j < k ? -40 : 40) + "px", "--hv": j === k ? 1 : 0, duration: 0.55, ease: "power3.out", overwrite: "auto" });
        c.style.setProperty("--z", j === k ? 50 : z0[j]);
      }));
      f.addEventListener("mouseleave", () => figs.forEach((c, j) => { gsap.to(c, { "--px": "0px", "--hv": 0, duration: 0.55, ease: "power3.out", overwrite: "auto" }); c.style.setProperty("--z", z0[j]); }));
    });
  }

  // ── Curved text band: text flows along an arc as much as you scroll (one loop interlocks with no seams)
  function band() {
    const tp = $("#arcText");
    if (reduce || !tp) return;
    let off = 0, lastY = scrollY;
    gsap.ticker.add(() => {
      const dy = scrollY - lastY; lastY = scrollY;
      off = (off - 0.04 - dy * 0.12) % 25;
      tp.setAttribute("startOffset", off + "%");
    });
  }

  // ── FAQ: height follows a curve (.6s) on open and close, and on exit the panel shrinks to .9 around its top edge
  function faq() {
    $$(".faq details").forEach((d) => {
      const s = d.querySelector("summary"), a = d.querySelector(".faq-a");
      s.addEventListener("click", (e) => {
        if (reduce) return;
        e.preventDefault();
        if (d.open) gsap.to(a, { height: 0, duration: 0.45, ease: "power2.out", onComplete: () => { d.open = false; gsap.set(a, { clearProps: "height" }); } });
        else { d.open = true; gsap.fromTo(a, { height: 0 }, { height: a.scrollHeight, duration: 0.45, ease: "power2.out", onComplete: () => gsap.set(a, { clearProps: "height" }) }); }
      });
    });
    if (!reduce) gsap.to(".faq", { scale: 0.92, borderRadius: 26, ease: "none", scrollTrigger: { trigger: ".faqlift", start: "bottom bottom", end: "bottom 40%", scrub: true } });
  }

  // Hero deck: cards shift by depth and tilt slightly according to the mouse position (original --sx, --sy, --sr, .62s bounce transition)
  function deckFollow() {
    if (reduce || !fine) return;
    const slots = $$(".deck .slot"), depth = [0.6, 0.6, 1];
    // Only while the Hero is visible (first two screens of the hero) — so the hidden deck doesn’t follow the pointer when it moves over lower sections
    addEventListener("pointermove", (e) => {
      if (scrollY > innerHeight * 2) return;
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      slots.forEach((s, i) => { s.style.setProperty("--sx", (nx * 26 * depth[i]).toFixed(1) + "px"); s.style.setProperty("--sy", (ny * 18 * depth[i]).toFixed(1) + "px"); s.style.setProperty("--sr", (nx * 3 * depth[i]).toFixed(2) + "deg"); });
    }, { passive: true });
  }

  window.site.ready.then(() => {
    deckFollow();
    hero();
    videoGrid();
    services();
    ai();
    works();
    fan();
    band();
    faq();
    ScrollTrigger.refresh();
  });
})();
