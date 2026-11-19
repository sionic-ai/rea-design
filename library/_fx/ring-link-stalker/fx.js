// A 50px ring, hidden by default, follows the cursor .4s late, and on a photo link (data-fx-part=target) when it is over it, it switches on from .2x in .3s and grows,
// On leave it shrinks to .2x over .2s and turns off. The ring keeps following the position, so moving from link to link it slides while still on
(() => {
  kfFx.register("ring-link-stalker", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const ac = new AbortController(), signal = ac.signal;
    const follow = +(options.follow ?? 0.4), dIn = +(options.in ?? 0.3), dOut = +(options.out ?? 0.2);
    const from = +(options.from ?? 0.2), ease = options.ease || "power1.out";
    let ring = el.querySelector("[data-fx-part=ring]"), made = false;
    if (!ring) {
      ring = document.createElement("div");
      ring.setAttribute("data-fx-part", "ring");
      ring.setAttribute("aria-hidden", "true");
      el.append(ring);
      made = true;
    }
    ring.classList.add("fx-rls");
    gsap.set(ring, { x: innerWidth / 2, y: innerHeight / 2, scale: from, autoAlpha: 0 });
    const qx = gsap.quickTo(ring, "x", { duration: reduce ? 0 : follow, ease });
    const qy = gsap.quickTo(ring, "y", { duration: reduce ? 0 : follow, ease });
    let active = null, lx = 0, ly = 0;
    const show = (on) => {
      gsap.killTweensOf(ring, "scale,opacity,visibility");
      if (on) gsap.fromTo(ring, { scale: from }, { autoAlpha: 1, scale: 1, duration: reduce ? 0 : dIn, ease });
      else gsap.to(ring, { autoAlpha: 0, scale: from, duration: reduce ? 0 : dOut, ease });
    };
    const check = () => {
      const under = document.elementFromPoint(lx, ly);
      const hit = under && el.contains(under) ? under.closest("[data-fx-part=target]") : null;
      if (hit === active) return;
      if (!!hit !== !!active) show(!!hit);
      active = hit;
    };
    addEventListener("pointermove", (e) => { lx = e.clientX; ly = e.clientY; qx(lx); qy(ly); check(); }, { passive: true, signal });
    addEventListener("scroll", check, { passive: true, signal });
    document.addEventListener("pointerleave", () => { if (active) { active = null; show(false); } }, { signal });
    return () => {
      ac.abort();
      gsap.killTweensOf(ring);
      if (made) ring.remove();
      else { ring.classList.remove("fx-rls"); gsap.set(ring, { clearProps: "all" }); }
    };
  });
})();
