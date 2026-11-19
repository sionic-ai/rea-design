(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = "gzEase";
  if (window.CustomEase) CustomEase.create(ease, "0.65,0,0.25,1");
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Moving text-line button — one text made into two copies (one exits upward + one rises from below)
  document.querySelectorAll("[data-kin]").forEach((a) => {
    const text = a.textContent.trim();
    a.classList.add("gz-kin");
    a.innerHTML = `<span class="gz-kin__win"><span class="gz-kin__label">${text}</span><span class="gz-kin__echo" aria-hidden="true">${text}</span></span><i class="gz-kin__rule" aria-hidden="true"></i>`;
    a.setAttribute("data-kin", a.getAttribute("data-kin") || "");
  });

  // Menu — MENU ↔ CLOSE rolls over in .3s and the panel covers from the top
  const menu = document.querySelector(".gz-menu"), menuBtn = document.querySelector(".gz-menu-btn");
  const setMenu = (open) => {
    if (!menu || !menuBtn) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.toggleAttribute("data-open", open);
    menu.inert = !open;
    document.body.classList.toggle("gz-locked", open);
  };
  if (menu) menu.inert = true;
  menuBtn?.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Sound button — two wave lines flow when on and lie flat when off (original is a sound-on button, here only the shape)
  const sound = document.querySelector(".gz-sound");
  sound?.addEventListener("click", () => sound.setAttribute("aria-pressed", String(sound.getAttribute("aria-pressed") !== "true")));

  document.querySelectorAll(".gz-next").forEach((a) => a.addEventListener("pointerenter", () => a.classList.add("is-lit"), { once: true }));

  // City time
  const clocks = document.querySelectorAll("[data-clock]");
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => { const d = new Date(); clocks.forEach((c) => { c.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`; }); };
  if (clocks.length) { tick(); setInterval(tick, 15000); }

  // Tail wordmark — when the tail section reaches 45% of the screen, it rises from 112% below in 1.2s
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const word = document.querySelector(".gz-foot__word div");
    if (word && window.ScrollTrigger) gsap.fromTo(word, { yPercent: 112 }, { yPercent: 0, duration: 1.2, ease, scrollTrigger: { trigger: ".gz-foot", start: "top 45%", toggleActions: "play none none reverse" } });
    // Section title line: inside a mask, rises from below (110%) in .9s with a .08 stagger
    gsap.utils.toArray("[data-rise]").forEach((box) => {
      const lines = box.querySelectorAll(".gz-line > span");
      if (!lines.length) return;
      gsap.fromTo(lines, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.9, ease, stagger: 0.08, scrollTrigger: { trigger: box, start: "top 82%", once: true } });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".gz-foot__word div", { yPercent: 0 });
    document.documentElement.classList.remove("gz-anim");
  });

  // Page transition — the whole screen darkens evenly in .27s then navigates, and the arriving page brightens evenly in .3s.
  // When the curtain is raised from below, pages with a dark bottom (work list·work detail) don’t show the first share, so the exit starts late
  const route = document.querySelector(".gz-route");
  if (route && sessionStorage.getItem("gz-route") === "1") {
    sessionStorage.removeItem("gz-route");
    gsap.fromTo(route, { opacity: 1 }, { opacity: 0, duration: reduce ? 0 : 0.3, ease: "none", delay: 0.05 });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !route || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname) || url.pathname === location.pathname) return;
    e.preventDefault();
    setMenu(false);
    sessionStorage.setItem("gz-route", "1");
    if (reduce) { location.href = url.href; return; }
    gsap.fromTo(route, { opacity: 0 }, { opacity: 1, duration: 0.27, ease: "none", onComplete: () => { location.href = url.href; } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted && route) gsap.set(route, { opacity: 0 }); });
})();
