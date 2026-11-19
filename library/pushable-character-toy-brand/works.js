// Game: on the expand button or wheel down, the character squashes over .16s (1.15 × .5), shoots up 600px over .24s power4.in, and the stage covers the screen over .45s power2.inOut while
// The menu moves up (.35s), the view-type buttons turn on, and the cover stage comes to screen center and unfolds in an arc. Scroll the wheel up to reverse. For the view-type buttons, a pill slides into the chosen slot
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const D = (t) => (reduce ? 0 : t);
  const body = document.body;
  const fig = document.querySelector(".mw-figure__box"), backdrop = document.querySelector(".mw-backdrop"), nav = document.querySelector(".mw-nav");
  const seg = document.querySelector(".mw-seg"), scene = document.querySelector(".mw-scene"), dots = document.querySelector(".mw-dots");
  const btn = document.querySelector(".mw-expand");
  if (!backdrop || !scene) return;
  let open = false, busy = false, mode = 2;
  const LOOK = { 0: "arc", 2: "balls", 4: "ring" };
  // The expanded stage background measures a color made from the skin and changes it with GSAP over the same .45s (original rgba(18,22,26,.97))
  const darkBg = () => { const t = document.createElement("i"); t.style.background = "color-mix(in srgb, var(--kf-contrast-bg) 97%, transparent)"; document.body.append(t); const c = getComputedStyle(t).backgroundColor; t.remove(); return c; };
  const phone = () => innerWidth < 768;
  const expand = () => {
    if (open || busy) return;
    busy = true; open = true;
    const tl = gsap.timeline({ onComplete: () => (busy = false) });
    tl.to(fig, { scaleY: 0.5, scaleX: 1.15, transformOrigin: "center bottom", duration: D(0.16), ease: "power2.out" })
      .to(fig, { y: -600, opacity: 0, scaleY: 1.2, scaleX: 0.9, duration: D(0.24), ease: "power4.in" })
      .to(backdrop, { top: 0, width: "100vw", maxWidth: "100vw", height: "100vh", borderRadius: 0, backgroundColor: darkBg(), duration: D(0.45), ease: "power2.inOut" })
      .to(nav, { top: 35, duration: D(0.35), ease: "power2.out", onStart: () => body.classList.add("is-expanded") }, "-=0.18")
      .to(seg, { autoAlpha: 1, duration: D(0.35), ease: "power2.out" }, "-=0.2")
      .to(scene, { top: "54%", yPercent: -50, width: "100vw", maxWidth: "100vw", duration: D(0.4), ease: "power2.out",
        onStart: () => { pick(mode); scene.dispatchEvent(new CustomEvent("fx:layout", { detail: LOOK[mode] || "balls" })); },
        onComplete: () => body.classList.add("show-footer") }, "-=0.3");
  };
  const collapse = () => {
    if (!open || busy) return;
    busy = true; open = false;
    body.classList.remove("is-expanded", "show-footer");
    const m = phone();
    const tl = gsap.timeline({ onComplete: () => { busy = false; gsap.set([backdrop, scene, nav], { clearProps: "all" }); } });
    tl.to(seg, { autoAlpha: 0, duration: D(0.2) }, 0)
      .to(scene, { top: m ? 360 : 560, yPercent: 0, width: 800, maxWidth: "90vw", duration: D(0.4), ease: "power2.out", onStart: () => scene.dispatchEvent(new CustomEvent("fx:layout", { detail: "fan" })) }, 0)
      .to(nav, { top: m ? 325 : 535, duration: D(0.35), ease: "power2.out" }, 0)
      .to(backdrop, { top: m ? 310 : 500, width: 800, maxWidth: "90vw", height: m ? innerHeight - 310 : 500, borderRadius: 10, duration: D(0.45), ease: "power2.inOut" }, 0)
      .fromTo(fig, { y: -600, opacity: 0, scaleX: 1, scaleY: 1 }, { y: 0, opacity: 1, duration: D(0.6), ease: "back.out(1.6)", clearProps: "transform" }, 0.25);
  };
  btn?.addEventListener("click", expand);
  btn?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); expand(); } });
  addEventListener("wheel", (e) => {
    if (busy) return;
    if (!open && e.deltaY > 10) expand();
    else if (open && e.deltaY < -10) collapse();
  }, { passive: true });
  addEventListener("keydown", (e) => { if (e.key === "Escape") collapse(); });

  // Type buttons — initially button 0 is on, and when expanded the pill moves in .35s to the remembered type (the original’s initial value 2, Bouncing Ball)
  const pill = document.querySelector(".mw-seg__pill"), segs = [...document.querySelectorAll(".mw-seg__btn")];
  function pick(i) {
    segs.forEach((x, k) => x.classList.toggle("is-active", k === i));
    if (pill) gsap.to(pill, { x: i * 44, duration: D(0.35), ease: "power2.out" });
  }
  segs.forEach((b, i) => b.addEventListener("click", () => {
    if (LOOK[i]) mode = i;
    pick(i);
    // Type 0 arc carousel · 2 bouncing ball · 4 elliptical ring — 1 cloud·3 balloon don’t exist yet (meta gaps)
    if (open && innerWidth >= 768 && LOOK[i]) scene.dispatchEvent(new CustomEvent("fx:layout", { detail: LOOK[i] }));
  }));
  backdrop.parentElement.addEventListener("mousemove", (e) => {
    if (!dots) return;
    const r = dots.getBoundingClientRect();
    dots.style.setProperty("--mx", `${e.clientX - r.left}px`);
    dots.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
})();
