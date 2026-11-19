// One photo strip set is joined with two more sets so one set flows per 20s, and on each scroll the speed changes in .3s to the scroll rate (|v| ÷ 200, 1.2~3x).
// Scrolling up reverses the flow, and after stopping it stays at the last speed (usually 1.2x) — exactly like the original from Studio. On narrow screens it is not tied to scroll and just flows
(() => {
  kfFx.register("velocity-flip-marquee", (el, { options, reduce, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || reduce) return;
    const dur = +(options.dur ?? 20), idle = +(options.idle ?? 1.2), div = +(options.div || 200), max = +(options.max ?? 3);
    const flip = options.flip !== "false", min = +(options.min ?? 769);
    let dir = options.dir === "right" ? -1 : 1;
    const clones = [track.cloneNode(true), track.cloneNode(true)];
    clones.forEach((c) => { c.setAttribute("data-fx-part", "clone"); c.setAttribute("aria-hidden", "true"); });
    track.after(...clones);
    const sets = [track, ...clones];
    const wide = innerWidth >= min;
    const tl = gsap.timeline({ repeat: -1, onReverseComplete() { this.totalTime(this.rawTime() + this.duration() * 10); } });
    tl.to(sets, { xPercent: -100 * dir, ease: "none", duration: dur });
    let st = null;
    if (wide) {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({
        ...(scroller && { scroller }),
        onUpdate: (self) => {
          const v = self.getVelocity(), a = Math.abs(v), nd = v < 0 ? -1 : 1;
          const speed = a > 10 ? Math.min(a / div, max) : idle;
          if (flip && nd !== dir) dir = nd;
          gsap.to(tl, { timeScale: dir * speed, duration: 0.3, overwrite: true });
        },
      });
    }
    return () => { st?.kill(); tl.kill(); gsap.killTweensOf(tl); clones.forEach((c) => c.remove()); gsap.set(track, { clearProps: "transform" }); };
  });
})();
