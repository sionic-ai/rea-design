// Page-wide items — Lenis (lerp .07 · phone .3), wordmark, scissors loader, shrinking header, hide-and-show header, line blur-in, cookie card, phone menu, clock.
(() => {
  const NL = (window.NL = {});
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => innerWidth <= 768;
  const desk = () => innerWidth >= 992;
  NL.reduce = reduce;
  NL.phone = phone;
  NL.desk = desk;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  if (!reduce) {
    const lenis = new Lenis({ lerp: phone() ? 0.3 : 0.07 });
    NL.lenis = window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Wordmark: our geometric letters LOGOTYPE — one path per letter so each falls separately ──
  const T = 34, H = 230, G = 150;
  const R = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}z`;
  const glyphs = [
    R(0, 0, T, H) + R(T, H - T, G - T, T),
    `M0 0h${T}v96a41 41 0 0 0 82 0v-96h${T}v96a75 75 0 0 1 -150 0z` + R(0, H - T, G, T),
    R(0, 0, G, T) + R(0, T, T, H - 2 * T) + R(0, H - T, G, T) + R(G - T, 112, T, H - 112 - T) + R(78, 112, G - T - 78, T),
    R(0, 0, G, T) + `M0 155a75 75 0 1 0 150 0a75 75 0 1 0 -150 0zM34 155a41 41 0 1 1 82 0a41 41 0 1 1 -82 0z`,
    R(0, 0, G, T) + R(58, T, T, H - T),
    `M0 0h40l35 92l35-92h40l-58 140v90h-34v-90z`,
    R(0, 0, T, H) + `M${T} 0h56a62 62 0 0 1 0 124h-56v-34h56a28 28 0 0 0 0-56h-56z`,
    R(0, 0, T, H) + R(T, 0, G - T, T) + R(T, 98, 86, T) + R(T, H - T, G - T, T),
  ];
  const step = (1400 - G) / 7;
  NL.mark = () => {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 1400 230");
    svg.setAttribute("class", "nl-wordmark");
    svg.setAttribute("aria-hidden", "true");
    glyphs.forEach((d, i) => {
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill-rule", "evenodd");
      p.setAttribute("transform", `translate(${(i * step).toFixed(2)} 0)`);
      svg.appendChild(p);
    });
    return svg;
  };
  document.querySelectorAll("[data-mark]").forEach((el) => el.appendChild(NL.mark()));

  // ── Clock — local time of one place, updated every second ──
  const clocks = [...document.querySelectorAll("[data-clock]")];
  const tick = () => {
    const t = new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Warsaw", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    clocks.forEach((c) => (c.innerHTML = `Local time<br>${t} (GMT+1)`));
  };
  tick();
  setInterval(tick, 1000);

  // ── Loader — values of the original Webflow interactions a-73 (desktop) and a-77 (phone) ──
  const loader = document.querySelector(".nl-loader");
  NL.loaderDone = new Promise((done) => {
    if (!loader) return done();
    const top = loader.querySelector(".nl-loader__top"), bottom = loader.querySelector(".nl-loader__bottom");
    const sc = loader.querySelector(".nl-loader__scissors"), solid = loader.querySelector(".nl-loader__solid");
    const cut = loader.querySelector(".nl-loader__cut"), wheels = [...loader.querySelectorAll("[data-wheel]")];
    // Five wheels — 4-, 5-, 6-, 8-gons and a circle (the original is a rolling-wheel picture)
    wheels.forEach((w) => {
      const n = +w.dataset.wheel, pts = [];
      for (let i = 0; i < n; i++) { const a = Math.PI / 2 + (i * 2 * Math.PI) / n; pts.push(`${6 + 5 * Math.cos(a)},${6 + 5 * Math.sin(a)}`); }
      w.innerHTML = n ? `<svg viewBox="0 0 12 12"><polygon points="${pts.join(" ")}"/></svg>` : `<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="5"/></svg>`;
    });
    // Number strip — hundreds digit 0·1, tens digit 0~9 twelve times, ones digit 0·5 twelve times (20px cells)
    const fill = (k, list) => { const s = loader.querySelector(`[data-strip="${k}"]`); s.innerHTML = list.map((d) => `<span>${d}</span>`).join(""); return s; };
    const sh = fill("h", [0, 1]);
    const st = fill("t", Array.from({ length: 120 }, (_, i) => i % 10));
    const so = fill("o", Array.from({ length: 24 }, (_, i) => (i % 2) * 5));
    const paths = loader.querySelectorAll(".nl-wordmark path");
    const close = () => { loader.classList.add("is-gone"); done(); };
    if (reduce) return close();
    const m = phone();
    const proxy = { v: 0 };
    gsap.to(proxy, { v: 100, duration: 3, ease: "power2.inOut", onUpdate: () => {
      gsap.set(sh, { y: -(proxy.v / 100) * 20 }); gsap.set(st, { y: -(proxy.v / 10) * 20 }); gsap.set(so, { y: -(proxy.v / 5) * 20 });
    } });
    gsap.fromTo(paths, { y: -300 }, { y: 0, duration: 2, ease: "power1.out", stagger: { each: 0.05, from: "center" } });
    gsap.set(sc, { xPercent: m ? 0 : 7 });
    gsap.set(solid, { width: m ? "3%" : "9%" });
    gsap.set(wheels, { x: "-80vw" });
    const tl = gsap.timeline({ onComplete: close });
    wheels.forEach((w, i) => tl.to(w, { x: 0, duration: 2.8 - i * 0.1, ease: "power2.inOut" }, 0));
    tl.to(sc, { xPercent: 100, duration: 3, ease: "power1.inOut" }, 0.4)
      .to(solid, { width: "102.5%", duration: 3, ease: "power1.inOut" }, 0.4);
    const g2 = 3.4;
    wheels.forEach((w, i) => tl.to(w, { x: "80vw", duration: 2.5 - i * 0.1, ease: "power2.inOut" }, g2 + 0.1));
    tl.to([top, bottom], { height: 0, duration: 1.5, ease: "power2.in" }, g2 + 0.15)
      .to(cut, { opacity: 0, duration: 0.1 }, g2 + 0.15);
  });

  // ── Header — original a-30: while passing the 20px marker below the hero (0→30%) the wordmark width goes from screen width → 140px, and the intro text switches off at 17~18% ──
  const nav = document.querySelector(".nl-nav");
  if (nav) {
    const mark = nav.querySelector(".nl-nav__mark"), row = nav.querySelector(".nl-nav__row"), tag = nav.querySelector(".nl-nav__tag");
    const cover = nav.querySelector(".nl-nav__cover");
    const s = { p: 0 };
    const paint = () => {
      if (!desk()) { mark.style.width = ""; mark.style.top = ""; row.style.top = ""; return; }
      const full = innerWidth - 40, k = Math.min(1, s.p / 0.3), k2 = Math.min(1, s.p / 0.32);
      const w = full + (140 - full) * k;
      mark.style.width = `${w}px`;
      // Hide and show are applied separately by transform(y), so position moves with top
      mark.style.top = `${20 - 6 * k}px`;
      const spacer = full * (1 - k2) / 6.09;
      row.style.top = `${16 + spacer + 12 * (1 - k2)}px`;
      tag.style.opacity = s.p < 0.17 ? 1 : s.p > 0.18 ? 0 : 1 - (s.p - 0.17) / 0.01;
    };
    ScrollTrigger.create({ start: 0, end: () => innerHeight + 20, scrub: 0.6, onUpdate: (st) => { gsap.to(s, { p: st.progress, duration: reduce ? 0 : 0.6, ease: "none", overwrite: true, onUpdate: paint }); } });
    addEventListener("resize", paint);
    paint();
    // Scrolling down hides it 330px upward (.5s), scrolling up brings it back with a white background
    let hidden = false, last = 0;
    const set = (hide) => {
      if (hide === hidden || !desk()) return;
      hidden = hide;
      gsap.to([mark, row], { y: hide ? -330 : 0, duration: reduce ? 0 : 0.5, ease: "power1.inOut", overwrite: "auto" });
      gsap.to(cover, { opacity: hide ? 0 : scrollY > 400 ? 1 : 0, duration: reduce ? 0 : 0.5 });
    };
    addEventListener("scroll", () => {
      const y = scrollY, d = y - last;
      last = y;
      if (Math.abs(d) < 2) return;
      if (d > 0 && y > innerHeight * 0.3) set(true);
      else if (d < 0) set(false);
      if (y < 10) gsap.to(cover, { opacity: 0, duration: 0.3 });
    }, { passive: true });
    // Phone menu — original a-82·a-83: the panel unfolds in .6s and the text turns on in .3s after .6s
    const burger = nav.querySelector(".nl-burger");
    burger?.addEventListener("click", () => {
      const open = !nav.hasAttribute("data-open");
      nav.toggleAttribute("data-open", open);
      burger.setAttribute("aria-expanded", String(open));
      nav.querySelector(".nl-menu").setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll(".nl-menu a").forEach((a) => a.addEventListener("click", () => { nav.removeAttribute("data-open"); document.body.style.overflow = ""; }));
  }

  // ── Line blur reveal — original data-reveal="blur": each line fades in from transparent, blur 10px, 15px below → .4s power1.out, stagger .12, at 85% of the viewport ──
  NL.reveal = () => {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      SplitText.create(el, {
        type: "lines", linesClass: "nl-rline", autoSplit: true,
        onSplit(self) {
          el.classList.add("is-split");
          if (reduce) return;
          return gsap.fromTo(self.lines, { opacity: 0, filter: "blur(10px)", y: 15 }, {
            opacity: 1, filter: "blur(0px)", y: 0, duration: 0.4, ease: "power1.out", stagger: 0.12, overwrite: true,
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
          });
        },
      });
    });
  };

  // ── Inner links — jump straight to the spot instead of sliding smoothly like the original ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const st = ScrollTrigger.getAll().filter((s) => s.trigger === el || el.contains(s.trigger)).sort((p, q) => (q.end - q.start) - (p.end - p.start))[0];
    const y = st ? st.start + (st.end - st.start) * 0.2 : el.getBoundingClientRect().top + scrollY;
    NL.lenis ? NL.lenis.scrollTo(Math.max(0, y), { immediate: true }) : scrollTo(0, Math.max(0, y));
  });

  // Cookie card
  document.querySelectorAll("[data-cookie]").forEach((b) => b.addEventListener("click", () => b.closest(".nl-cookie").classList.add("is-gone")));
  addEventListener("load", () => ScrollTrigger.refresh());
})();
