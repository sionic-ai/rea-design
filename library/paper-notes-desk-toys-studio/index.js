// First page — Hero entrance (head name → big title → video → ＋ · contact buttons), the video flows up by the panel scroll amount while the title stays fixed,
// Parallax with the title lagging 28px and the video 12px following mouse height, a box that grows to the screen center when the video is clicked, and city clocks
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const wide = matchMedia("(min-width: 769px)");
  const view = document.querySelector(".ps-view");
  const hero = document.querySelector(".ix-hero");
  const copy = document.querySelector(".ix-hero__copy");
  const shift = document.querySelector(".ix-hero__shift");
  const scroller = document.querySelector(".ix-hero__scroll");
  const media = document.querySelector(".ix-hero__media");
  const brand = document.querySelector(".ps-crumb");
  const chrome = [document.querySelector(".ps-menu-btn"), document.querySelector(".ps-cta")].filter(Boolean);
  document.documentElement.classList.add("is-ready");

  // ── Entrance: power2.out — header name rises from 48px below in .25s, title from 110px below in .5s after .37s, video from below the screen bottom in .75s after .06s, then the ＋·Contact buttons drop from above in .25s (.05s apart)
  // If the first-page entrance was already seen in this window (original isHomeHeaderReady), the header name · buttons stay as they are and only the title · video rise. Starts at .32s as the curtain lifts
  const inner = sessionStorage.getItem("ps-home-ready") === "1";
  if (!reduce) {
    const mediaFrom = wide.matches ? Math.max(120, view.getBoundingClientRect().bottom - media.getBoundingClientRect().top) : 120;
    if (!inner) { gsap.set(brand, { autoAlpha: 0, y: 48 }); gsap.set(chrome, { autoAlpha: 0, y: -48 }); }
    gsap.set(copy, { autoAlpha: 0, y: 110 });
    gsap.set(media, { autoAlpha: 0, y: mediaFrom });
    const tl = gsap.timeline({ defaults: { ease: "power2.out" }, delay: 0.32, onComplete: () => { sessionStorage.setItem("ps-home-ready", "1"); gsap.set([brand, copy, media, ...chrome], { clearProps: "opacity,visibility,transform" }); } });
    let c = 0;
    if (!inner) { tl.to(brand, { autoAlpha: 1, y: 0, duration: 0.25 }, c); c += 0.37; }
    tl.to(copy, { autoAlpha: 1, y: 0, duration: 0.5 }, c);
    if (wide.matches) { tl.to(media, { autoAlpha: 1, y: 0, duration: 0.75 }, c + 0.06); c += 0.81; }
    else { c += 0.5; tl.to(media, { autoAlpha: 1, y: 0, duration: 0.75 }, c); c += 0.75; }
    if (!inner) tl.to(chrome, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.05 }, c);
  }

  // ── Wide screens: the first screen stays sticky and only the video flows upward by the panel scroll amount
  const follow = () => { if (wide.matches) gsap.set(scroller, { y: -view.scrollTop }); else gsap.set(scroller, { clearProps: "transform" }); };
  view.addEventListener("scroll", follow, { passive: true });
  wide.addEventListener("change", follow);
  follow();

  // ── Once the first sheet covers the panel, hide the first screen (so the empty background between sheets doesn’t show through)
  ScrollTrigger.create({ trigger: ".ix-mission", start: "top top", onEnter: () => hero.classList.add("is-covered"), onLeaveBack: () => hero.classList.remove("is-covered") });

  // ── Mouse height parallax: t = Cursor y / screen height × 2 − 1, heading 28t (.55s) · video 12t (.9s) power3.out
  if (fine && !reduce) {
    const qCopy = gsap.quickTo(shift, "y", { duration: 0.55, ease: "power3.out" });
    const qMedia = gsap.quickTo(media, "y", { duration: 0.9, ease: "power3.out" });
    hero.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse" || lightboxOpen) return; const t = (e.clientY / innerHeight) * 2 - 1; qCopy(28 * t); qMedia(12 * t); });
    hero.addEventListener("pointerleave", () => { qCopy(0); qMedia(0); });
  }

  // ── Video box: pressing it grows to screen center (.85s power3.inOut), the title · header line · cover panel disappear and a white veil spreads. Press again or Esc to return in place
  let lightboxOpen = false, lbTl = null;
  const box = document.createElement("div");
  box.className = "ix-lightbox";
  box.innerHTML = '<div class="ix-lightbox__back"></div>';
  document.body.append(box);
  const fades = () => [copy, document.querySelector(".ix-layer"), document.querySelector(".ps-head")].filter(Boolean);
  const openBox = () => {
    if (lightboxOpen) return;
    lightboxOpen = true;
    const r = media.getBoundingClientRect();
    const stageW = Math.min(innerWidth * (wide.matches ? 0.8 : 1), 1440) - (wide.matches ? 24 : 0);
    const stageH = Math.min(innerHeight * (wide.matches ? 0.78 : 1), innerHeight) - (wide.matches ? 40 : 0);
    const scale = wide.matches ? Math.min(stageW / r.width, stageH / r.height) : Math.max(innerWidth / r.width, innerHeight / r.height);
    const dx = innerWidth / 2 - (r.left + r.width / 2), dy = innerHeight / 2 - (wide.matches ? innerHeight * 0.01 : 0) - (r.top + r.height / 2);
    view.style.overflow = "hidden";
    // The hero is a sticky layer inside the panel, so for the video in it to rise above the pinned curtain, the whole hero layer must be raised.
    hero.style.zIndex = "62";
    box.classList.add("is-open");
    lbTl?.kill();
    lbTl = gsap.timeline({ defaults: { duration: reduce ? 0 : 0.85, ease: "power3.inOut" } })
      .to(media, { x: dx, y: dy, scale, zIndex: 61 }, 0)
      .to(fades(), { autoAlpha: 0 }, 0)
      .to(box.firstChild, { opacity: 1 }, 0);
    media.setAttribute("aria-expanded", "true");
  };
  const closeBox = () => {
    if (!lightboxOpen) return;
    lightboxOpen = false;
    lbTl?.kill();
    lbTl = gsap.timeline({ defaults: { duration: reduce ? 0 : 0.85, ease: "power3.inOut" }, onComplete: () => { box.classList.remove("is-open"); view.style.overflow = ""; hero.style.zIndex = ""; gsap.set(media, { clearProps: "zIndex,scale,x" }); } })
      .to(media, { x: 0, y: 0, scale: 1 }, 0)
      .to(fades(), { autoAlpha: 1 }, 0)
      .to(box.firstChild, { opacity: 0 }, 0);
    media.setAttribute("aria-expanded", "false");
  };
  media.setAttribute("aria-expanded", "false");
  media.addEventListener("click", () => (lightboxOpen ? closeBox() : openBox()));
  box.addEventListener("click", closeBox);
  addEventListener("keydown", (e) => e.key === "Escape" && closeBox());

  // ── City clocks: that city’s local time, second hand one turn per 60s. Pressing a city name or clock fills that clock with the accent color and the yellow panel becomes a pressed shadow
  const clocks = [...document.querySelectorAll(".ix-tz")];
  const cities = [...document.querySelectorAll(".ix-cities button")];
  const card = document.querySelector(".ix-card--clocks");
  const tick = () => {
    const now = new Date(), utc = now.getTime() + now.getTimezoneOffset() * 60000;
    for (const c of clocks) {
      const d = new Date(utc + +c.dataset.zone * 3600000);
      const s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
      c.querySelector(".ix-tz__hand--h").style.transform = `rotate(${h * 30}deg)`;
      c.querySelector(".ix-tz__hand--m").style.transform = `rotate(${m * 6}deg)`;
    }
  };
  // The second hand is a 60s-per-turn CSS rotation like the original — only the start position is set to the current second. Hour·minute hands update every 30 seconds
  const now0 = new Date();
  clocks.forEach((c) => c.querySelector(".ix-tz__hand--s").style.setProperty("--sec", `${now0.getSeconds() + now0.getMilliseconds() / 1000}s`));
  tick();
  setInterval(tick, 30000);
  let active = null;
  const pick = (i) => {
    active = active === i ? null : i;
    clocks.forEach((c) => c.classList.toggle("is-active", c.dataset.city === String(active)));
    cities.forEach((c) => c.classList.toggle("is-active", c.dataset.city === String(active)));
    card?.classList.toggle("is-active", active !== null);
  };
  [...clocks, ...cities].forEach((b) => b.addEventListener("click", () => pick(b.dataset.city)));
})();
