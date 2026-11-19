// If attached on first load, it starts covered by the veil so the first image doesn’t flash, then lifts it. An element added later has nothing to lift, so it stays transparent
(() => {
  kfFx.register("page-veil", (root, { options, reduce }) => {
    // Defaults are the original values. For screens flipped often like apps, shorten them — the next page is called only after the curtain fully covers, so navigation is delayed by cover, and an opened page stays covered for 0.05 + reveal
    // look: centre — the curtain opens from the center vertical line to both sides as it covers (original: .9s power3.inOut). On an already open page it shows right away without waiting
    const centre = options.look === "centre";
    // look: rise — one accent panel fills upward from the bottom edge (scaleY 0→1), and on the opened page it clears with the top edge as the axis (Brand: both .6s power3.inOut, no waiting)
    const rise = options.look === "rise";
    // look: layers — accent, light accent and contrast stage, three layers overlap, pressing a link unfolds them from the lowest layer at .05s intervals pivoting on the left edge to cover the screen (scaleX 0→1)
    // On an open page, sheets fold away to the left starting from the top one at the same interval (Brand: both .6s power3.inOut, no wait). On phones (768 and below) it uses scaleY pivoting on the top edge, and .1s intervals when covering
    const layers = options.look === "layers";
    // look: slide — one sheet of background color slides up from below to cover (translateY 100%→0), and on an opened page it exits upward as is to uncover (Brand: both 1s cubic-bezier(.64,.04,.35,1), no wait)
    const slide = options.look === "slide";
    // look: circle — an accent-color curtain covers in a circle from one corner (at, default top right) and the mark turns and stands, on an opened page the mark disappears and the circle shrinks toward the opposite corner (to) (corner-panel-stack-studio: cover .7s · reveal .8s expo.inOut, after .15s)
    const circle = options.look === "circle";
    const cAt = options.at || "100% 0%", cTo = options.to || "0% 100%";
    const cover = reduce ? 0 : +(options.cover ?? (circle ? 0.7 : centre ? 0.9 : slide ? 1 : rise || layers ? 0.6 : 0.35)), reveal = reduce ? 0 : +(options.reveal ?? (circle ? 0.8 : centre ? 0 : slide ? 1 : rise || layers ? 0.6 : 0.45));
    const both = slide ? options.ease || "0.64,0.04,0.35,1" : circle ? "expo.inOut" : centre || rise || layers ? "power3.inOut" : null;
    const fall = slide ? "power3.inOut" : both;
    const easeCover = kfFx.ease(options.ease || both || "power2.in", fall || "power2.in"), easeReveal = kfFx.ease(options["reveal-ease"] || options.ease || both || "power2.out", fall || "power2.out"), lag = +(options.delay ?? (rise || layers || slide ? 0 : circle ? 0.15 : 0.05));
    const ac = new AbortController(), on = { signal: ac.signal };
    const veil = document.createElement("div");
    veil.className = "fx-veil";
    // look: split — instead of one sheet, top and bottom sheets close to half the screen (+1px) (.04 stagger) and fold toward the edges when opening (.03 stagger)
    const split = options.look === "split";
    if (split) veil.innerHTML = '<i class="fx-veil__half"></i><i class="fx-veil__half"></i>';
    if (layers) { veil.classList.add("is-layers"); veil.innerHTML = '<i class="fx-veil__layer"></i><i class="fx-veil__layer"></i><i class="fx-veil__layer"></i>'; }
    const mark = circle ? root.querySelector(':scope > [data-fx-part="mark"]') : null;
    if (mark) veil.append(mark);
    if (circle) veil.classList.add("is-circle");
    const halves = split ? [...veil.children] : [], lay = layers ? [...veil.children] : [], gap = options.stagger;
    const ax = matchMedia("(max-width: 768px)").matches ? "scaleY" : "scaleX";
    const hide = () => (circle ? gsap.set(veil, { clipPath: `circle(0% at ${cAt})` }) : layers ? gsap.set(lay, { [ax]: 0 }) : split ? gsap.set(halves, { height: 0 }) : gsap.set(veil, rise ? { scaleY: 0 } : slide ? { yPercent: 100 } : { autoAlpha: 0 }));
    root.append(veil);
    // shade — while covering, shade of the contrast stage color behind the curtain deepens 0 → shade over the same length and curve (Brand: .46 under the white curtain)
    const shadeTo = +(options.shade ?? 0);
    const shade = shadeTo ? document.createElement("div") : null;
    if (shade) { shade.className = "fx-veil-shade"; root.insertBefore(shade, veil); }
    // wait: load — like the original, it lifts after window load (fonts, images) (since: remove .l-container.fadeout on load). If absent, it runs as soon as the script runs
    const reveal_ = () => {
      if (circle) {
        gsap.set(veil, { clipPath: `circle(150% at ${cTo})` });
        if (mark) gsap.fromTo(mark, { opacity: 1 }, { opacity: 0, scale: 0.85, duration: reduce ? 0 : 0.25, ease: "power2.in", delay: reduce ? 0 : 0.1 });
        gsap.to(veil, { clipPath: `circle(0% at ${cTo})`, duration: reveal, ease: easeReveal, delay: reduce ? 0 : lag });
      } else if (layers) gsap.fromTo(lay, { [ax]: 1 }, { [ax]: 0, duration: reveal, ease: easeReveal, delay: reduce ? 0 : lag, stagger: reduce ? 0 : +(gap ?? 0.05) });
      else if (split) gsap.to(halves, { height: 0, duration: reveal, ease: easeReveal, stagger: reduce ? 0 : +(gap ?? 0.03), delay: reduce ? 0 : lag });
      else if (rise) gsap.fromTo(veil, { scaleY: 1, transformOrigin: "50% 0%" }, { scaleY: 0, duration: reveal, ease: easeReveal, delay: reduce ? 0 : lag });
      else if (slide) gsap.fromTo(veil, { yPercent: 0 }, { yPercent: -100, duration: reveal, ease: easeReveal, delay: reduce ? 0 : lag });
      else gsap.to(veil, { autoAlpha: 0, duration: reveal, ease: easeReveal, delay: reduce ? 0 : lag });
    };
    if (document.readyState === "complete" && options.wait !== "load") hide();
    else if (options.wait === "load" && document.readyState !== "complete") addEventListener("load", reveal_, { once: true, signal: ac.signal });
    else reveal_();
    addEventListener("pageshow", (e) => { if (!e.persisted) return; hide(); if (shade) gsap.set(shade, { opacity: 0 }); }, on);
    root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      if (a.matches('[data-fx-part="top"]')) { e.preventDefault(); return scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.origin !== location.origin || a.href === location.href) return;
      e.preventDefault();
      if (shade) gsap.fromTo(shade, { opacity: 0 }, { opacity: shadeTo, duration: cover, ease: easeCover });
      if (circle) {
        const tl = gsap.timeline({ onComplete: () => (location.href = a.href) }).fromTo(veil, { clipPath: `circle(0% at ${cAt})` }, { clipPath: `circle(150% at ${cAt})`, duration: cover, ease: easeCover });
        if (mark) tl.fromTo(mark, { opacity: 0, scale: 0.7, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: cover * (0.5 / 0.7), ease: "expo.out" }, cover * 0.5);
      } else if (layers) {
        const g = reduce ? 0 : +(gap ?? (ax === "scaleY" ? 0.1 : 0.05));
        gsap.fromTo(lay, { [ax]: 0 }, { [ax]: 1, duration: cover, ease: easeCover, stagger: { each: g, from: "end" }, onComplete: () => (location.href = a.href) });
      } else if (split) gsap.fromTo(halves, { height: 0 }, { height: () => `${Math.ceil(innerHeight / 2) + 1}px`, duration: cover, ease: easeCover, stagger: reduce ? 0 : +(gap ?? 0.04), onComplete: () => (location.href = a.href) });
      else if (rise) gsap.fromTo(veil, { autoAlpha: 1, scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: cover, ease: easeCover, onComplete: () => (location.href = a.href) });
      else if (slide) gsap.fromTo(veil, { autoAlpha: 1, yPercent: 100 }, { yPercent: 0, duration: cover, ease: easeCover, onComplete: () => (location.href = a.href) });
      else if (centre) gsap.fromTo(veil, { autoAlpha: 1, clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: cover, ease: easeCover, onComplete: () => (location.href = a.href) });
      else gsap.to(veil, { autoAlpha: 1, duration: cover, ease: easeCover, onComplete: () => (location.href = a.href) });
    }, on);
    return () => { ac.abort(); gsap.killTweensOf([veil, shade, ...halves, ...lay, mark].filter(Boolean)); shade?.remove(); if (mark) { gsap.set(mark, { clearProps: "all" }); root.append(mark); } veil.remove(); };
  });
})();
