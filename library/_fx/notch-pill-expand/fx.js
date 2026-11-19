// Notch pill: each press moves to the next state (rest → recording collapsed → recording expanded → rest) — the current content blurs, shrinks and exits (.3s),
// The pill resizes to fit new content in .45s, growing or shrinking, and the new content sharpens in .2s later from 10px blur and .7x. The timer counts from the first press.
(() => {
  kfFx.register("notch-pill-expand", (el, { options, reduce }) => {
    const pill = el.querySelector('[data-fx-part="pill"]') || el;
    const states = [...el.querySelectorAll('[data-fx-part="state"]')];
    if (!window.gsap || states.length < 2) return;
    const dur = +(options.dur ?? 0.3), lag = +(options.lag ?? 0.2), size = +(options.size ?? 0.45);
    const ease = kfFx.ease(options.ease || "0.42,0,0.58,1", "sine.inOut");
    const sizeEase = kfFx.ease(options["size-ease"] || "0.4,0,0.1,1", "power3.out");
    const hidden = { filter: "blur(10px)", scale: 0.7, opacity: 0 };
    let cur = 0, busy = false, started = 0, tick = 0;
    states.forEach((s, i) => { s.hidden = i !== 0; });
    const timers = () => el.querySelectorAll('[data-fx-part="timer"]');
    const count = () => {
      const s = Math.floor((Date.now() - started) / 1000);
      timers().forEach((t) => (t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`));
    };
    const show = (next) => {
      const from = states[cur], to = states[next];
      const box = pill.getBoundingClientRect();
      // A rest state (an empty slot that only takes up space) drops out immediately without motion — the original’s slot isn’t a motion element either
      const plain = (s) => s.dataset.state === "none";
      const swap = () => {
        from.hidden = true;
        gsap.set(from, { clearProps: "filter,opacity,transform" });
        to.hidden = false;
        if (!plain(to)) gsap.set(to, hidden);
        gsap.set(pill, { width: "auto", height: "auto" });
        const end = pill.getBoundingClientRect();
        gsap.fromTo(pill, { width: box.width, height: box.height }, { width: end.width, height: end.height, duration: reduce ? 0 : size, ease: sizeEase, onComplete: () => gsap.set(pill, { clearProps: "width,height" }) });
        if (!plain(to)) gsap.to(to, { filter: "blur(0px)", scale: 1, opacity: 1, duration: reduce ? 0 : dur, delay: reduce ? 0 : lag, ease, onComplete: () => { busy = false; } });
        else busy = false;
        cur = next;
      };
      if (plain(from) || reduce) swap();
      else gsap.to(from, { ...hidden, duration: dur, ease, onComplete: swap });
    };
    const click = () => {
      if (busy) return;
      busy = true;
      const next = (cur + 1) % states.length;
      if (!started && states[next].dataset.state !== "none") {
        started = Date.now();
        tick = setInterval(count, 1000);
        count();
      }
      if (states[next].dataset.state === "none") { clearInterval(tick); started = 0; tick = 0; }
      el.classList.toggle("is-fx-on", states[next].dataset.state !== "none");
      show(next);
    };
    pill.addEventListener("click", click);
    return () => {
      pill.removeEventListener("click", click);
      clearInterval(tick);
      gsap.killTweensOf([pill, ...states]);
      gsap.set([pill, ...states], { clearProps: "all" });
      states.forEach((s, i) => { s.hidden = i !== 0; });
      el.classList.remove("is-fx-on");
    };
  });
})();
