// About — original KineticHero: the quoted sentence line rises from below (.9s power3.out .12), then the image and text follow. The word ”Victory” lights up one by one like steps inside a fixed line as you scroll.
(() => {
  const TW = window.TW, { q, qa } = TW;
  // Team name hover — the plate color resolves the skin variable to rgb and changes it with GSAP (css transitions blend with oklch through oklab, which differs from the original rgb curve)
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:var(${name})`;
    document.body.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const teamHover = () => {
    const sec = q(".tw-founders"), list = q(".tw-names"), follow = q(".tw-follow");
    if (!sec || !list || TW.mobile || !matchMedia("(hover: hover)").matches) return;
    gsap.registerPlugin(CustomEase);
    const ease = CustomEase.create("twOut", "0,0,0.2,1");
    const base = rgb("--kf-accent"), tone = rgb("--site-tone-1");
    const xTo = gsap.quickTo(follow, "x", { duration: 0.4, ease: "power3.out" }), yTo = gsap.quickTo(follow, "y", { duration: 0.4, ease: "power3.out" });
    const names = qa(".tw-name", list);
    let on = null;
    const paint = (c) => gsap.to(sec, { backgroundColor: c, duration: TW.reduce ? 0 : 0.7, ease, overwrite: "auto" });
    // The photo follows only when the pointer is over the name (it does not change position while hidden)
    const place = (e) => { xTo(e.clientX - follow.offsetWidth * 0.5); yTo(e.clientY - follow.offsetHeight * 0.5); };
    names.forEach((n) => n.addEventListener("mouseenter", (e) => {
      if (!on) { gsap.set(follow, { x: e.clientX - follow.offsetWidth * 0.5, y: e.clientY - follow.offsetHeight * 0.5 }); }
      on?.classList.remove("is-on");
      on = n; n.classList.add("is-on");
      list.classList.add("is-hovering");
      follow.classList.add("is-show");
      paint(tone);
    }));
    list.addEventListener("mouseleave", () => { on?.classList.remove("is-on"); on = null; list.classList.remove("is-hovering"); follow.classList.remove("is-show"); paint(base); });
    list.addEventListener("mousemove", place, { passive: true });
  };
  TW.start(() => {
    // The original KineticHero settles within .5s of opening — lines from below (.45s power3.out .05), image and text .25s after that
    TW.rise(qa(".tw-kinetic-t .tw-mask > span"), { duration: 0.95, stagger: 0.05 });
    if (!TW.reduce) gsap.from(".tw-kinetic-art", { autoAlpha: 0, y: 8, duration: 0.45, ease: "power3.out", delay: 0.2 });
    teamHover();
    const ws = qa(".tw-stack-w");
    ws.forEach((w, k) => w.style.setProperty("--k", k));
    if (TW.reduce) { gsap.set(ws, { opacity: 1 }); return; }
    gsap.timeline({ scrollTrigger: { trigger: ".tw-stack", start: "top top", end: "bottom bottom", scrub: 0.9 } })
      .to(ws, { opacity: 1, duration: 0.2, stagger: 0.25, ease: "power2.out" })
      .from(".tw-stack-b", { autoAlpha: 0, x: 40, duration: 0.6, ease: "power3.out" }, ">-0.2");
    // Slides are the same type as the first page — the second one covers from below with clip
    qa(".tw-slides").forEach((wrap) => {
      const ss = qa(".tw-slide", wrap);
      if (ss.length < 2) return;
      const stage = document.createElement("div");
      stage.style.cssText = "position:sticky;top:0;height:100vh;overflow:hidden";
      wrap.prepend(stage);
      gsap.set(wrap, { height: `${100 + 115 * (ss.length - 1)}vh` });
      ss.forEach((s, i) => { stage.append(s); gsap.set(s, { position: "absolute", top: 0, left: 0, width: "100%", zIndex: i }); if (i) gsap.set(s, { clipPath: "inset(100% 0 0 0)" }); });
      const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: 0.9 } });
      ss.forEach((s, i) => { if (i) tl.to(s, { clipPath: "inset(0% 0 0 0)", ease: "power3.in", duration: 1 }, i - 1); });
    });
  });
})();
