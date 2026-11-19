// When a section turns on (is-in on the element), text forms like light underwater, and scatters when it turns off.
// On: the season text glows and sharpens at .5s and the glow settles at 1.2s · the side line is drawn .1s later over .9s expo.out ·
// Letters (chars) rise in turn from .45em below · 8px blur · transparent · light color over .9s power3.out (.035s apart for Latin · .028s otherwise, not exceeding 0.9 / letter count), and
// cools to its own color in 1.1s after .35s (each chunk .2s later) · text (sweep) has its cover lift top to bottom after .45s while the 5px blur clears in 1.3s power2.out ·
// Children of the row (rise) rise from 18px below after .55s over .8s power3.out at .06s intervals
// Off: letters fade and rise .3em in random order (.008s), vanishing in .45s power2.in, while text and lines fade out in .4s.
(() => {
  let probe = null;
  const rgb = (css) => {
    if (!probe) { probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true }); probe.canvas.width = probe.canvas.height = 1; }
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = css || "currentColor";
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  };
  const resolve = (el, name, fallback) => {
    const s = document.createElement("span");
    s.style.color = `var(${name}, var(${fallback}))`;
    s.style.display = "none";
    el.append(s);
    const c = getComputedStyle(s).color;
    s.remove();
    return rgb(c);
  };

  const split = (node, out) => {
    if (node.kfGlintSplit) return node.kfGlintSplit;
    const walk = (n) => {
      [...n.childNodes].forEach((c) => {
        if (c.nodeType === 1) { if (!c.matches("br, svg, img, .fx-gcr-sr")) walk(c); return; }
        if (c.nodeType !== 3 || !c.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.append(document.createTextNode(w)); return; }
          const wd = document.createElement("span");
          wd.className = "fx-gcr-w";
          wd.setAttribute("aria-hidden", "true");
          [...w].forEach((ch) => {
            const s = document.createElement("span");
            s.className = "fx-gcr-c";
            s.textContent = ch;
            wd.append(s);
            out.push(s);
          });
          frag.append(wd);
        });
        c.replaceWith(frag);
      });
    };
    const label = node.textContent.replace(/\s+/g, " ").trim();
    walk(node);
    node.setAttribute("aria-label", label);
    node.kfGlintSplit = out;
    return out;
  };

  kfFx.register("glint-chars-reveal", (el, { options, reduce }) => {
    const charsHosts = [...el.querySelectorAll('[data-fx-part="chars"]')];
    const sweeps = () => [...el.querySelectorAll('[data-fx-part="sweep"]')];
    const rises = () => [...el.querySelectorAll('[data-fx-part="rise"] > *')];
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const glows = [...el.querySelectorAll('[data-fx-part="glow"]')];
    if (!charsHosts.length && !sweeps().length && !rises().length && !lines.length) return;
    const before = new Map(charsHosts.map((h) => [h, h.innerHTML]));
    el.classList.add("fx-gcr-on");
    if (reduce) return () => el.classList.remove("fx-gcr-on");

    const charDur = +(options.dur ?? 0.9), gap = +(options.gap ?? 0.2);
    const [gr, gg, gb] = resolve(el, "--fx-glint", "--kf-accent-soft");
    const glint = `rgba(${gr}, ${gg}, ${gb}, 0.95)`, glintOff = `rgba(${gr}, ${gg}, ${gb}, 0)`;
    const shadowOn = (px) => `0 0 ${px}px ${glint}`, shadowOff = `0 0 0px ${glintOff}`;
    const charsOf = (within) => charsHosts.filter((h) => !within || within.contains(h)).map((h) => ({ host: h, chars: split(h, []) }));
    let tl = null, phase = "hidden";

    const hideNow = (within) => {
      charsOf(within).forEach(({ chars }) => chars.length && gsap.set(chars, { opacity: 0, top: "0.45em", filter: "blur(8px)", color: glint, textShadow: shadowOn(18) }));
      const sw = sweeps().filter((n) => !within || within.contains(n)), ri = rises().filter((n) => !within || within.contains(n));
      if (sw.length) gsap.set(sw, { opacity: 1, "--reveal": 0, filter: "blur(5px)" });
      if (ri.length) gsap.set(ri, { opacity: 0, y: 18, filter: "blur(0px)" });
      if (!within) {
        if (lines.length) gsap.set(lines, { "--line": 0 });
        if (glows.length) gsap.set(glows, { opacity: 0.2, textShadow: "0 0 0 transparent" });
      }
    };

    const show = (within) => {
      const t = gsap.timeline();
      if (!within) {
        glows.forEach((g) => t.to(g, { opacity: 1, textShadow: shadowOn(16), duration: 0.5, ease: "power2.out" }, 0).to(g, { textShadow: shadowOff, duration: 1.2, ease: "power1.inOut" }, 0.5));
        if (lines.length) t.to(lines, { "--line": 1, duration: 0.9, ease: "expo.out" }, 0.1);
      }
      charsOf(within).forEach(({ host, chars }, i) => {
        if (!chars.length) return;
        const color = getComputedStyle(host).color;
        const latin = /^[\x00-\x7F\s]+$/.test(host.getAttribute("aria-label") || "");
        const each = Math.min(latin ? 0.035 : 0.028, 0.9 / Math.max(1, chars.length));
        const at = 0.15 + i * gap;
        t.to(chars, { opacity: 1, top: "0em", filter: "blur(0px)", duration: charDur, ease: "power3.out", stagger: each }, at)
          .to(chars, { color, textShadow: shadowOff, duration: 1.1, ease: "power1.inOut", stagger: each }, at + 0.35);
      });
      const sw = sweeps().filter((n) => !within || within.contains(n)), ri = rises().filter((n) => !within || within.contains(n));
      if (sw.length) t.to(sw, { "--reveal": 1, filter: "blur(0px)", duration: 1.3, ease: "power2.out", stagger: 0.14 }, 0.45);
      if (ri.length) t.to(ri, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0.55);
      t.call(() => charsOf(within).forEach(({ chars }) => chars.length && gsap.set(chars, { clearProps: "color,textShadow" })));
      return t;
    };

    const dissolve = () => {
      const t = gsap.timeline();
      const all = charsOf().flatMap((c) => c.chars);
      if (all.length) t.to(all, { opacity: 0, top: "-0.3em", filter: "blur(6px)", duration: 0.45, ease: "power2.in", stagger: { each: 0.008, from: "random" } }, 0);
      const sw = sweeps(), ri = rises();
      if (sw.length) t.to(sw, { opacity: 0, filter: "blur(4px)", duration: 0.4, ease: "power2.in" }, 0);
      if (ri.length) t.to(ri, { opacity: 0, y: -12, filter: "blur(4px)", duration: 0.4, ease: "power2.in" }, 0);
      return t;
    };

    const sync = () => {
      const on = el.classList.contains("is-in");
      if (on && phase !== "shown") { tl?.kill(); hideNow(); tl = show(); phase = "shown"; }
      else if (!on && phase === "shown") { tl?.kill(); tl = dissolve(); phase = "hidden"; }
    };
    const onReplay = (ev) => {
      const within = ev.detail?.within;
      if (phase !== "shown") return;
      const a = within ? [...within.querySelectorAll('[data-fx-part="chars"]')] : charsHosts;
      a.forEach((h) => { if (!within || within.contains(h)) { h.kfGlintSplit = null; } });
      charsHosts.forEach((h) => { if (!h.kfGlintSplit) h.removeAttribute("aria-label"); });
      hideNow(within);
      show(within);
    };

    hideNow();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    el.addEventListener("fx:replay", onReplay);
    if (options.on === "load") el.classList.add("is-in");
    sync();

    return () => {
      mo.disconnect();
      el.removeEventListener("fx:replay", onReplay);
      tl?.kill();
      charsHosts.forEach((h) => { h.innerHTML = before.get(h); h.kfGlintSplit = null; h.removeAttribute("aria-label"); });
      const sw = sweeps(), ri = rises();
      if (sw.length) gsap.set(sw, { clearProps: "opacity,filter,--reveal" });
      if (ri.length) gsap.set(ri, { clearProps: "opacity,transform,filter" });
      if (lines.length) gsap.set(lines, { clearProps: "--line" });
      if (glows.length) gsap.set(glows, { clearProps: "opacity,textShadow" });
      el.classList.remove("fx-gcr-on");
    };
  });
})();
