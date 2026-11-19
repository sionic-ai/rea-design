// Things that run on every page — smooth scroll (Lenis lerp .1), loader veil, scroll stops while the menu is open, darken the menu button after passing the hero,
// Haze on the top-right quarter-circle photo, slow flow inside photo frames, and the current time on the Contact strip. The wide-board threshold is the original 814px
(() => {
  const BREAK = 814;
  const html = document.documentElement, body = document.body;
  const isHome = body.classList.contains("is-home");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // Paper grain — noise dots scattered on a 200px tile (drawn instead of using the original image file)
  const grain = document.createElement("canvas");
  grain.width = grain.height = 200;
  const g = grain.getContext("2d");
  g.fillStyle = getComputedStyle(html).getPropertyValue("--kf-ink").trim() || "black";
  for (let i = 0; i < 9000; i++) g.fillRect(Math.random() * 200 | 0, Math.random() * 200 | 0, 1 + (Math.random() * 2 | 0), 1);
  html.style.setProperty("--site-grain", `url(${grain.toDataURL()})`);

  // Loader — on the first page the logo goes from blur to sharp, rests 2s, then lifts in 1s. Once lifted, attach the hero slider and start the 6s progress
  const loader = document.querySelector(".dd-loader");
  const kv = document.querySelector("[data-kv]");
  const startKv = () => kv && kv.setAttribute("data-fx", "displace-swap-slider");
  if (isHome && loader && !reduce) gsap.to(".dd-loader__logo", { opacity: 1, filter: "blur(0px)", duration: 1, ease: "power4.out" });
  const lift = () => {
    if (!loader || reduce) { loader?.remove(); startKv(); return; }
    gsap.to(loader, { opacity: 0, delay: isHome ? 2 : 0, duration: 1, onComplete: () => { loader.remove(); startKv(); } });
  };
  if (document.readyState === "complete") lift(); else addEventListener("load", lift, { once: true });

  const lenis = reduce ? null : new Lenis({ lerp: 0.1, duration: 1 });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.ddLenis = lenis;

  // When the menu (warp-mask-menu) opens, scrolling stops, and it turns back on when closing ends
  document.addEventListener("fx:menu", (e) => {
    html.classList.toggle("menu-show", e.detail.open);
    if (e.detail.open) lenis?.stop(); else lenis?.start();
  });

  const burger = document.querySelector(".dd-burger");
  if (isHome && burger && kv) {
    ScrollTrigger.create({ trigger: kv, end: "bottom top+=52", onLeave: () => burger.classList.add("is-black"), onEnterBack: () => burger.classList.remove("is-black") });
  }

  const mm = gsap.matchMedia();
  const corner = document.querySelector(".dd-corner");
  mm.add(`(min-width: ${BREAK}px) and (prefers-reduced-motion: no-preference)`, () => {
    // Quarter-circle photo — turbulence .01·.1 → .002·.02, displacement 20 → 10 cycle over 60s, and on hover it speeds up to 20s
    if (corner) {
      const warp = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 60, ease: "none" } })
        .add("start")
        .to("#dd-corner-turb", { attr: { baseFrequency: "0.002, 0.02" } })
        .to("#dd-corner-disp", { attr: { scale: 10 } }, "start");
      const link = corner.querySelector("a");
      const fast = () => warp.duration(20), slow = () => warp.duration(60);
      link.addEventListener("mouseenter", fast);
      link.addEventListener("mouseleave", slow);
    }

    // Photo inside a photo frame — a photo larger than the frame sits at the bottom of the frame, then moves down so its top is revealed while the frame passes through the screen
    gsap.utils.toArray("[data-drift]").forEach((frame) => {
      const pic = frame.querySelector(".wf-img");
      if (!pic) return;
      gsap.to(pic, { y: () => pic.clientHeight - frame.clientHeight, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });

    // Contact band background — the photo pushed up comes back down into place while the band passes through the screen
    const back = document.querySelector(".dd-contact__back");
    const pic = back?.querySelector(".wf-img");
    if (pic) gsap.fromTo(pic, { y: () => back.clientHeight - back.scrollHeight }, { y: 0, ease: "none", scrollTrigger: { trigger: back, scrub: true, start: "top bottom", end: "bottom top", invalidateOnRefresh: true } });
  });

  // Contact strip clock — once the strip enters 80% of the screen, it shows ‹year.month.day. hh:mm:ss› every 1s (no zero padding)
  const date = document.querySelector(".dd-contact__date");
  if (date) {
    let last = 0;
    const tick = () => {
      const now = new Date();
      if (now - last < 1000) return;
      last = now;
      date.textContent = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}. ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    };
    tick();
    ScrollTrigger.create({ trigger: ".dd-contact", start: "top 80%", onEnter: () => gsap.ticker.add(tick), onLeaveBack: () => gsap.ticker.remove(tick) });
  }

  if (!isHome) gsap.delayedCall(0.1, ScrollTrigger.refresh);
})();
