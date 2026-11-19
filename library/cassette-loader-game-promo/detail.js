// Character detail — original characterPage. The device lands from 200px to the right at a random height and angle in 1s circ.out (.6 late),
// Then the card enters over .6s circ.inOut, group and name settle in a shuffle, two intro strips grow from 0 → 100% width (.5 · .4 delayed by .4), and the thumbnail column slides in from the side over .5s.
// ZOOM: the lime cover unfolds with skewX 20→0 and the image appears at .3s. VOICE only toggles the play state (audio file slot).
(() => {
  const ET = window.ET;
  const { mode, reduce, rand, shuffle } = ET;
  const pc = mode === "pc";
  const $ = (s) => document.querySelector(s);

  ET.linkMarquee();
  if (!reduce) {
    gsap.set(".dt-device__inner, .dt-device__card, .dt-device__prev, .dt-device__next, .dt-local, .dt__team, .dt__name, .dt-screen__tags span", { opacity: 0 });
  }

  const show = () => {
    if (reduce) return;
    const e = 0.6, t = pc ? rand(-50, 50) : rand(-50, 150), o = pc ? rand(-10, 10) : rand(10, 20);
    gsap.fromTo(".dt-device__inner", { x: 200, y: t, rotate: o, opacity: 0 }, { delay: e, x: 0, y: 0, rotate: 0, opacity: 1, duration: 1, ease: "circ.out" });
    gsap.fromTo(".dt-device__card", { x: pc ? 80 : 2, y: pc ? 15 : -15, opacity: 1 }, { delay: e + 0.6, x: 0, y: 0, opacity: 1, duration: 0.6, ease: "circ.inOut", onComplete: () => {
      gsap.set(".dt__team, .dt__name", { opacity: 1 });
      shuffle(".dt__team-name", 1000);
      shuffle(".dt__name-en > span", 1000);
      const tags = document.querySelectorAll(".dt-screen__tags span");
      gsap.set(tags, { opacity: 1 });
      gsap.fromTo(tags[0], { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "circ.out" });
      gsap.fromTo(tags[1], { clipPath: "inset(0 100% 0 0)" }, { delay: 0.4, clipPath: "inset(0 0% 0 0)", duration: 0.4, ease: "circ.out" });
      if (pc) gsap.fromTo(".dt-local", { x: 50, opacity: 0 }, { delay: 0.5, x: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
      else gsap.set(".dt-local", { opacity: 1 });
      gsap.fromTo(".dt-device__prev", { x: -20, opacity: 0 }, { delay: 0.5, x: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
      gsap.fromTo(".dt-device__next", { x: 20, opacity: 0 }, { delay: 0.5, x: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
    } });
  };

  // Zoom
  const zoom = $(".dt-zoom");
  let zoomReady = false;
  $(".dt-btn.is-zoom a").addEventListener("click", (e) => {
    e.preventDefault();
    zoom.hidden = false;
    if (reduce) { zoomReady = true; return; }
    gsap.fromTo(".dt-zoom__bg", { scaleX: 0, skewX: 20 }, { scaleX: 1, skewX: 0, duration: 0.6, ease: "circ.inOut" });
    gsap.fromTo(".dt-zoom__visual", { opacity: 0, y: 20 }, { delay: 0.6, opacity: 1, y: 0, duration: 0.3, ease: "power3.out", onComplete: () => { zoomReady = true; } });
  });
  zoom.addEventListener("click", (e) => {
    e.preventDefault();
    if (!zoomReady) return;
    if (reduce) { zoom.hidden = true; zoomReady = false; return; }
    gsap.to(".dt-zoom__visual", { opacity: 0, duration: 0.2, ease: "power3.out" });
    gsap.to(".dt-zoom__bg", { delay: 0.2, scaleX: 0, skewX: 20, duration: 0.4, ease: "circ.inOut", onComplete: () => {
      gsap.set(".dt-zoom__visual, .dt-zoom__bg", { clearProps: "all" });
      zoom.hidden = true;
      zoomReady = false;
    } });
  });
  // Voice button — the original plays a sound file and turns off at the end. As this is a sound placeholder, it just turns the state on for 3 seconds
  let voiceTimer;
  $(".dt-btn.is-voice a").addEventListener("click", (e) => {
    e.preventDefault();
    const b = $(".dt-btn.is-voice");
    clearTimeout(voiceTimer);
    if (b.classList.toggle("is-playing")) voiceTimer = setTimeout(() => b.classList.remove("is-playing"), 3000);
  });

  // Original scales the 1920 version by the window width ratio — this copy is based on the 1440 version
  const fit = () => { $("#detailDevice").style.scale = pc ? String(Math.min(1, innerWidth / 1440)) : ""; };
  fit();
  addEventListener("resize", fit);

  ET.startSub();
  show();
})();
