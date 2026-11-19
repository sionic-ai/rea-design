// Company info: screen-width capsule opening (1s power4.inOut) → scrolling down brings a black curtain (progress 0~.6), enlarged org chart view, show more for history and executives.
uSite.scene(({ capsule, reduce, lenis }) => {
  const cap = document.querySelector("[data-co-cap]");
  const cover = document.querySelector("[data-co-cover]");
  const st = { s: reduce ? 1 : 0 };
  const draw = () => {
    const w = cap.clientWidth, h = cap.clientHeight;
    // Capsule whose width is the screen width — on phone it’s a tall board, so keep the horizontal ratio and center it
    const ch = Math.min(h, w / capsule.ASPECT);
    cap.style.clipPath = capsule.poly(w / 2, h / 2, w * st.s, ch * st.s);
  };
  draw();
  gsap.to(st, { s: 1, duration: reduce ? 0 : 1, ease: "power4.inOut", delay: 0.2, onUpdate: draw });
  addEventListener("resize", draw);
  ScrollTrigger.create({
    trigger: "[data-co-clip]", start: "top top", end: "bottom bottom",
    onUpdate: (self) => (cover.style.opacity = gsap.utils.clamp(0, 1, self.progress / 0.6)),
  });

  const full = document.querySelector("[data-group-full]");
  full.querySelector(".co-full__in").append(document.querySelector(".co-chart").cloneNode(true));
  const setFull = (on) => {
    full.hidden = !on;
    on ? lenis?.stop() : lenis?.start();
    document.body.style.overflow = on ? "hidden" : "";
  };
  document.querySelector("[data-group-open]").addEventListener("click", () => setFull(true));
  document.querySelector("[data-group-close]").addEventListener("click", () => setFull(false));
  addEventListener("keydown", (e) => e.key === "Escape" && !full.hidden && setFull(false));

  const label = (btn, open) => (btn.querySelector(".u-btn__label").textContent = open ? "Hide" : "More");
  const hist = document.querySelector("[data-hist]");
  const histBtn = document.querySelector("[data-hist-btn]");
  histBtn.addEventListener("click", () => {
    const open = hist.classList.toggle("is-open");
    label(histBtn, open);
    if (open && !reduce) gsap.from(hist.querySelectorAll(".co-hist__more"), { opacity: 0, y: 16, duration: 0.6, ease: "power3.out", stagger: 0.05 });
    lenis?.resize();
    ScrollTrigger.refresh();
  });

  document.querySelectorAll("[data-member]").forEach((m) => {
    const rows = m.querySelector(".co-member__rows");
    const btn = m.querySelector("[data-member-btn]");
    let open = false;
    btn.addEventListener("click", () => {
      open = !open;
      label(btn, open);
      gsap.to(rows, {
        height: open ? "auto" : 0, opacity: open ? 1 : 0, duration: reduce ? 0 : 0.6, ease: "power3.inOut",
        onComplete: () => { lenis?.resize(); ScrollTrigger.refresh(); },
      });
    });
  });
});
