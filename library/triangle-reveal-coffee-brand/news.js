// News hero featured-news slider: outgoing photo y −40 · 1s, incoming photo 1.1 → 1.05 · y 40 .75s (.25s later), title x −10 .5s — same values as the first page’s scene change. Auto-advances every 6s
(() => {
  const hero = document.querySelector(".nw-hero");
  const media = [...hero.querySelectorAll(".nw-hero__media li")];
  const titles = [...hero.querySelectorAll(".nw-hero__titles li")];
  const thumbs = [...hero.querySelectorAll(".nw-thumbs button")];
  document.querySelectorAll(".nw-arr").forEach((a) => (a.innerHTML = window.DC.icons.arrowR));
  let at = 0, timer = null;
  const go = (n) => {
    n = (n + media.length) % media.length;
    if (n === at) return;
    const prev = at;
    at = n;
    [media, titles, thumbs].forEach((g) => g.forEach((el, i) => el.classList.toggle("is-on", i === n)));
    if (!window.DC.reduced) {
      gsap.fromTo(media[prev], { autoAlpha: 1, zIndex: 1 }, { autoAlpha: 0, y: -40, duration: 1, ease: "power2.inOut" });
      gsap.fromTo(titles[prev], { autoAlpha: 1 }, { autoAlpha: 0, x: 10, duration: .5, ease: "power2.inOut" });
      gsap.fromTo(media[n], { autoAlpha: 0, scale: 1.1, y: 40, zIndex: 2 }, { autoAlpha: 1, scale: 1.05, y: 0, duration: .75, delay: .25, ease: "power2.inOut" });
      gsap.fromTo(titles[n], { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: .5, delay: .25, ease: "power2.inOut" });
    }
    restart();
  };
  const restart = () => { timer?.kill(); if (!window.DC.reduced) timer = gsap.delayedCall(6, () => go(at + 1)); };
  thumbs.forEach((t, i) => t.addEventListener("click", () => go(i)));
  hero.querySelector(".nw-prev").addEventListener("click", () => go(at - 1));
  hero.querySelector(".nw-next").addEventListener("click", () => go(at + 1));
  // As in the original, it runs right away without waiting for the loader — it advances every 6s even under the loader curtain
  restart();

  document.querySelectorAll(".nw-filter button").forEach((b, _, all) => b.addEventListener("click", () => all.forEach((x) => x.classList.toggle("is-on", x === b))));
})();
