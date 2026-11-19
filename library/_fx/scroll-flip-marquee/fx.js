// Big text marquee — one set chained dup times to flow endlessly (one set length = speed × set width/screen width seconds, .25× and .5× below widths 479 and 991),
// Scrolling the page up makes it flow in reverse. While the panel passes the screen, the whole strip is tied to scroll from +scroll vw → −scroll vw, pushing once more.
(() => {
  kfFx.register("scroll-flip-marquee", (el, { options, reduce, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]'), set = el.querySelector('[data-fx-part="set"]');
    if (!track || !set || !window.ScrollTrigger) return;
    const speed = +options.speed || 15, drift = +(options.scroll ?? 10), dir = options.dir === "right" ? 1 : -1, dup = Math.max(0, Math.round(+(options.dup ?? 2)));
    track.style.marginLeft = `${-drift}%`;
    track.style.width = `${drift * 2 + 100}%`;
    const clones = [];
    for (let i = 0; i < dup; i++) { const c = set.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.append(c); clones.push(c); }
    if (reduce) return () => clones.forEach((c) => c.remove());
    const sets = [set, ...clones];
    const scale = innerWidth < 479 ? 0.25 : innerWidth < 991 ? 0.5 : 1;
    const dur = speed * (set.offsetWidth / innerWidth) * scale || speed;
    const loop = gsap.to(sets, { xPercent: -100, repeat: -1, duration: dur, ease: "linear" }).totalProgress(0.5);
    gsap.set(sets, { xPercent: dir === 1 ? 100 : -100 });
    loop.timeScale(dir);
    loop.play();
    el.setAttribute("data-marquee-state", "normal");
    const flip = ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: "bottom top", onUpdate: (s) => {
      const down = s.direction === 1;
      loop.timeScale(down ? -dir : dir);
      el.setAttribute("data-marquee-state", down ? "normal" : "inverted");
    } });
    const u = dir === -1 ? drift : -drift;
    const push = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "0% 100%", end: "100% 0%", scrub: 0 } }).fromTo(track, { x: `${u}vw` }, { x: `${-u}vw`, ease: "none" });
    return () => { loop.kill(); flip.kill(); push.scrollTrigger?.kill(); push.kill(); clones.forEach((c) => c.remove()); gsap.set([track, set], { clearProps: "transform,marginLeft,width" }); el.removeAttribute("data-marquee-state"); };
  });
})();
