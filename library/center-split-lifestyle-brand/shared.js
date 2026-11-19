// Motion shared by several sections — menu drawer, background panel and header line swap (watching screen lines), reveal, parallax, link copy
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".rw-header");
  const wrapBg = document.querySelector(".rw-bg");
  const isSp = () => !matchMedia("screen and (min-width: 768px) and (orientation: landscape)").matches;

  // Logo letters — split into spans per letter so css applies the hinge unfolding
  const markSvg = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M14 11v18M14 11h6a4.5 4.5 0 0 1 0 9h-6M19 20l6 9" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>';
  document.querySelectorAll(".rw-logo[data-word]").forEach((el) => {
    el.innerHTML = [...el.dataset.word].map((c) => `<span aria-hidden="true">${c}</span>`).join("") + `<span class="rw-logo__mark">${markSvg}</span>`;
    el.setAttribute("aria-label", el.dataset.word);
  });

  // Menu drawer — the overlay is jQuery fadeIn (300ms swing) kept as is, with sine.inOut
  const btn = document.querySelector(".rw-navbtn");
  const nav = document.querySelector(".rw-nav");
  const overlay = document.querySelector(".rw-overlay");
  const fade = (show) => {
    gsap.killTweensOf(overlay);
    if (show) {
      overlay.style.display = "block";
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.3, ease: "sine.inOut" });
    } else {
      gsap.to(overlay, { opacity: 0, duration: reduce ? 0 : 0.3, ease: "sine.inOut", onComplete: () => (overlay.style.display = "none") });
    }
  };
  const close = () => { fade(false); nav.classList.remove("is-open"); btn.classList.remove("is-open"); header.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); };
  btn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (nav.classList.contains("is-open")) return close();
    fade(true); nav.classList.add("is-open"); btn.classList.add("is-open"); header.classList.add("is-open"); btn.setAttribute("aria-expanded", "true");
  });
  overlay?.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav?.classList.contains("is-open")) close(); });

  // PRODUCT header row — a floating panel on PC, fold/unfold on phone
  document.querySelectorAll(".rw-hnav__btn").forEach((b) => {
    b.addEventListener("click", () => {
      const drop = b.nextElementSibling;
      document.querySelectorAll(".rw-hnav__btn.is-active").forEach((o) => { if (o !== b) { o.classList.remove("is-active"); o.nextElementSibling.classList.remove("is-active"); } });
      const on = !b.classList.contains("is-active");
      b.classList.toggle("is-active", on); drop.classList.toggle("is-active", on);
      b.setAttribute("aria-expanded", String(on));
    });
  });

  // Background board — named after the section crossing the 1% band at screen center
  const bgs = document.querySelectorAll("[data-bg-zone]");
  if (bgs.length && wrapBg) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      wrapBg.dataset.bg = e.target.dataset.bgZone;
      header.dataset.bg = e.target.dataset.bgZone;
    }), { rootMargin: "-50% 0% -49% 0%", threshold: 0 });
    bgs.forEach((el) => io.observe(el));
  }
  // Header text color: set by the color name of the section at the top 1% strip of the screen
  const hds = document.querySelectorAll("[data-hdcolor]:not(.rw-header)");
  if (hds.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) header.dataset.hdcolor = e.target.dataset.hdcolor; }), { rootMargin: "0% 0% -99% 0%", threshold: 0 });
    hds.forEach((el) => io.observe(el));
  }

  // Reveal — once, when it enters the area excluding the bottom 25% of the screen
  const anim = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-animated"); anim.unobserve(e.target); } }), { rootMargin: "0% 0% -25% 0%", threshold: 0 });
  document.querySelectorAll(".rw-anim").forEach((el) => anim.observe(el));

  // Parallax — by from → to of its own height (default −.25 → .25), from entering at the screen bottom until leaving at the top
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".rw-parallax").forEach((el) => {
        const h = el.offsetHeight;
        const from = el.dataset.from ? h * el.dataset.from : -0.25 * h;
        const to = el.dataset.to ? h * el.dataset.to : 0.25 * h;
        gsap.fromTo(el, { y: from }, { y: to, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: el.dataset.end || "bottom top", scrub: el.dataset.scrub ? Number(el.dataset.scrub) : true } });
      });
    });
  }

  // Copy link — a tooltip bubble pops up briefly
  document.querySelectorAll(".rw-copy").forEach((b) => b.addEventListener("click", () => {
    navigator.clipboard?.writeText(location.href).catch(() => {});
    b.classList.add("is-active");
    setTimeout(() => b.classList.remove("is-active"), 600);
  }));

  window.rwIsSp = isSp;
})();
