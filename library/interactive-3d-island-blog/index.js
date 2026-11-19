// Hero — the title is typed one character at a time (62ms beat × .74~1.26, blank +.9 beat·punctuation +1.8 beat). A word hidden behind The is typed and erased, then the rest is typed and
// Types the About text in 15ms beats, then turns on the button (.8s 14px up), header line (.9s after .36s) and turn bar (.9s after .22s). Hovering the title retypes the hidden words,
// Letters near the cursor swell in a variable font (weight-proximity). Read Posts moves toward the field over .76s and then switches to the list
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clearing = $(".bb-clearing"), title = $(".bb-hero__word"), blurb = $(".bb-hero__blurb"), go = $(".bb-hero__go"), mast = $(".bb-mast"), track = $(".bb-track"), stage = $(".bb-stage");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const BEAT = 62;

  const split = (node, hide) => {
    const text = node.textContent;
    node.textContent = "";
    const out = [];
    const ch = (parent, c) => { const s = document.createElement("span"); s.className = "bb-ch"; s.textContent = c; s.dataset.hide = hide; show(s, false); parent.append(s); out.push(s); };
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { ch(node, part); continue; }
      const w = document.createElement("span"); w.className = "bb-word";
      for (const c of part) ch(w, c);
      node.append(w);
    }
    return out;
  };
  const show = (s, on) => { if (s.dataset.hide === "none") s.style.display = on ? "inline" : "none"; else s.style.visibility = on ? "visible" : "hidden"; };
  const typed = $$("[data-type]", title).map((n) => split(n, "hidden"));
  const hidden = $$(".bb-no", title).map((n) => split(n, "none"));
  const extras = hidden.flat();
  const blurbChars = split(blurb, "hidden");

  const caret = document.createElement("i");
  caret.className = "bb-caret";
  caret.setAttribute("aria-hidden", "true");
  const put = (c, after = true) => { caret.style.translate = `${c.offsetLeft + (after ? c.offsetWidth : 0)}px ${c.offsetTop}px`; caret.style.blockSize = `${c.offsetHeight}px`; };
  const type = (list, { beat = BEAT, follow = true } = {}) => {
    let t = 0;
    for (const c of list) {
      setTimeout(() => { show(c, true); if (follow) put(c); }, t);
      t += beat * (0.74 + 0.52 * Math.random());
      if (!c.textContent.trim()) t += 0.9 * beat;
      if (/[?.,]/.test(c.textContent)) t += 1.8 * beat;
    }
    return wait(t);
  };
  const untype = (list, back) => {
    let t = 0;
    const rev = [...list].reverse();
    rev.forEach((c, i) => {
      setTimeout(() => { show(c, false); const prev = rev[i + 1] || back; if (prev) put(prev); }, t);
      t += BEAT * (0.46 + 0.18 * Math.random());
    });
    return wait(t);
  };
  const fadeIn = (el, opts, rise) => { if (!el) return; el.style.opacity = "1"; el.animate(rise ? [{ opacity: 0, transform: "translate3d(0, 14px, 0)" }, { opacity: 1, transform: "none" }] : [{ opacity: 0 }, { opacity: 1 }], { duration: 800, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "none", ...opts }); };
  const finishEntering = () => { clearing.classList.remove("is-entering"); root.classList.remove("is-entering"); };

  // On hover, retype the hidden word — on leave, erase it in .42 beat
  let hoverOn = false, hoverToken = 0;
  const setHidden = async (on) => {
    hoverOn = on;
    const token = ++hoverToken;
    if (reduce) { extras.forEach((c) => show(c, on)); return; }
    for (const c of on ? extras : [...extras].reverse()) {
      show(c, on);
      await wait(on ? BEAT * (0.72 + 0.5 * Math.random()) : 0.42 * BEAT);
      if (token !== hoverToken) return;
    }
  };
  const armHover = () => {
    let q = 0, mx = -1e4, my = -1e4;
    const check = () => { q = 0; const r = title.getBoundingClientRect(); const inside = !walking && mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom; if (inside !== hoverOn) setHidden(inside); };
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; if (!q) q = requestAnimationFrame(check); }, { passive: true });
    root.addEventListener("pointerleave", () => { mx = my = -1e4; if (!q) q = requestAnimationFrame(check); });
    // Letters near the cursor swell — attached after typing ends, as in the original. Hidden words keep their weight as is
    $$(".bb-no", title).forEach((n) => { n.setAttribute("data-fx-part", "alt"); n.dataset.rest = "340"; n.dataset.near = "340"; });
    title.setAttribute("data-fx-weight-proximity", "rest: 340; near: 720; radius: 220; curve: smooth; follow: .13; axes: opsz 12 144, SOFT 0 40");
    title.setAttribute("data-fx", "weight-proximity");
  };

  const intro = async () => {
    title.append(caret);
    if (reduce) {
      [...typed.flat(), ...blurbChars].forEach((c) => show(c, true));
      caret.remove();
      finishEntering();
      armHover();
      return;
    }
    await wait(1100);
    caret.classList.add("bb-caret--on");
    await wait(300);
    await type(typed[0]);
    await type(hidden[0]);
    await wait(760);
    await untype(hidden[0], typed[0].at(-1));
    await wait(180);
    await type(typed[1]);
    await type(typed[2]);
    await wait(420);
    blurb.append(caret);
    if (blurbChars[0]) put(blurbChars[0], false);
    await type(blurbChars, { beat: 15 });
    await wait(240);
    caret.classList.remove("bb-caret--on");
    setTimeout(() => caret.remove(), 420);
    finishEntering();
    fadeIn(go, { duration: 800 }, true);
    await wait(360);
    fadeIn(mast, { duration: 900 });
    await wait(220);
    fadeIn(track, { duration: 900 });
    armHover();
  };

  // Approaching the field — with the same .76s cubic inOut as the camera (part), the title·bar rise 14px and fade 1.35x faster
  let walking = false;
  const setWalk = (w) => {
    root.style.setProperty("--site-walk", w.toFixed(3));
    const o = Math.max(0, 1 - 1.35 * w);
    [track, blurb, go, title].forEach((n) => { if (!n) return; n.style.opacity = String(o); n.inert = o < 0.02; });
  };
  const walkTo = (to, done) => {
    if (reduce) { setWalk(to); done?.(); return; }
    const from = +(getComputedStyle(root).getPropertyValue("--site-walk") || 0), t0 = performance.now();
    stage.dispatchEvent(new CustomEvent("fx:walk", { detail: { to } }));
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 760), k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setWalk(from + (to - from) * k);
      if (t < 1) requestAnimationFrame(step); else done?.();
    };
    requestAnimationFrame(step);
  };
  $$("a[data-walk]").forEach((a) => a.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    if (walking) return;
    walking = true;
    if (hoverOn) setHidden(false);
    walkTo(1, () => { try { sessionStorage.setItem("bb-walk", "in"); } catch (err) { /* Without transition indicator */ } location.href = a.getAttribute("href"); });
  }));

  let back = false;
  try { back = sessionStorage.getItem("bb-walk") === "out"; sessionStorage.removeItem("bb-walk"); } catch (e) { back = false; }
  const start = () => {
    if (back) {
      // When returning from the list to the field — backs away from where it had approached and the title stands up again (typing is already finished)
      [...typed.flat(), ...blurbChars].forEach((c) => show(c, true));
      finishEntering();
      stage.dispatchEvent(new CustomEvent("fx:walk", { detail: { to: 1, instant: true } }));
      setWalk(1);
      requestAnimationFrame(() => walkTo(0));
      armHover();
      return;
    }
    intro();
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", () => setTimeout(start, 0), { once: true }); else setTimeout(start, 0);
})();
