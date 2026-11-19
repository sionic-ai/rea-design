// About brand cell: original loop kept as is — logo draws (holds 2.5s) → tagline dots and letters switch on at random (1.75s) → name rises (1.75s) → back to the logo.
// If a cell is within 30px of the top or bottom of the screen it spins from the start, and when it leaves it stops and spins as a resting image.
(() => {
  const d = document.querySelector(".ab-brand__design");
  if (!d || TN.reduced) return;
  const logo = d.querySelector(".ab-brand__logo"), tag = d.querySelector(".ab-brand__tag"), names = d.querySelector(".ab-brand__names");
  const parts = [logo, tag, names];
  const replay = (el, before) => { el.classList.remove("is-play"); requestAnimationFrame(() => requestAnimationFrame(() => { before?.(); el.classList.add("is-play"); })); };
  // Original: dots turn on .25 + .5·random + .6·random seconds late, letters turn on .25 + t/2 seconds late, where t is a shuffled value from 0 to .5
  const shuffleTag = () => {
    tag.querySelectorAll(".circle").forEach((c) => (c.style.animationDelay = `${0.6 * Math.random() + 0.25 + 0.5 * Math.random()}s`));
    const t = [0, 0.1, 0.2, 0.3, 0.4, 0.5].sort(() => Math.random() - 0.5);
    tag.querySelectorAll(".letter").forEach((l, i) => (l.style.animationDelay = `${t[i] + 0.25 + t[i] / 2}s`));
  };
  let step = 0, timer = null;
  const tick = () => {
    let wait = 1750;
    if (step === 0) { replay(logo); wait = 2500; }
    else if (step === 1) replay(tag, shuffleTag);
    else replay(names);
    step = (step + 1) % 3;
    timer = setTimeout(tick, wait);
  };
  const stop = () => { clearTimeout(timer); step = 0; parts.forEach((p) => p.classList.remove("is-play")); };
  const start = () => { stop(); tick(); };
  ScrollTrigger.create({ trigger: d, start: () => `top-=${TN.rpx(30)} bottom`, end: () => `bottom+=${TN.rpx(30)} top`, onEnter: start, onEnterBack: start, onLeave: stop, onLeaveBack: stop });
})();
