/* Home only: first-visit frame, scroll hint fade-out, client logo vertical and horizontal flow */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const head = document.querySelector(".tw-head");
  const media = document.querySelector("[data-hero-media]");
  const title = document.querySelector(".tw-hero h1");

  // ── Client logos: three desktop rows flow endlessly vertically, three phone rows horizontally (secondsPerItem seconds per cell, direction flipped each row) ──
  const LOGOS = ["Client logo 1", "Client logo 2", "Client logo 3", "Client logo 4", "Client logo 5", "Client logo 6", "Client logo 7", "Client logo 8", "Client logo 9"];
  const tiles = (from, n) => Array.from({ length: n }, (_, i) => `<div class="tw-logo-tile"><span class="wf-logo">${LOGOS[(from + i) % LOGOS.length]}</span></div>`).join("");
  const cols = document.querySelector("[data-logo-cols]"), rows = document.querySelector("[data-logo-rows]");
  cols.innerHTML = [0, 1, 2].map((c) => `<div class="tw-logo-col"><div class="tw-logo-col__track" data-axis="y" data-count="10" ${c === 1 ? "data-reverse" : ""}><div class="tw-logo-col__copy">${tiles(c * 3, 10)}</div><div class="tw-logo-col__copy" aria-hidden="true">${tiles(c * 3, 10)}</div></div></div>`).join("");
  rows.innerHTML = [0, 1, 2].map((r) => `<div class="tw-logo-row"><div class="tw-logo-row__track" data-axis="x" data-count="6" ${r === 1 ? "data-reverse" : ""}><div class="tw-logo-row__copy">${tiles(r * 3, 6)}</div><div class="tw-logo-row__copy" aria-hidden="true">${tiles(r * 3, 6)}</div></div></div>`).join("");
  // Measured on the original, one vertical strip set (10 cells, 2320px) passes in about 45s
  const SECONDS_PER_ITEM = 4.5;
  document.querySelectorAll("[data-axis]").forEach((track) => {
    if (reduce) return;
    const axis = track.dataset.axis, back = track.hasAttribute("data-reverse"), count = +track.dataset.count;
    let tw = null;
    new ResizeObserver(() => {
      const p = tw?.progress() ?? 0;
      tw?.kill();
      const r = track.firstElementChild.getBoundingClientRect(), size = axis === "y" ? r.height : r.width;
      if (!size) return;
      tw = gsap.fromTo(track, { [axis]: back ? -size : 0 }, { [axis]: back ? 0 : -size, duration: SECONDS_PER_ITEM * count, ease: "none", repeat: -1, modifiers: { [axis]: gsap.utils.unitize(Math.round) } }).progress(p);
    }).observe(track);
  });

  // ── Scroll hint: disappears in .3s once the hero is scrolled up past 24px, and returns when scrolled back ──
  const cue = document.querySelector("[data-hero-scroll]");
  ScrollTrigger.create({
    trigger: ".tw-hero", start: "top top-=24",
    onEnter: () => gsap.to(cue, { autoAlpha: 0, duration: 0.3, ease: "power2.out" }),
    onLeaveBack: () => gsap.to(cue, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }),
  });

  // ── First-entry frame (once per session) ──
  if (!root.classList.contains("tw-intro-on")) return;
  try { sessionStorage.setItem("tw-intro-played", "1"); } catch {}
  title.dataset.delay = "2.75";
  const intro = document.querySelector(".tw-intro");
  const [t, b, l, r] = [".is-t", ".is-b", ".is-l", ".is-r"].map((s) => intro.querySelector(`.tw-intro__bar${s}`));
  const mark = intro.querySelector(".tw-intro__mark");
  const draws = intro.querySelectorAll(".tw-intro__draw");
  const lenis = () => window.twLenis;
  const H = innerHeight, W = innerWidth, win = (64 * H) / 100;
  gsap.set(head, { yPercent: -120 });
  gsap.set(media, { scale: Math.min(Math.max(0.64, (0.72 * win + 2) / W, (win + 2) / H), 1), transformOrigin: "50% 50%" });
  gsap.set([t, b], { scaleY: (H - (4 * H) / 100) / H });
  gsap.set([l, r], { scaleX: (W - 0.72 * win) / W });
  root.style.overflow = "hidden";
  requestAnimationFrame(() => lenis()?.stop());

  // After the mark draws for 1.7 seconds (Lottie in the original), the frame opens
  draws.forEach((p) => { const len = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut", delay: 0.2 }); });
  const done = () => {
    gsap.set(media, { clearProps: "transform,transformOrigin" });
    lenis()?.start();
    root.style.removeProperty("overflow");
    root.classList.remove("tw-intro-on");
    ScrollTrigger.refresh();
  };
  const tl = gsap.timeline({ delay: 2.1, onComplete: done });
  tl.to([t, b], { scaleY: (H - win) / H, duration: 0.8, ease: "power4.out" }, 0);
  tl.to(mark, { autoAlpha: 0, duration: 0.16 }, 0);
  tl.to([t, b], { scaleY: 0, duration: 1.1, ease: "power4.out" }, 1);
  tl.to([l, r], { scaleX: 0, duration: 1.1, ease: "power4.out" }, 1);
  tl.to(media, { scale: 1, duration: 1.1, ease: "power4.out" }, 0.95);
  tl.call(() => gsap.to(head, { yPercent: 0, duration: 0.65, ease: "power3.out", delay: 0.05, clearProps: "transform" }), null, 1.55);
})();
