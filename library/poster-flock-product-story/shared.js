/* Lenis · mobile menu · cookie bar · scroll ticks, plus split-text rise (section titles) · swapping words inside brackets — shared by all sections */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const burger = document.querySelector(".pm-burger"), mnav = document.querySelector(".pm-mnav");
  const setMenu = (on) => { mnav.classList.toggle("is-open", on); burger.setAttribute("aria-expanded", on); on ? lenis?.stop() : lenis?.start(); };
  burger?.addEventListener("click", () => setMenu(!mnav.classList.contains("is-open")));
  mnav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* Button build — lay down the background and outer frame, and if there is a trailing arrow, hide a second one in front. The background wobbles like jelly on hover and release */
  document.querySelectorAll(".pm-btn").forEach((b) => {
    const end = b.querySelector(".pm-arrow");
    const label = [...b.childNodes].map((n) => n.textContent).join("").trim();
    b.innerHTML = `<span class="pm-btn__frame" aria-hidden="true"><span class="pm-btn__skin"></span></span><span class="pm-btn__content">${end ? '<i class="pm-arrow is-start" aria-hidden="true"></i>' : ""}<span class="pm-btn__label">${label}</span>${end ? '<i class="pm-arrow is-end" aria-hidden="true"></i>' : ""}</span>`;
    const skin = b.querySelector(".pm-btn__skin"), frame = b.querySelector(".pm-btn__frame");
    /* Jelly (measured from the original): fills smoothly until 175ms, then wobbles with a period of 220ms · damping 10/s — background width +12px · height −4%.
       The outer Frame crop extends right at once on hover and left when you leave, trembling at 1/4 of the same tempo. Radius is half the button height */
    const bump = (t) => (t < 0 ? 0 : t < 0.175 ? (t / 0.175) ** 2 * (3 - 2 * (t / 0.175)) : Math.exp(-10 * (t - 0.175)) * Math.cos(28.6 * (t - 0.175)));
    let raf = 0;
    const jelly = (on) => {
      if (reduce) { frame.style.clipPath = on ? "inset(0 -10px 0 0 round 20px 32px 32px 20px)" : ""; return; }
      cancelAnimationFrame(raf);
      const w = b.offsetWidth, t0 = performance.now();
      const step = (now) => {
        const t = (now - t0) / 1000, x = bump(t), r = b.offsetHeight / 2, g = 1 + 0.25 * x;
        skin.style.width = `${w + 12 * x}px`;
        skin.style.transform = `scaleY(${1 - 0.04 * x})`;
        frame.style.clipPath = on
          ? `inset(0 ${-10 * g}px 0 0 round ${r}px ${1.6 * r * g}px ${1.6 * r * g}px ${r}px / ${r}px)`
          : `inset(0 ${-20 * g}px 0 ${-10 * g}px round ${1.6 * r * g}px ${r}px ${r}px ${1.6 * r * g}px / ${r}px)`;
        if (t < 0.55) raf = requestAnimationFrame(step);
        else { skin.style.width = ""; skin.style.transform = ""; }
      };
      raf = requestAnimationFrame(step);
    };
    b.addEventListener("mouseenter", () => jelly(true));
    b.addEventListener("mouseleave", () => jelly(false));
  });

  document.querySelectorAll("[data-consent-close]").forEach((b) => b.addEventListener("click", () => b.closest("[data-consent]").classList.add("is-gone")));
  /* Cookie settings — raise the closed bar again (.6s expo) */
  document.querySelectorAll("[data-consent-open]").forEach((b) => b.addEventListener("click", () => document.querySelector("[data-consent]")?.classList.remove("is-gone")));

  /* Internal links glide via Lenis (1.2s) */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    const y = t.closest("[data-story]") && t.dataset.at ? +t.dataset.at : null;
    if (lenis) lenis.scrollTo(y ?? t, { duration: 1.2 }); else (y !== null ? scrollTo(0, y) : t.scrollIntoView());
  });

  const nav = document.querySelector(".pm-nav");
  let lastY = scrollY;
  addEventListener("scroll", () => { const y = scrollY; if (Math.abs(y - lastY) > 4) { nav.classList.toggle("is-hidden", y > lastY && y > 120 && !mnav.classList.contains("is-open")); lastY = y; } }, { passive: true });

  const mark = document.querySelector("[data-ruler-mark]");
  const ruler = () => { if (!mark) return; const max = document.documentElement.scrollHeight - innerHeight; mark.style.top = `${(scrollY / Math.max(1, max)) * (innerHeight - 2)}px`; };
  addEventListener("scroll", ruler, { passive: true });
  ruler();

  /* Text splitting: each word is bundled as one block (inline-block) and each letter rises from below in .7s power3.out, with .025s between letters */
  const split = (el) => {
    if (el.dataset.splitDone) return el._chars;
    el.dataset.splitDone = "1";
    const st = new SplitText(el, { type: "words,chars", wordsClass: "pm-w", charsClass: "pm-c" });
    el._chars = st.chars;
    return st.chars;
  };
  const reveal = (el, on, opt = {}) => {
    const chars = split(el);
    gsap.killTweensOf(chars);
    if (reduce) { gsap.set(chars, { yPercent: 0, opacity: on ? 1 : 0 }); return; }
    if (on) gsap.fromTo(chars, { yPercent: 110, opacity: 0.001 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: opt.stagger ?? 0.025, ease: "power3.out", delay: opt.delay || 0 });
    else gsap.to(chars, { yPercent: -60, opacity: 0, duration: 0.45, stagger: 0.008, ease: "power2.in" });
  };

  /* Word in brackets: every 2.4s it moves to the next word — the outgoing text goes up, the incoming text comes from below */
  document.querySelectorAll("[data-swap]").forEach((el) => {
    const words = el.dataset.swap.split("|");
    let i = 0;
    if (reduce || words.length < 2) return;
    setInterval(() => {
      i = (i + 1) % words.length;
      gsap.to(el, { yPercent: -100, opacity: 0, duration: 0.35, ease: "power2.in", onComplete: () => {
        el.textContent = words[i];
        gsap.fromTo(el, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
      } });
    }, 2400);
  });

  /* Words inside the closing parentheses flow endlessly upward */
  document.querySelectorAll("[data-marquee]").forEach((m) => { if (!reduce) gsap.to(m.children, { yPercent: -100, duration: 1.6, ease: "power3.inOut", repeat: -1, repeatDelay: 1 }); });

  window.PM = { reduce, css, lenis, split, reveal };
})();
