/* Spanning several pages — page-turn curtain (.5s power3.out fill → next section 1s clear), menu press blink (.05s ×2), stippled greeting letters.
   Original stipple: sweep 120px lettering at 2px intervals for alpha > Where it is 128, place radius 1 dots at 2.5x spacing */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desk = () => innerWidth > 900;
  const block = document.querySelector(".bp-block");
  const bp = (window.bp = window.bp || {});

  // Entering section: the first visit to the first page is covered by the loading screen so lift right away, otherwise lift in 1s
  if (block) {
    if (reduce || !desk() || document.documentElement.dataset.intro === "on") gsap.set(block, { height: 0 });
    else {
      // Each section clears at a different length — Contact uses the original .8s power4.out, the rest 1s power3.out
      const [d, e] = (document.documentElement.dataset.wipe || "1 power3.out").split(" ");
      gsap.to(block, { height: 0, duration: +d, ease: e });
    }
  }
  bp.leave = (href) => {
    if (!block || !desk() || reduce) { location.href = href; return; }
    gsap.to(block, { height: "100vh", duration: 0.5, ease: "power3.out", onComplete: () => (location.href = href) });
  };
  const nav = document.querySelector(".bp-nav"), round = nav?.querySelector(".bp-nav__round");
  const place = (a) => { if (!round || !a) return; round.style.setProperty("--rl", `${a.offsetLeft}px`); round.style.setProperty("--rw", `${a.offsetWidth}px`); };
  // On pages with no active cell (404), fold the highlight when the pointer leaves
  const home = () => { const a = nav?.querySelector("a.active"); if (a) place(a); else round?.style.setProperty("--rw", "0px"); };
  nav?.querySelectorAll("a").forEach((a) => a.addEventListener("mouseenter", () => place(a)));
  nav?.addEventListener("mouseleave", home);
  (document.fonts?.ready || Promise.resolve()).then(home);
  document.querySelectorAll(".bp-nav a").forEach((a, i, all) => a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    e.preventDefault();
    if (a.classList.contains("active")) return;
    if (desk() && !reduce) gsap.from(a, { opacity: 0, duration: 0.05, repeat: 2, ease: "none" });
    all.forEach((x) => x.classList.toggle("active", x === a));
    home();
    bp.leave(href);
  }));

  // Stipple greeting text
  const say = document.querySelector(".bp-footer__say canvas");
  if (say) {
    const x = say.getContext("2d");
    say.width = 1000; say.height = 300;
    const text = say.dataset.text || "HELLO";
    const draw = () => {
      const cs = getComputedStyle(document.documentElement);
      const font = `500 120px ${cs.getPropertyValue("--kf-font-display")}`;
      const m = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      m.font = font;
      const w = Math.ceil(m.measureText(text).width) + 4;
      m.canvas.width = w; m.canvas.height = 130;
      m.font = font; m.fillStyle = "white"; m.fillText(text, 0, 112);
      const img = m.getImageData(0, 0, w, 130).data;
      x.clearRect(0, 0, 1000, 300);
      x.fillStyle = cs.getPropertyValue("--kf-dim").trim() || "gray";
      const ox = (1000 - 2.5 * w) / 2, oy = 150 - 180;
      for (let i = 0; i < w; i += 2) for (let j = 0; j < 130; j += 2) {
        if (img[4 * (j * w + i) + 3] > 128) { x.beginPath(); x.arc(2.5 * i + ox, 2.5 * j + oy, 1, 0, Math.PI * 2); x.fill(); }
      }
    };
    (document.fonts?.ready || Promise.resolve()).then(draw);
    const foot = document.querySelector(".bp-footer");
    const fit = () => { if (desk() && foot) foot.style.height = innerHeight + "px"; };
    fit(); addEventListener("resize", fit, { passive: true });
  }
})();
