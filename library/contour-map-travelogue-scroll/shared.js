// Shared by all sections: Lenis (1.45s), arrow cursor, top-right ruler ticks, analytics consent window, skin color reading
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  const fd = (window.fd = { reduce });
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  fd.clamp = clamp;

  // Skin variable → [r,g,b] (0–1, sRGB). oklch and color-mix are resolved by the canvas too
  const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  fd.color = (name) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    pix.clearRect(0, 0, 1, 1); pix.fillStyle = c; pix.fillRect(0, 0, 1, 1);
    const d = pix.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ duration: 1.45, smoothWheel: true });
    fd.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Arrow cursor — follows at .18s power3.out, vanishes over links in .15s to make way for the hand cursor, and scales 1.5× in .2s over [data-hover]
  const cur = document.querySelector(".fd-cur");
  if (cur && matchMedia("(pointer: fine)").matches && !reduce) {
    const qx = gsap.quickTo(cur, "x", { duration: 0.18, ease: "power3.out" });
    const qy = gsap.quickTo(cur, "y", { duration: 0.18, ease: "power3.out" });
    addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); }, { passive: true });
    document.querySelectorAll("a, [data-hover]").forEach((el) => {
      const link = el.tagName === "A";
      el.addEventListener("mouseenter", () => gsap.to(cur, link ? { opacity: 0, duration: 0.15 } : { scale: 1.5, duration: 0.2 }));
      el.addEventListener("mouseleave", () => gsap.to(cur, link ? { opacity: 1, duration: 0.15 } : { scale: 1, duration: 0.2 }));
    });
  } else document.body.classList.remove("fd-has-cur");

  // Latitude scale — the section’s latitude when passing its center, joined in a straight line in between
  const marker = document.querySelector(".fd-lat__marker"), readout = document.querySelector(".fd-lat__readout");
  if (marker && readout) {
    const TOP = 45, BOTTOM = 32, ANCHORS = [43.08, 39.56, 34.11, 32.37];
    const chaps = [...document.querySelectorAll(".fd-chap")];
    let at = [];
    const measure = () => { at = chaps.map((c) => c.getBoundingClientRect().top + scrollY + c.offsetHeight / 2 - innerHeight / 2); };
    measure();
    ScrollTrigger.addEventListener("refresh", measure);
    const paint = () => {
      const y = scrollY;
      let lat;
      if (!at.length || y <= at[0]) lat = ANCHORS[0];
      else if (y >= at[at.length - 1]) lat = ANCHORS[ANCHORS.length - 1];
      else { let i = 0; while (i < at.length - 2 && y > at[i + 1]) i++; const t = (y - at[i]) / Math.max(1, at[i + 1] - at[i]); lat = ANCHORS[i] + (ANCHORS[i + 1] - ANCHORS[i]) * t; }
      marker.style.top = `calc(${((TOP - lat) / (TOP - BOTTOM)) * 100}% - 3px)`;
      readout.textContent = `n ${lat.toFixed(2)}°`;
    };
    addEventListener("scroll", paint, { passive: true });
    paint();
  }

  // Analytics consent window — closes once a choice is made and reopens via ”Analytics settings” (nothing is sent)
  const consent = document.querySelector(".fd-consent");
  if (consent) {
    consent.querySelectorAll("[data-consent]").forEach((b) => b.addEventListener("click", () => { consent.hidden = true; }));
    document.querySelectorAll("[data-consent-open]").forEach((b) => b.addEventListener("click", () => { consent.hidden = false; }));
  }
})();
