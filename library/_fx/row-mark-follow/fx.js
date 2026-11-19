// Light only the hovered row and move the paired marker to that row’s height — the marker column’s top measures the first row’s height as 0
(() => {
  kfFx.register("row-mark-follow", (el, { options, reduce, hover }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    const box = el.querySelector('[data-fx-part="marks"]');
    const marks = box ? [...box.querySelectorAll('[data-fx-part="mark"]')] : [];
    if (!rows.length) return;
    const dim = +(options.dim ?? 0.7), dur = reduce ? 0 : +(options.dur ?? 0.3), glide = reduce ? 0 : +(options.glide ?? 0.2);
    el.style.setProperty("--fx-dim", dim);
    const pick = (i) => marks.forEach((m, j) => m.classList.toggle("is-on", j === i));
    pick(0);
    if (!hover) {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && pick(rows.indexOf(e.target))), { rootMargin: "-50% 0px -49% 0px" });
      rows.forEach((r) => io.observe(r));
      return () => { io.disconnect(); marks.forEach((m) => m.classList.remove("is-on")); el.style.removeProperty("--fx-dim"); };
    }
    const fe = kfFx.ease("0.19,1,0.22,1", "expo.out"), vt = kfFx.ease("0.39,0.575,0.565,1", "sine.out");
    const toTop = box ? gsap.quickTo(box, "top", { duration: glide, ease: vt }) : null;
    const tw = [];
    const offs = rows.map((r, i) => {
      const on = () => {
        pick(i);
        tw[i]?.kill();
        tw[i] = gsap.to(r, { opacity: 1, duration: dur, ease: fe });
        toTop?.(r.getBoundingClientRect().top - rows[0].getBoundingClientRect().top);
      };
      const off = () => {
        const back = () => (tw[i] = gsap.to(r, { opacity: dim, duration: dur, ease: vt }));
        tw[i] && tw[i].isActive() ? tw[i].then(back) : back();
      };
      r.addEventListener("mouseenter", on);
      r.addEventListener("mouseleave", off);
      return () => { r.removeEventListener("mouseenter", on); r.removeEventListener("mouseleave", off); };
    });
    return () => {
      offs.forEach((f) => f());
      gsap.killTweensOf(rows);
      gsap.set(rows, { clearProps: "opacity" });
      if (box) gsap.set(box, { clearProps: "top" });
      marks.forEach((m) => m.classList.remove("is-on"));
      el.style.removeProperty("--fx-dim");
    };
  });
})();
