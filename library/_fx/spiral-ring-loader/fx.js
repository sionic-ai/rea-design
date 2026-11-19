// Hero loader: a spiral plate holding six circular text rings (1 → 2.75x, offset by 60° each) grows 0 → 4x over 5s sine.out while rotating 60°,
// Rings fade faster from the outermost. At the same time the cloud · island map rises to 2× in 3s, and from 3s before the end a circular hole in the center opens in 1.2s power2.out.
// The original releases scroll at 3s and removes the cover at 3.5s, separately from the loader timeline — those two moments are exposed as options.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  const ringSvg = (text) => {
    const id = `fx-srl-path-${++uid}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 520 520");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(NS, "path");
    path.setAttribute("id", id);
    path.setAttribute("fill", "none");
    path.setAttribute("d", "M260 260 m-236 0 a236 236 0 1 1 472 0 a236 236 0 1 1 -472 0");
    const t = document.createElementNS(NS, "text");
    const tp = document.createElementNS(NS, "textPath");
    tp.setAttribute("href", `#${id}`);
    tp.setAttribute("textLength", String(Math.round(2 * Math.PI * 236) - 6));
    tp.setAttribute("lengthAdjust", "spacing");
    tp.textContent = text;
    t.append(tp);
    svg.append(path, t);
    return svg;
  };

  kfFx.register("spiral-ring-loader", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const root = document.documentElement;
    const lock = options.lock !== "off";
    const fire = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    let spiral = part("spiral"), made = false;
    if (!spiral) { spiral = document.createElement("div"); spiral.setAttribute("data-fx-part", "spiral"); el.prepend(spiral); made = true; }
    let rings = [...spiral.querySelectorAll('[data-fx-part="ring"]')];
    const madeRings = !rings.length;
    if (madeRings) {
      const n = Math.max(1, +options.rings || 6), text = options.text || "PLACE YOUR TAGLINE AROUND THE RING · ";
      for (let i = 0; i < n; i++) {
        const r = document.createElement("span");
        r.setAttribute("data-fx-part", "ring");
        r.append(ringSvg(text.repeat(+options.repeat || 1)));
        spiral.append(r);
      }
      rings = [...spiral.children];
    }
    const step = +(options["scale-step"] ?? 0.35), turn = +(options["angle-step"] ?? 60);
    rings.forEach((r, i) => { r.style.setProperty("--fx-ring-scale", String(1 + step * i)); r.style.setProperty("--fx-ring-angle", `${turn * i}deg`); r.style.zIndex = String(100 - i); });

    const logo = part("logo"), cloud = part("cloud"), map = part("map");
    const hole = { v: 0 };
    const paint = () => el.style.setProperty("--fx-hole", `${hole.v}%`);
    const finish = () => { el.hidden = true; fire("fx:done"); };
    const release = () => { if (lock) root.classList.remove("fx-srl-lock"); fire("fx:open"); };
    if (reduce) {
      const t = setTimeout(() => { fire("fx:cue"); release(); finish(); }, 0);
      return () => { clearTimeout(t); el.hidden = false; if (made) spiral.remove(); else if (madeRings) spiral.replaceChildren(); };
    }
    if (lock) root.classList.add("fx-srl-lock");
    el.classList.add("is-running");
    paint();

    const speed = +(options.speed ?? 1) || 1;
    const tl = gsap.timeline();
    if (logo) tl.fromTo(logo, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: +(options.logo ?? 0.8), ease: kfFx.ease(options["logo-ease"] || "back.out(1.7)", "back.out(1.7)") });
    tl.fromTo(spiral, { scale: 0, opacity: 0, rotate: 0 }, { scale: +(options.grow ?? 4), opacity: 1, rotate: +(options.turn ?? 60), duration: +(options.dur ?? 5), ease: kfFx.ease(options.ease || "sine.out", "sine.out") }, logo ? "-=0.5" : 0);
    if (cloud) tl.fromTo(cloud, { opacity: 0, scale: 1 }, { opacity: +(options.cloud ?? 0.5), scale: 2, duration: 3 }, "<");
    if (map) tl.fromTo(map, { opacity: 0, scale: 1, filter: "blur(3px)", rotate: 0 }, { opacity: +(options.map ?? 0.2), scale: 2, filter: "blur(0px)", rotate: -9, duration: 3 }, "<");
    tl.to(hole, { v: 100, duration: +(options.hole ?? 1.2), ease: kfFx.ease(options["hole-ease"] || "power2.out", "power2.out"), onUpdate: paint }, `-=${+(options["hole-at"] ?? 3)}`);
    tl.call(() => fire("fx:cue"), null, `-=${+(options.cue ?? 4)}`);
    tl.timeScale(speed);
    const tOpen = setTimeout(release, (+(options.unlock ?? 3) * 1000) / speed);
    const tHide = setTimeout(finish, (+(options.hide ?? 3.5) * 1000) / speed);

    return () => {
      tl.kill(); clearTimeout(tOpen); clearTimeout(tHide);
      if (lock) root.classList.remove("fx-srl-lock");
      el.hidden = false; el.classList.remove("is-running"); el.style.removeProperty("--fx-hole");
      gsap.set([spiral, logo, cloud, map].filter(Boolean), { clearProps: "transform,opacity,filter" });
      if (made) spiral.remove(); else if (madeRings) spiral.replaceChildren();
      else rings.forEach((r) => { r.style.removeProperty("--fx-ring-scale"); r.style.removeProperty("--fx-ring-angle"); r.style.zIndex = ""; });
    };
  });
})();
