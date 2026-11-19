(() => {
  // Letter stand-up — each letter is split by em and laid flat at 90° on the x axis (down by shift), then stood up in sequence when visible (or right on open).
  kfFx.register("char-stand-up", (el, { options, reduce, scroller }) => {
    const text = el.textContent;
    if (!text.trim()) return;
    const keep = el.innerHTML;
    el.setAttribute("aria-label", text.trim());
    el.innerHTML = [...text].map((c) => (c === " " ? '<em data-fx-part="char" class="fx-space" aria-hidden="true"> </em>' : `<em data-fx-part="char" aria-hidden="true">${c}</em>`)).join("");
    const chars = el.querySelectorAll('[data-fx-part="char"]');
    const delay = +(options.delay ?? 0.1), each = +(options.each ?? 0.03), dur = +(options.dur ?? 1.2);
    // GSAP curves with parentheses (elastic.out(1, 0.3)) are kept as they are even with commas — only four-number curves go through CustomEase
    const curve = (c, fb) => (/\(/.test(c) ? c : kfFx.ease(c, fb));
    const shift = options.shift || "30px", ease = curve(options.ease || "0.19,1,0.22,1", "expo.out");
    // Tilt angle and horizontal shift — with tilt: 0 it does not lean back and just rises from below (or from the side with shift-x) (Brand rubber-band letters)
    const tilt = +(options.tilt ?? 90), shiftX = options["shift-x"] ?? 0;
    const off = () => { el.innerHTML = keep; el.removeAttribute("aria-label"); };
    if (reduce) return off;
    gsap.registerPlugin(ScrollTrigger);
    // Opacity can be switched on separately and made shorter (Brand: stand-up .8s expo.out, opacity .4s with its own curve) — if not given, it uses the same length and curve as the stand-up
    const fade = +(options.fade ?? dur), fadeEase = options["fade-ease"] ? curve(options["fade-ease"], "power1.out") : ease;
    gsap.set(chars, { rotateX: tilt, x: shiftX, y: shift, opacity: 0, transformPerspective: +(options.perspective ?? 1000), ...(options.origin && { transformOrigin: options.origin }) });
    const tw = gsap.timeline({ paused: true, delay })
      .to(chars, { rotateX: 0, x: 0, y: 0, duration: dur, ease, stagger: each }, 0)
      .to(chars, { opacity: 1, duration: fade, ease: fadeEase, stagger: each }, 0);
    let st = null;
    if (options.on === "load") tw.play();
    else st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top center+=20%", once: true, onEnter: () => tw.play() });
    return () => { st?.kill(); tw.kill(); off(); };
  });
})();
