(() => {
  const all = () => [...document.querySelectorAll('[data-fx~="fixed-word-rise"]')];
  const sectionOf = (n) => n.closest("section") || n;
  kfFx.register("fixed-word-rise", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const text = el.textContent.trim();
    if (!text) return;
    const original = el.innerHTML;
    el.setAttribute("aria-label", text);
    const chars = [...text].map((ch) => {
      const outer = document.createElement("span");
      outer.setAttribute("data-fx-part", "char");
      outer.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.textContent = ch === " " ? " " : ch;
      outer.append(inner);
      return outer;
    });
    el.replaceChildren(...chars);
    const inners = chars.map((c) => c.firstChild);
    const each = +(options.each ?? 0.05), dur = +(options.dur ?? 0.8), out = +(options.out ?? 1.5);
    gsap.set(el, { opacity: 0 });
    if (!reduce) gsap.set(inners, { yPercent: 100, opacity: 0 });
    const tl = reduce ? null : gsap.timeline({ paused: true }).to(inners, { yPercent: 0, opacity: 1, duration: dur, ease: options.ease || "power3.out", stagger: each });
    const show = () => { gsap.killTweensOf(el); gsap.set(el, { opacity: 1 }); tl?.restart(); el.classList.add("is-on"); };
    const hide = () => { el.classList.remove("is-on"); gsap.to(el, { opacity: 0, duration: out, ease: "power2.out", overwrite: "auto", onComplete: () => tl?.pause(0) }); };
    const start = options.start || "top 75%";
    const st = ScrollTrigger.create({
      trigger: sectionOf(el), scroller, start,
      endTrigger: () => { const list = all(), next = list[list.indexOf(el) + 1]; return next ? sectionOf(next) : sectionOf(el); },
      end: () => { const list = all(); return list[list.indexOf(el) + 1] ? start : "bottom top"; },
      invalidateOnRefresh: true,
      onToggle: (s) => (s.isActive ? show() : hide()),
    });
    return () => { st.kill(); tl?.kill(); gsap.killTweensOf(el); gsap.set(el, { clearProps: "opacity" }); el.innerHTML = original; el.removeAttribute("aria-label"); el.classList.remove("is-on"); };
  });
})();
