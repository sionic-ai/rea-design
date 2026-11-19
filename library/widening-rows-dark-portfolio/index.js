// Hero — only on the first open in a tab, the loader counts 000→100 in 1.8s (power3.inOut) and the curtain lifts up in 1.1s, and the hero rises as the lifting begins.
// Hero: letters rise from 115% below at .022s intervals over 1.4s, the rolling word follows .12s and the pill photo .18s later, and the lines below float up from .6s (all expo.out)
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;
  const pre = document.querySelector(".sb-preloader");
  if (reduce) { root.classList.remove("is-loading"); return; }
  const chars = [];
  hero.querySelectorAll("[data-hero-line]").forEach((el) => chars.push(...SplitText.create(el, { type: "chars", charsClass: "char" }).chars));
  const fades = hero.querySelectorAll("[data-hero-fade]"), pills = hero.querySelectorAll("[data-pill]"), rot = hero.querySelectorAll("[data-rotate]");
  gsap.set(chars, { yPercent: 115 });
  gsap.set(fades, { opacity: 0, y: 16 });
  gsap.set([...pills, ...rot], { yPercent: 115 });
  const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
  tl.to(chars, { yPercent: 0, duration: 1.4, stagger: 0.022 })
    .to(rot, { yPercent: 0, duration: 1.4 }, 0.12)
    .to(pills, { yPercent: 0, duration: 1.4 }, 0.18)
    .to(fades, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.6);

  const bg = hero.querySelector("[data-hero-bg]"), title = hero.querySelector("[data-hero-title]");
  if (bg) gsap.to(bg, { yPercent: 18, scale: 1.08, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  if (title) gsap.to(title, { yPercent: -20, opacity: 0.2, ease: "none", scrollTrigger: { trigger: hero, start: "center center", end: "bottom top", scrub: true } });

  if (!pre || !root.classList.contains("is-loading")) { pre?.remove(); tl.play(0.1); return; }
  try { sessionStorage.setItem("sb-intro", "1"); } catch {}
  window.lenis?.stop();
  const count = pre.querySelector("[data-count]"), bar = pre.querySelector(".sb-preloader__bar span"), v = { v: 0 };
  gsap.timeline()
    .to(v, { v: 100, duration: 1.8, ease: "power3.inOut", onUpdate: () => { count.textContent = String(Math.round(v.v)).padStart(3, "0"); } })
    .to(bar, { scaleX: 1, duration: 1.8, ease: "power3.inOut" }, 0)
    .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut", onStart: () => tl.play(0), onComplete: () => { pre.remove(); root.classList.remove("is-loading"); window.lenis?.start(); } });
})();
