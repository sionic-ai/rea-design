// Hero: first video (3.37s) plays once → loops, and 2.5s after playback starts the text and header rise with .7s power1.out.
// Block the first wheel and touch, play the second video after .5s — when it ends the next text rises with 1s power2.out and scroll is released.
// The second section background and dot nav stay fixed until the top edge of the News section, past 20% of the second section the third video plays, and when returning to the top the first section stands again in .4s.
(() => {
  const html = document.documentElement;
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const sp = ZB.isSp();
  const pick = (box, kind) => q(`${box} .mv__movie.${kind}.${sp ? "sp-only" : "pc-only"}`);
  const sec1 = q(".mv__sec1"), body1 = q(".mv__sec1-body"), sec2 = q(".mv__sec2"), news = q('[data-slot="news"]');
  const kv1T = pick(".mv__kv1", "is-transition"), kv1L = pick(".mv__kv1", "is-loop");
  const kv2 = q(".mv__kv2"), kv2T = pick(".mv__kv2", "is-transition"), kv2L = pick(".mv__kv2", "is-loop");
  const kv3T = pick(".mv__kv3", "is-transition"), kv3L = pick(".mv__kv3", "is-loop");
  const dots = qa(".mv__dot"), lines = qa(".mv__line");
  const show = (v) => (v.style.display = "block");
  const hide = (v) => (v.style.display = "none");
  const play = (v) => v.play().catch(() => {});

  // The original reopens when crossing 768 — because the phone/wide-screen video and fixed values are decided once at the start
  let w0 = innerWidth;
  addEventListener("resize", () => {
    const w = innerWidth;
    if ((w0 < 768 && w >= 768) || (w0 >= 768 && w < 768)) location.reload();
    w0 = w;
  });

  const intro = [".mv__catch span", ".mv__title span", ".zb-head", ".zb-burger"];
  // If arriving from the same site, it stands without the first video (the original checks the referrer — opened as a file the address is empty, so it is treated as a skip)
  const internal = location.hostname ? document.referrer.includes(location.hostname) : sessionStorage.getItem("zbInternal") === "1";
  sessionStorage.removeItem("zbInternal");

  if (ZB.reduce) {
    html.classList.remove("is-locked");
    kv1T.classList.add("is-hidden");
    gsap.set(intro, { y: 0 });
    gsap.set(".mv__sec1", { display: "none" });
    show(kv2L);
    return;
  }

  if (internal) {
    kv1T.classList.add("is-hidden");
    play(kv1L);
    gsap.to(intro, { y: 0, duration: 0, ease: "power1.out" });
    gsap.to(".mv__navwrap", { opacity: 1, x: 0, duration: 0, ease: "power1.out" });
    gsap.to(".mv__hint", { opacity: 1, y: 0, duration: 0, ease: "power1.out" });
  } else {
    let started = false;
    const rise = () => {
      if (started) return;
      started = true;
      gsap.to(".mv__catch span", { y: 0, duration: 0.7, delay: 2.5, ease: "power1.out" });
      gsap.to(".mv__title span", { y: 0, duration: 0.7, delay: 2.5, ease: "power1.out" });
      gsap.to(".zb-head", { y: 0, duration: 0.7, delay: 2.5, ease: "power1.out" });
      gsap.to(".zb-burger", { y: 0, duration: 0.7, delay: 2.5, ease: "power1.out" });
      gsap.to(".mv__navwrap", { opacity: 1, x: 0, duration: 0.7, delay: 2.5, ease: "power1.out" });
      gsap.to(".mv__hint", { opacity: 1, y: 0, duration: 0.7, delay: 2.5, ease: "power1.out" });
    };
    kv1T.addEventListener("play", rise, { once: true });
    kv1T.addEventListener("ended", () => { kv1T.classList.add("is-hidden"); play(kv1L); }, { once: true });
    kv1T.play().catch(() => { rise(); kv1T.classList.add("is-hidden"); play(kv1L); });
  }

  // ── First wheel: block it and go to the second video ──
  let busy = false, running = false, opened = false;
  const gate = (e) => {
    if (html.classList.contains("is-menu-open") || busy) return;
    e.preventDefault();
    if (!running) {
      dots[0].classList.remove("is-on");
      dots[1].classList.add("is-on");
      gsap.to(lines[0], { "--zb-line": "100%", duration: 0.1, ease: "power1.out" });
      gsap.to(body1, { opacity: 0, duration: 0.1, ease: "power1.out" });
      gsap.to(sec1, { opacity: 0, duration: 0, ease: "power1.out", delay: 1, onComplete: () => (sec1.style.display = "none") });
      show(kv2T);
      running = true;
      setTimeout(() => play(kv2T), 500);
      kv2T.onended = () => {
        hide(kv2T);
        show(kv2L);
        play(kv2L);
        gsap.to(".mv__sec2-body", { y: "0%", opacity: 1, duration: 1, ease: "power2.out" });
        gsap.to(".mv__grad", { opacity: 1, duration: 1, ease: "power2.out" });
        html.classList.remove("is-locked");
        document.removeEventListener("touchmove", gate, { passive: false });
        document.removeEventListener("wheel", gate, { passive: false });
        busy = false;
        opened = true;
        running = false;
        ScrollTrigger.refresh();
      };
    }
    busy = true;
  };
  document.addEventListener("touchmove", gate, { passive: false });
  document.addEventListener("wheel", gate, { passive: false });

  // Past 20% of the second section, the third video starts
  let third = false;
  addEventListener("scroll", () => {
    if (third) return;
    if (scrollY >= sec2.offsetTop + 0.2 * sec2.offsetHeight) {
      third = true;
      hide(kv2);
      show(kv3T);
      play(kv3T);
      kv3T.onended = () => { hide(kv3T); show(kv3L); play(kv3L); };
    }
  }, { passive: true });

  // Back at the top, rebuild the first section and re-engage wheel blocking after 1 second
  let last = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (y < last && y <= 0 && opened) {
      dots[0].classList.add("is-on");
      dots[1].classList.remove("is-on");
      dots[2].classList.remove("is-on");
      lines.forEach((l) => l.style.setProperty("--zb-line", "0%"));
      kv2.style.display = "";
      show(kv2T);
      show(kv3T);
      third = false;
      opened = false;
      gsap.to(sec1, { opacity: 1, duration: 0.4, ease: "power1.out", onStart: () => { html.classList.add("is-locked"); sec1.style.display = "block"; } });
      setTimeout(() => {
        document.addEventListener("touchmove", gate, { passive: false });
        document.addEventListener("wheel", gate, { passive: false });
      }, 1000);
      gsap.to(body1, { opacity: 1, duration: 0.4, ease: "power1.out" });
    }
    last = y;
  }, { passive: true });

  ZB.mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: ".mv__bg", start: "top top", endTrigger: news, end: "top top", pin: true } });
    gsap.timeline({ scrollTrigger: { trigger: ".mv__navwrap", start: "top top", endTrigger: news, end: "top top", pin: true } });
    ScrollTrigger.create({
      trigger: sec2, start: "top top", end: "center top", scrub: true,
      onUpdate: (st) => {
        const t = 100 * st.progress;
        lines[1].style.setProperty("--zb-line", `${t}%`);
        dots[1].classList.toggle("is-on", t !== 100);
        dots[2].classList.toggle("is-on", t === 100);
      },
    });
    gsap.to(".mv__kv3", { y: "-20%", scrollTrigger: { trigger: news, start: "top bottom", end: "top top", scrub: true } });
    gsap.to(".mv__navwrap", { y: "-20%", scrollTrigger: { trigger: news, start: "top bottom", end: "top top", scrub: true } });
  });
})();
