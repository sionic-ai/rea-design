// About: mouse photo marks · client name logo boxes · photo strip.
// Original values: trail threshold 15rem, front position lerp .1, photo inset center→0 .7s expo.out + scale .75→1, move 1.2s expo.out, turns off in .2s when done
//           logo box inset(50%)↔0 .7s expo.out, move 1.2s expo.out, remaining names .1(.4s) · photo band title ±2.5rem 1.4s expo.inOut, photos x .1 apart 1.4s expo.inOut
(() => {
  const { rem, isXL, reduced } = SD;
  if (reduced) return;
  const lerp = (a, b, t) => a + (b - a) * t;

  // Photo trail
  const cover = document.querySelector(".ab-cover");
  const imgs = [...document.querySelectorAll(".ab-trail__img")];
  const cur = document.querySelector("[data-trail-cur]");
  let mouse = { x: 0, y: 0 }, last = { x: -9999, y: -9999 }, prev = null, idx = 0, z = 1, inside = false;
  const local = (e) => { const b = cover.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  cover.addEventListener("mousemove", (e) => {
    if (!isXL()) return;
    mouse = local(e);
    const cp = { x: mouse.x - cur.offsetWidth / 2 + rem(0.25), y: mouse.y - cur.offsetHeight / 2 + rem(0.75) };
    if (!inside) {
      inside = true;
      gsap.killTweensOf(cur);
      gsap.set(cur, cp);
      gsap.to(cur, { autoAlpha: 1, duration: 0.4, ease: "alpha" });
    } else gsap.to(cur, { ...cp, duration: 1.2, ease: "expo.out", overwrite: "auto" });
  });
  cover.addEventListener("mouseleave", () => { inside = false; prev = null; gsap.to(cur, { autoAlpha: 0, duration: 0.2, ease: "alpha" }); });
  gsap.ticker.add(() => {
    if (!inside || !isXL()) return;
    prev = prev ? { x: lerp(prev.x, mouse.x, 0.1), y: lerp(prev.y, mouse.y, 0.1) } : { ...mouse };
    if (Math.hypot(last.x - mouse.x, last.y - mouse.y) > rem(15)) {
      const el = imgs[idx], w = el.offsetWidth, h = el.offsetHeight;
      gsap.killTweensOf([el, el.querySelector(".wf-img")]);
      gsap.timeline()
        .set(el, { autoAlpha: 1, clipPath: `inset(${h / 2}px ${w / 2}px round 1rem)`, x: prev.x - w / 2, y: prev.y - h / 2, zIndex: z++ })
        .set(el.querySelector(".wf-img"), { scale: 0.75 })
        .to(el, { x: mouse.x - w / 2, y: mouse.y - h / 2, duration: 1.2, ease: "expo.out" })
        .to(el, { clipPath: "inset(0px 0px round 1rem)", duration: 0.7, ease: "expo.out" }, "<")
        .to(el.querySelector(".wf-img"), { scale: 1, duration: 0.7, ease: "expo.out" }, "<")
        .to(el, { autoAlpha: 0, duration: 0.2, ease: "alpha" });
      idx = (idx + 1) % imgs.length;
      last = { ...mouse };
    }
  });

  // Phone — after the square window opens, the photo changes every 1.2s over .4s
  const mimgs = [...document.querySelectorAll(".ab-mtrail__img")];
  const mw = document.querySelector(".ab-mtrail__w");
  if (!isXL()) {
    gsap.set(mimgs.slice(1), { autoAlpha: 0 });
    gsap.set(mw, { clipPath: `inset(${mw.offsetHeight / 2}px ${mw.offsetWidth / 2}px round 1rem)` });
    gsap.set(mimgs, { scale: 0.75 });
    SD.ready(() => {
      gsap.timeline({ onComplete: () => { let i = 0; setInterval(() => { const n = (i + 1) % mimgs.length; gsap.to(mimgs[i], { autoAlpha: 0, duration: 0.4, ease: "alpha" }); gsap.to(mimgs[n], { autoAlpha: 1, duration: 0.4, ease: "alpha" }); i = n; }, 1200); } })
        .to(mw, { clipPath: "inset(0px 0px round 1rem)", duration: 0.7, ease: "expo.out" })
        .to(mimgs, { scale: 1, duration: 0.7, ease: "expo.out" }, "<");
    });
  }

  // Client name — if the right margin is narrower than 1.25 boxes, attach it on the left
  const sec = document.querySelector(".ab-cust");
  const items = [...document.querySelectorAll("[data-cust]")];
  const lw = document.querySelector(".ab-cust__lw");
  const logos = [...document.querySelectorAll("[data-logo]")];
  if (lw) {
    gsap.set(lw, { clipPath: "inset(50% round 1rem)" });
    let active = false, entered = false;
    const place = (i, tween) => {
      const s = sec.getBoundingClientRect(), r = items[i].getBoundingClientRect(), W = lw.offsetWidth, H = lw.offsetHeight;
      const left = innerWidth - r.right < W + W / 4;
      const p = { x: left ? r.left - s.left - W - W / 4 : r.right - s.left + W / 4, y: r.top - s.top - H / 4 };
      tween ? gsap.to(lw, { ...p, duration: 1.2, ease: "expo.out" }) : gsap.set(lw, p);
    };
    items.forEach((it, i) => {
      it.addEventListener("mouseenter", () => {
        if (!isXL()) return;
        if (!entered) place(i, false);
        if (!active) { active = true; entered = true; gsap.to(lw, { clipPath: "inset(0% round 1rem)", duration: 0.7, ease: "expo.out" }); }
        place(i, true);
        gsap.set(logos[i], { autoAlpha: 1 });
        gsap.to(items.filter((_, k) => k !== i), { autoAlpha: 0.1, duration: 0.4, ease: "alpha" });
        gsap.to(it, { autoAlpha: 1, duration: 0.4, ease: "alpha" });
      });
      it.addEventListener("mouseleave", () => {
        if (!isXL()) return;
        active = false;
        gsap.set(logos[i], { autoAlpha: 0 });
        setTimeout(() => {
          if (active) return;
          gsap.to(items, { autoAlpha: 1, duration: 0.4, ease: "alpha" });
          gsap.to(lw, { clipPath: "inset(50% round 1rem)", duration: 0.7, ease: "expo.out", onComplete: () => (entered = active) });
        }, 100);
      });
    });
  }

  // Photo strip — the upper and lower titles part from the center (1.4s expo.inOut), and at .05s the boost-drag-rows motion part lets the cells in (original about-images-slider)
  const sl = document.querySelector(".ab-slider");
  const tw = document.querySelector(".ab-slide__tw"), bw = document.querySelector(".ab-slide__bw");
  const H = () => rem(innerWidth < 1024 ? 22.8 : 43.6);
  const off = () => rem(innerWidth < 1024 ? 2 : 2.5) * (innerWidth < 1024 ? -1 : 1);
  gsap.set(tw, { y: H() / 2 });
  gsap.set(bw, { y: -H() / 2 + (innerWidth >= 1024 ? -rem(2.5) : 0) });
  ScrollTrigger.create({
    trigger: ".ab-slide", start: innerWidth < 1024 ? "top 60%" : "top 20%", once: true,
    onEnter: () => {
      gsap.timeline()
        .to(tw, { y: off(), duration: 1.4, ease: "expo.inOut" }, 0)
        .to(bw, { y: -off() + (innerWidth >= 1024 ? -rem(2.5) : 0), duration: 1.4, ease: "expo.inOut" }, 0)
        .call(() => sl.dispatchEvent(new CustomEvent("fx:appear")), [], 0.05);
    },
  });
})();
