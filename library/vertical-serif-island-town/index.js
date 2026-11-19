// Home: when the opening screen clears (fx:end) the Hero opens · the video panel border is tied to scroll (first panel 400px) and peels off · vertical phrase cycling ·
// Video window (.6s expo.out) · news row hover (cover .6s power3.out, photo 1 → 1.05 over 1s) · related links drag strip
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  // Opening screen map (a line map instead of the original image): mainland coastline + island chain — the island to approach is (205, 162), the spot that the part’s x −.5125 · y −.54 points to
  const zoom = document.querySelector('.mk-opening [data-fx-part="zoom"]');
  if (zoom) zoom.innerHTML = `<rect width="400" height="300" style="fill: var(--kf-surface)"/>
    <path d="M0 0h400v40c-40 6-70 22-96 18s-50-20-82-14-54 30-90 26S30 40 0 52Z" style="fill: var(--kf-raised); stroke: var(--site-line)" stroke-width=".6"/>
    <g style="fill: var(--kf-dim)"><circle cx="190" cy="88" r="2.4"/><circle cx="196" cy="110" r="1.8"/><circle cx="199" cy="134" r="2"/><ellipse cx="205" cy="162" rx="1.6" ry="1.3"/><circle cx="214" cy="196" r="2.6"/><circle cx="222" cy="232" r="1.6"/></g>
    <path d="M60 30 C120 70 170 100 205 162" style="fill: none; stroke: var(--site-faint)" stroke-width=".5" stroke-dasharray="2 2"/>`;
  const isle = document.querySelector('.mk-opening [data-fx-part="island"]');
  if (isle) isle.innerHTML = `<path d="M150 170c10-26 34-44 58-46 22-2 40 12 46 30 4 14-6 28-24 34-26 8-58 6-74-2-6-3-8-9-6-16Z" style="fill: var(--kf-raised); stroke: var(--kf-ink-soft)" stroke-width=".8"/><path d="M196 140c4-4 10-5 14-1" style="fill: none; stroke: var(--kf-ink-soft)" stroke-width=".6"/>`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const open = () => { if (!root.classList.contains("is-loading")) return; root.classList.remove("is-loading"); root.dispatchEvent(new Event("mk:opened")); startMsgs(); };
  document.addEventListener("fx:end", open);
  if (reduce) requestAnimationFrame(open);

  const frame = document.querySelector("[data-ratio]");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: ".mk-hero__first", start: "top top", end: "bottom bottom", onUpdate: (s) => frame.style.setProperty("--ratio", s.progress.toFixed(4)) });
  });
  if (reduce) frame.style.setProperty("--ratio", "1");

  // Vertical text: on — blur 3px → 0 · transparent → 1 in 1s sine.inOut, text 60px below → 0 in 2s expo.out / off — blur 3px · transparent .6s sine.out, text −60px .75s sine.inOut
  const msgs = [...document.querySelectorAll(".mk-hero__msgs p")];
  let idx = -1, timer = 0;
  function show(i) {
    msgs.forEach((p, k) => {
      const t = p.querySelector("span");
      if (k === i) {
        gsap.set(p, { opacity: 0, filter: "blur(3px)" });
        gsap.set(t, { y: 60 });
        gsap.to(p, { overwrite: true, opacity: 1, filter: "blur(0px)", duration: 1, ease: "sine.inOut" });
        gsap.to(t, { overwrite: true, y: 0, duration: 2, ease: "expo.out" });
      } else if (k === idx) {
        gsap.to(p, { overwrite: true, opacity: 0, filter: "blur(3px)", duration: 0.6, ease: "sine.out" });
        gsap.to(t, { overwrite: true, y: -60, duration: 0.75, ease: "sine.inOut" });
      }
    });
    idx = i;
  }
  function startMsgs() {
    if (!msgs.length || timer) return;
    if (reduce) { gsap.set(msgs[0], { opacity: 1 }); return; }
    show(0);
    timer = setInterval(() => show((idx + 1) % msgs.length), 4000);
  }

  // Video window
  const modal = document.querySelector(".mk-modal");
  const stalker = document.querySelector(".mk-stalker");
  if (modal && stalker) {
    const vid = modal.querySelector("video");
    stalker.addEventListener("click", (e) => {
      e.preventDefault();
      modal.hidden = false;
      root.classList.add("is-lock");
      gsap.to(modal, { opacity: 1, duration: 0.6, ease: "expo.out", onComplete: () => { vid.currentTime = 0; vid.play().catch(() => {}); } });
    });
    const close = () => {
      vid.pause();
      gsap.to(modal, { opacity: 0, duration: 0.6, ease: "expo.out", onComplete: () => { modal.hidden = true; root.classList.remove("is-lock"); } });
    };
    modal.querySelector(".mk-modal__close").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  }

})();
