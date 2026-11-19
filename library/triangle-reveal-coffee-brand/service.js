// Business page: Hero video parallax (y −13.5% power2.out scrub) · type piece panel (on hover pieces fill and photo scales 1.1 in .3s, photo goes −20° → 20° with scroll · yPercent 40 → −40) ·
// Title .9 → 1x over 1.75s power4.inOut (.75s late), three pinned machines (175vh per panel, the progress line fills during that panel)
(() => {
  const mm = gsap.matchMedia();

  // Round pieces: five inner ring pieces (r 200~420), seven outer ring pieces (r 420~640)
  const segs = window.DC.pie(document.querySelector(".sv-pie__svg"), [[200, 420, 5, -0.4], [420, 640, 7, 0.15]]);
  // A photo attaches to its nearest piece — hover that piece and the photo grows
  const stage = document.querySelector(".sv-pie__stage");
  const photos = [...stage.querySelectorAll(".sv-pie__ph")];
  const owner = photos.map((ph) => {
    const x = (+getComputedStyle(ph).getPropertyValue("--x") / 100) * 1000 - 500, y = (+getComputedStyle(ph).getPropertyValue("--y") / 100) * 1000 - 500;
    let best = 0, bd = 1e9;
    segs.forEach((s, i) => { const d = Math.hypot(s.mid[0] - x, s.mid[1] - y); if (d < bd) { bd = d; best = i; } });
    return best;
  });
  segs.forEach((s, i) => {
    s.path.addEventListener("mouseenter", () => { s.path.classList.add("is-on"); photos.forEach((ph, k) => ph.classList.toggle("is-on", owner[k] === i)); });
    s.path.addEventListener("mouseleave", () => { s.path.classList.remove("is-on"); photos.forEach((ph) => ph.classList.remove("is-on")); });
  });

  // Machine set
  const sec = document.querySelector(".sv-machines");
  const groups = [".sv-index li", ".sv-num", ".sv-tags", ".sv-name", ".sv-mach"].map((s) => [...sec.querySelectorAll(s)]);
  const bar = sec.querySelector(".sv-sep i");
  let cur = -1;
  const setActive = (n) => {
    if (n === cur) return;
    cur = n;
    groups.forEach((g) => g.forEach((el, i) => { el.classList.toggle("is-on", i === n); el.classList.toggle("is-past", i < n); }));
  };
  setActive(0);
  const slides = [...sec.querySelectorAll(".sv-slide")];
  ScrollTrigger.create({
    trigger: sec.querySelector(".sv-slides"), start: "top top", end: "bottom bottom",
    onUpdate: (s) => {
      const p = s.progress * slides.length;
      const n = Math.min(slides.length - 1, Math.floor(p));
      setActive(n);
      gsap.set(bar, { scaleX: Math.min(1, p - n) });
    },
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to(".sv-hero__bg", { y: "-13.5%", ease: "power2.out", scrollTrigger: { trigger: ".sv-hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".sv-hero__fade", { opacity: 1, ease: "power2.inOut", scrollTrigger: { trigger: ".sv-hero", start: "top top", end: "bottom top", scrub: true } });
    photos.forEach((ph) => gsap.fromTo(ph, { yPercent: 40, rotation: -20 }, { yPercent: -40, rotation: 20, ease: "none", scrollTrigger: { trigger: ".sv-pie", start: "top bottom", end: "bottom top", scrub: true } }));
    gsap.fromTo(".sv-pie__title", { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: 1.75, delay: .75, ease: "power4.inOut", scrollTrigger: { trigger: ".sv-pie", start: "top 70%", once: true } });
  });
})();
