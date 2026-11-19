// Home — header line entrance (logo and identity line gather within 150px at screen center, letters rise, then settle in place at 2s),
// Slides (photo 3.604s · video when it ends), on scroll the slide panel scales up 2x while blurring, the header line sticks to the top once past the hero and blends in difference mode
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = matchMedia("(min-width: 64rem)");
  const nav = document.querySelector(".tw-nav--home");
  const hero = document.querySelector("[data-hero]");
  const slides = [...document.querySelectorAll("[data-hero-slide]")];
  const DUR = 3604;

  let cur = 0, timer = null, ready = false;
  const show = (i) => {
    cur = (i + slides.length) % slides.length;
    clearTimeout(timer);
    slides.forEach((s, k) => {
      s.classList.toggle("is-on", k === cur);
      const v = s.querySelector("video");
      if (v && k !== cur) { v.pause(); v.currentTime = 0; }
    });
    const v = slides[cur].querySelector("video");
    if (v) { v.onended = () => show(cur + 1); v.play().catch(() => (timer = setTimeout(() => show(cur + 1), DUR))); }
    else timer = setTimeout(() => show(cur + 1), DUR);
  };
  const start = () => { if (ready) return; ready = true; if (!reduce) show(0); };
  const intro = () => {
    const first = slides[0].querySelectorAll(".wf-img, video");
    TW.reveal([...first]);
    setTimeout(start, 0);
  };
  slides.slice(1).forEach((s) => s.querySelectorAll(".wf-img, video").forEach((m) => gsap.set(m, { opacity: 1, scale: 1 })));

  // Arriving from the same site or on a phone, skip the intro and go straight in
  const sameSite = (() => { try { const n = performance.getEntriesByType("navigation")[0]; return n && n.type !== "reload" && document.referrer && new URL(document.referrer).origin === location.origin; } catch { return false; } })();
  // As in the original, the entrance starts after the document has fully loaded (load) — until then the headline stays hidden
  const run = () => {
  if (sameSite || !wide.matches || reduce) { nav.classList.remove("is-wait"); intro(); }
  else {
    nav.classList.remove("is-wait");
    const title = nav.querySelector("[data-nav-title] a");
    const sub = nav.querySelector("[data-nav-subtitle]");
    const t = title.getBoundingClientRect(), s = sub.getBoundingClientRect();
    const w = t.width + 150 + s.width, left = (innerWidth - w) / 2;
    const tLi = title.parentElement;
    gsap.set(tLi, { x: left - t.left });
    gsap.set(sub, { x: left + t.width + 150 - s.left });
    const tc = TW.chars(title), sc = TW.chars(sub);
    const nc = [...nav.querySelectorAll("[data-nav-nav] > ul > li > .tw-uline")].flatMap((el) => { const l = el.querySelector(".tw-uline__l"); const c = TW.chars(el); el.append(l); return c; });
    const cb = nav.querySelector("[data-nav-contact] .tw-uline");
    const cl = cb.querySelector(".tw-uline__l");
    const cc = TW.chars(cb); cb.append(cl);
    nav.style.pointerEvents = "none";
    const tl = gsap.timeline({ defaults: { ease: "power4.out" }, onComplete: () => (nav.style.pointerEvents = "") });
    gsap.set([...tc, ...sc, ...nc, ...cc], { yPercent: 110 });
    tl.to(tc, { yPercent: 0, duration: 1.5, stagger: 0.012 })
      .to(sc, { yPercent: 0, duration: 1, stagger: 0.01 }, "-=1")
      .to([tLi, sub], { x: 0, duration: 2 })
      .to(nc, { yPercent: 0, duration: 1, stagger: 0.01 }, "-=1.5")
      .to(cc, { yPercent: 0, duration: 1, stagger: 0.01 }, "-=1.5")
      .call(intro, null, "-=1.5");
  }
  };
  if (document.readyState === "complete") run(); else addEventListener("load", run, { once: true });

  // Header line — on desktop starts at screen center, sticks to the top once past that spot, and over the hero shows white text without blending
  const mm = gsap.matchMedia();
  mm.add("(min-width: 64rem)", () => {
    const top = nav.getBoundingClientRect().top + scrollY;
    const st = ScrollTrigger.create({ start: top, end: "max", onToggle: ({ isActive }) => nav.classList.toggle("is-stuck", isActive) });
    return () => { st.kill(); nav.classList.remove("is-stuck"); };
  });
  ScrollTrigger.create({ trigger: hero, start: "top top", end: () => `bottom top+=${nav.offsetHeight}`, onLeave: () => nav.classList.remove("is-normal"), onEnterBack: () => nav.classList.add("is-normal") });

  const zoom = document.querySelector("[data-hero-zoom]");
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(zoom, { scale: 1, opacity: 1 }, { scale: 2, opacity: 0, ease: "none", immediateRender: false, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  });

  // Smiling face — drawn once when 10% enters the screen (original dotLottie plays once)
  const smile = document.querySelector("[data-smile]");
  if (smile) {
    const parts = smile.querySelectorAll("circle:not(.tw-smile__eye), path");
    parts.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    const eyes = smile.querySelectorAll(".tw-smile__eye");
    gsap.set(eyes, { scale: 0, transformOrigin: "50% 50%" });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      gsap.timeline()
        .to(parts, { strokeDashoffset: 0, duration: reduce ? 0 : 1.2, ease: "power2.inOut", stagger: 0.25 })
        .to(eyes, { scale: 1, duration: reduce ? 0 : 0.4, ease: "back.out(2)", stagger: 0.08 }, "-=0.3");
    }, { threshold: 0.1 });
    io.observe(smile);
  }
})();
