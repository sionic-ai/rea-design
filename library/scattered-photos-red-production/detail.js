// Work detail: header left · center columns come down from −20vh in .8s after .5s, and pressing Info brings the credits down from −20px in .4s as they turn on (pressing again lifts them in .2s and turns them off).
// Photos are dragged with jQuery UI draggable. As the red next-work panel scrolls (0→43%), the white title moves 50vh→0 and the photo rises 100vh→50vh (.2 per frame),
// On reaching the bottom or pressing the board, a white curtain and red title fill in over 1s, the photo rises to the center, then it moves on to the next work in 1.05s
(() => {
  const { reduce, ce } = window.snSite;
  gsap.registerPlugin(ScrollTrigger);
  const io = "0.215,0.61,0.355,1";

  if (!reduce) {
    gsap.from("[data-sn-drop]", { y: () => -0.2 * innerHeight, duration: 0.8, delay: 0.5, ease: ce(io, "power3.out") });
  }

  const credits = document.querySelector("[data-sn-credits]");
  let open = false;
  document.querySelector("[data-sn-info]")?.addEventListener("click", (e) => {
    open = !open;
    e.currentTarget.classList.toggle("is-on", open);
    gsap.killTweensOf(credits);
    if (open) {
      gsap.fromTo(credits, { y: -20 }, { y: 0, duration: reduce ? 0 : 0.4, ease: ce(io, "power3.out") });
      gsap.to(credits, { opacity: 1, duration: reduce ? 0 : 0.2, ease: "none" });
    } else {
      gsap.to(credits, { y: -20, opacity: 0, duration: reduce ? 0 : 0.2, ease: ce("0.55,0.085,0.68,0.53", "power2.in") });
    }
  });
  document.querySelector("[data-sn-sound]")?.addEventListener("click", (e) => e.currentTarget.classList.toggle("is-on"));

  if (window.jQuery?.fn.draggable) jQuery("[data-sn-drag]").draggable();
  addEventListener("beforeunload", () => scrollTo(0, 0));

  const next = document.querySelector("[data-sn-next]");
  const title = document.querySelector("[data-sn-next-title]");
  const img = document.querySelector("[data-sn-next-img]");
  const masks = document.querySelectorAll("[data-sn-next-mask]");
  let want = 0, at = 0, going = false;
  const st = ScrollTrigger.create({ trigger: next, start: "top bottom", end: "bottom top", onUpdate: (s) => { want = s.progress; } });
  want = at = st.progress;
  const lerp = (p, a, b, from, to) => from + (to - from) * Math.min(1, Math.max(0, (p - a) / (b - a)));
  const draw = () => {
    if (going) return;
    gsap.set(title, { y: lerp(at, 0, 0.43, 0.5, 0) * innerHeight });
    gsap.set(img, { y: lerp(at, 0.01, 0.43, 1, 0.5) * innerHeight });
  };
  const tick = () => {
    if (Math.abs(want - at) < 1e-4) return;
    at += (want - at) * (reduce ? 1 : 0.2);
    draw();
  };
  gsap.ticker.add(tick);
  draw();

  const go = (e) => {
    e?.preventDefault();
    if (going) return;
    going = true;
    document.documentElement.classList.add("sn-noscroll");
    const ease = ce("0.645,0.045,0.355,1", "power2.inOut");
    const d = reduce ? 0 : 1;
    gsap.to(img, { y: 0, duration: d, ease });
    gsap.to(masks, { height: () => innerHeight, duration: d, ease });
    gsap.timeline().set(title, { display: "none" }, reduce ? 0 : 0.5);
    setTimeout(() => { location.href = next.getAttribute("href"); }, 1050);
  };
  next.addEventListener("click", go);
  addEventListener("scroll", () => {
    if (scrollY + innerHeight > document.documentElement.scrollHeight - 0.1) go();
  }, { passive: true });
})();
