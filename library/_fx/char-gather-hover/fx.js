// Hovering the notice strip unfolds the cut-out panel and the second color covers it, while hidden pieces around it gather, each sloshing at its own spot. Release and they all scatter at once
(() => {
  const dss = (t) => Math.sin((Math.PI / 2) * Math.sin((Math.PI / 2) * t));
  const parse = (s) => Object.fromEntries(String(s || "").split(";").map((kv) => kv.split(":").map((x) => x.trim())).filter((kv) => kv[0]).map(([k, v]) => [k, +v]));
  kfFx.register("char-gather-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const q = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const panel = q("panel") || el, bg = q("bg"), fill = q("fill"), note = q("note"), logo = q("logo"), arrow = q("arrow");
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')].map((p) => {
      const f = parse(p.dataset.from);
      return { p, rest: { xPercent: f.x ?? 0, yPercent: f.y ?? 0, rotate: f.r ?? 0, scale: f.s ?? 1 } };
    });
    const inset = +(options.inset ?? 9), bgs = +(options.bg ?? 0.81), dur = +(options.dur ?? 0.8), each = +(options.stagger ?? 0.04), first = +(options.first ?? -0.1);
    // round — corner radius (px) of the cut-out panel. The original rounds the panel itself and only clips, so there is no default
    const rnd = options.round != null ? ` round ${+options.round}px` : "";
    const clip = (v) => `inset(${v}%${rnd})`;
    const ease = kfFx.ease(options.ease || "elastic.out(1, 0.7)", "elastic.out(1, 0.7)");
    const paths = arrow ? [...arrow.querySelectorAll("path")] : [];
    const lens = paths.map((p) => Math.ceil(p.getTotalLength?.() || 0));
    gsap.set(panel, { clipPath: clip(inset) });
    if (bg) gsap.set(bg, { scale: bgs });
    if (fill) gsap.set(fill, { scale: 0 });
    pieces.forEach(({ p, rest }) => gsap.set(p, { ...rest, opacity: 0 }));
    paths.forEach((p, i) => gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i], opacity: 0 }));
    let tl;
    const on = () => {
      tl?.kill();
      tl = gsap.timeline();
      tl.to(panel, { clipPath: clip(0), duration: dur, ease }, 0);
      if (bg) tl.to(bg, { scale: 1, duration: dur, ease }, 0);
      if (fill) tl.to(fill, { scale: 1, duration: dur, ease }, 0);
      if (note) tl.to(note, { yPercent: -80, duration: dur, ease }, 0);
      if (logo) { tl.to(logo, { yPercent: -80, duration: dur, ease: "elastic.out(1, 0.4)" }, 0); tl.to(logo, { opacity: 1, duration: 0.4, ease: dss }, 0); }
      if (arrow) tl.fromTo(arrow, { xPercent: -30, opacity: 1 }, { xPercent: 0, duration: 0.4, ease: dss }, 0);
      if (paths[0]) tl.fromTo(paths[0], { strokeDashoffset: lens[0], opacity: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: dss }, 0);
      if (paths[1]) tl.fromTo(paths[1], { strokeDashoffset: lens[1], opacity: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: dss }, 0.2);
      // The original attaches the first piece .3s ahead (-.1s) of the arrow head (.2s) — a piece placed before 0 starts already advanced by that much from the first frame
      pieces.forEach(({ p }, i) => {
        const at = first + i * each;
        tl.to(p, { xPercent: 0, yPercent: 0, rotate: 0, scale: 1, duration: dur, ease }, at);
        tl.to(p, { opacity: 1, duration: 0.4, ease: dss }, at);
      });
    };
    const off = () => {
      tl?.kill();
      tl = gsap.timeline();
      tl.to(panel, { clipPath: clip(inset), duration: dur, ease }, 0);
      if (bg) tl.to(bg, { scale: bgs, duration: dur, ease }, 0);
      if (fill) tl.to(fill, { scale: 0, duration: dur, ease }, 0);
      if (arrow) tl.to(arrow, { opacity: 0, duration: 0.4, ease }, 0);
      if (note) tl.to(note, { yPercent: 0, duration: dur, ease }, 0);
      if (logo) tl.to(logo, { yPercent: 0, opacity: 0, duration: dur, ease }, 0);
      pieces.forEach(({ p, rest }) => tl.to(p, { ...rest, opacity: 0, duration: dur, ease }, 0));
    };
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    return () => {
      el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off); tl?.kill();
      gsap.set([panel, bg, fill, note, logo, arrow, ...paths, ...pieces.map((x) => x.p)].filter(Boolean), { clearProps: "all" });
    };
  });
})();
