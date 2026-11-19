// Careers: dragging a file into the window turns on the overlay and unfolds the cards. Pressing or dropping on a card shows that image in the slot (only inside this screen — nothing is sent anywhere),
// As soon as any field is filled, the bottom pill pops up, then changes width step by step: name → email → send
(() => {
  const body = document.body;
  const input = document.querySelector(".rb-apply__file");
  const cards = [...document.querySelectorAll(".rb-drop__card")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const M = window.rbMotion;
  if (!input || !cards.length) return;

  // Art in the card — original Rive (grid, sun, push board) as self-running GSAP loops in the same place.
  // Original shows a gray SVG while downloading the .riv (network, about 1.2s) — the copy has no file to fetch, so it spins right away
  const START = 0;
  if (window.gsap && !reduce) {
    const grid = document.querySelectorAll(".rb-drop__art--grid rect");
    gsap.timeline({ repeat: -1, repeatDelay: 0.6, delay: START })
      .to(grid, { scale: 0.86, transformOrigin: "50% 50%", duration: 0.35, ease: "power2.inOut", stagger: 0.12 })
      .to(grid, { scale: 1, duration: 0.45, ease: "back.out(2)", stagger: 0.12 }, 0.4);
    // Center card — like the original Sun picture, repeats moon (masking circle) → sun (shrunken circle + rays) → moon
    const rays = document.querySelectorAll(".rb-drop__rays rect");
    gsap.set(rays, { scale: 0, transformOrigin: "50% 50%" });
    gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: START })
      .to(".rb-drop__cut", { attr: { cx: 150, cy: -20 }, duration: 0.5, ease: "power2.inOut" })
      .to(".rb-drop__core", { attr: { r: 30 }, duration: 0.5, ease: "power2.inOut" }, 0)
      .to(rays, { scale: 1, duration: 0.45, ease: "back.out(2)", stagger: 0.04 }, 0.3)
      .to(".rb-drop__rays", { rotate: 45, svgOrigin: "61 61", duration: 1.6, ease: "power1.inOut" }, 0.3)
      .to(rays, { scale: 0, duration: 0.3, ease: "power2.in", stagger: 0.03 }, 2.6)
      .to(".rb-drop__core", { attr: { r: 40 }, duration: 0.5, ease: "power2.inOut" }, 2.9)
      .to(".rb-drop__cut", { attr: { cx: 84, cy: 44 }, duration: 0.5, ease: "power2.inOut" }, 2.9)
      .set(".rb-drop__rays", { rotate: 0, svgOrigin: "61 61" });
    gsap.to(".rb-drop__slide", { x: -8, duration: 0.9, ease: "power2.inOut", yoyo: true, repeat: -1, repeatDelay: 0.5, delay: START });
  } else if (window.gsap) {
    gsap.set(".rb-drop__cut", { attr: { cx: 150, cy: -20 } });
    gsap.set(".rb-drop__core", { attr: { r: 30 } });
  }

  let target = 0;
  const fill = (files) => {
    [...files].filter((f) => /^image\//.test(f.type)).forEach((f) => {
      const slot = cards.find((c, i) => i >= target && !c.classList.contains("is-filled")) || cards.find((c) => !c.classList.contains("is-filled"));
      if (!slot) return;
      slot.querySelector(".rb-drop__pic").style.backgroundImage = `url("${URL.createObjectURL(f)}")`;
      slot.classList.add("is-filled");
      if (window.gsap && !reduce) gsap.fromTo(slot, { scale: 0.75, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.inOut" });
    });
    bar.update();
  };
  cards.forEach((c, i) => c.addEventListener("click", () => { target = i; input.click(); }));
  input.addEventListener("change", () => { fill(input.files); input.value = ""; });

  let depth = 0;
  const dragging = (on) => body.setAttribute("data-dragging", String(on));
  addEventListener("dragenter", (e) => { if (![...(e.dataTransfer?.types || [])].includes("Files")) return; depth++; dragging(true); });
  addEventListener("dragleave", () => { depth = Math.max(0, depth - 1); if (!depth) dragging(false); });
  addEventListener("dragover", (e) => e.preventDefault());
  addEventListener("drop", (e) => { e.preventDefault(); depth = 0; dragging(false); target = 0; if (e.dataTransfer?.files) fill(e.dataTransfer.files); });

  const wrap = document.querySelector(".rb-apply-bar"), pill = wrap.querySelector(".rb-apply-bar__pill");
  const steps = Object.fromEntries([...wrap.querySelectorAll("[data-step]")].map((s) => [s.dataset.step, s]));
  const narrow = () => innerWidth < 768;
  const W = { up: () => 135, name: () => (narrow() ? 300 : 350), mail: () => (narrow() ? 300 : 350), send: () => 135 };
  let shown = false, step = "";
  const spin = window.gsap && !reduce ? gsap.to(".rb-apply-bar__spin", { rotate: 360, duration: 1, ease: "none", repeat: -1, paused: true }) : null;
  const go = (name) => {
    if (name === step) return;
    step = name;
    Object.values(steps).forEach((s) => s.classList.toggle("is-on", s === steps[name]));
    const s = M.spring(0.5, 0.3);
    if (window.gsap) gsap.to(pill, { width: W[name](), duration: reduce ? 0 : s.duration, ease: s.ease });
    if (spin) name === "up" ? spin.play() : spin.pause();
    steps[name].querySelector("input")?.focus({ preventScroll: true });
    if (window.gsap && !reduce) gsap.fromTo(steps[name], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.inOut" });
  };
  const bar = {
    update() {
      const n = cards.filter((c) => c.classList.contains("is-filled")).length;
      wrap.querySelector(".rb-apply-bar__count").textContent = `${n}/3`;
      if (n && !shown) {
        shown = true;
        const s = M.spring(0.4, 0.2);
        if (window.gsap) gsap.to(wrap, { bottom: 40, duration: reduce ? 0 : s.duration, ease: s.ease });
      }
      go(n < 3 ? "up" : step === "up" || !step ? "name" : step);
    },
  };
  steps.name.querySelector("input").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.value.trim()) go("mail"); });
  steps.mail.querySelector("input").addEventListener("keydown", (e) => { if (e.key === "Enter" && /@/.test(e.target.value)) go("send"); });
  steps.name.querySelector(".rb-apply-bar__go").addEventListener("click", () => steps.name.querySelector("input").value.trim() && go("mail"));
  steps.mail.querySelector(".rb-apply-bar__go").addEventListener("click", () => /@/.test(steps.mail.querySelector("input").value) && go("send"));
  // Send: a placeholder, so it sends nowhere and only changes the button text
  steps.send.querySelector("button").addEventListener("click", (e) => { e.currentTarget.textContent = "Sent"; });
})();
