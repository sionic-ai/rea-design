// Our Story — each cell of the timeline embla (center-aligned · duration 26 · skipSnaps) moves its own photo, sun, title and text, phone news swiping, inner flow of the big photo
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lin = (v, [a, b], [c, d]) => clamp(c + ((v - a) / (b - a)) * (d - c), Math.min(c, d), Math.max(c, d));
  const p3 = gsap.parseEase("power3.inOut"), p4 = gsap.parseEase("power4.inOut"), sine = gsap.parseEase("sine.inOut");

  /* Timeline — original tween: photo scale(.7+.3m), rotate(speed), transparent power3, year number .8·power3+.2, title f .6→.9 · text slides in 4rem from .7→1 */
  const years = document.querySelector(".ab-years__wrap");
  if (years && window.EmblaCarousel) {
    const view = years.querySelector(".ab-years__view");
    const api = EmblaCarousel(view, { dragFree: false, loop: false, axis: "x", duration: 26, skipSnaps: true, align: "center", containScroll: false });
    const prev = years.querySelector("[data-prev]"), next = years.querySelector("[data-next]");
    const slides = api.slideNodes().map((s) => ({
      in: s.querySelector(".ab-slide__in"), img: s.querySelector(".ab-slide__img"), year: s.querySelector(".ab-slide__year"),
      yearM: s.querySelector(".ab-slide__year-m"), info: s.querySelector(".ab-slide__info"), title: s.querySelector(".ab-slide__title"), desc: s.querySelector(".ab-slide__desc"),
    }));
    const tween = () => {
      const eng = api.internalEngine(), prog = api.scrollProgress(), snaps = api.scrollSnapList();
      const gap = snaps.length > 1 ? Math.abs(snaps[1] - snaps[0]) : 1;
      const B = clamp(-(0.002 * eng.scrollBody.velocity()), -0.22, 0.22);
      snaps.forEach((snap, t) => {
        (eng.slideRegistry[t] ?? []).forEach((n) => {
          const o = (snap - prog) / gap, u = Math.abs(o);
          const d = clamp(o, 0, 1), m = Math.max(0, 1 - u), f = Math.max(0, 1 - o), p = Math.max(0, 1 + o);
          const s = slides[n];
          if (reduce) return;
          s.in.style.transform = `translateX(${-25 * sine(d)}%)`;
          s.img.style.transform = `translateX(${-55 * B}rem) scale(${0.7 + 0.3 * m}) rotate(${B}rad)`;
          s.img.style.opacity = `${p3(m)}`;
          s.year.style.opacity = `${0.8 * p3(m) + 0.2}`;
          s.yearM.style.opacity = `${p4(m)}`;
          s.info.style.opacity = `${p3(lin(p, [0.5, 1], [0, 1]))}`;
          const tt = lin(f, [0.6, 0.9], [0, 1]);
          s.title.style.transform = `translateX(${(1 - tt) * 4}rem)`;
          s.title.style.opacity = `${tt}`;
          const dd = lin(f, [0.7, 1], [0, 1]);
          s.desc.style.transform = `translateX(${(1 - dd) * 4}rem)`;
          s.desc.style.opacity = `${dd}`;
        });
      });
    };
    const sel = () => {
      const k = api.selectedScrollSnap();
      prev.disabled = k === 0;
      next.disabled = k === slides.length - 1;
      slides.forEach((s, i) => s.year.classList.toggle("is-on", i === k));
    };
    slides.forEach((s, i) => s.year.addEventListener("click", () => api.scrollTo(i)));
    prev.addEventListener("click", () => api.scrollPrev());
    next.addEventListener("click", () => api.scrollNext());
    api.on("scroll", tween).on("reInit", () => { tween(); sel(); }).on("slideFocus", tween).on("select", sel);
    tween(); sel();
  }

  /* Phone news — grid cards are swiped with embla (left-aligned · duration 20 · skipSnaps) */
  const track = document.querySelector(".ab-news__track");
  if (track && window.EmblaCarousel) {
    document.querySelectorAll(".ab-news__grid .ab-card").forEach((c) => track.appendChild(c.cloneNode(true)));
    EmblaCarousel(track.parentElement, { dragFree: false, loop: false, axis: "x", duration: 20, align: "start", skipSnaps: true, containScroll: false });
  }

  /* Large photo — the inside drifts slowly within the frame */
  if (!reduce && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".ab-hero__in, .ab-media__in").forEach((n) => {
        gsap.fromTo(n, { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: n.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
  }
})();
