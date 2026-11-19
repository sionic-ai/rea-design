// Open and close the panel height to fit its content, when moving to a neighboring item while open, push the content in that direction
(() => {
  kfFx.register("mega-morph-nav", (el, { options, reduce, hover }) => {
    const box = el.querySelector('[data-fx-part="box"]');
    const toggles = [...el.querySelectorAll('[data-fx-part="toggle"]')];
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    if (!box || !toggles.length || !panels.length) return;
    const backdrop = el.querySelector('[data-fx-part="backdrop"]');
    const D = { open: +(options.open ?? 0.35), morph: +(options.morph ?? 0.4), close: +(options.close ?? 0.25), in: 0.3, out: 0.2, stagger: 0.25, bin: 0.3, bout: 0.2 };
    if (reduce) Object.keys(D).forEach((k) => (D[k] = 0));
    const shift = +(options.shift ?? 30), enterMs = +(options.enter ?? 120), leaveMs = +(options.leave ?? 150);
    const st = { open: false, key: null, tl: null, enter: 0, leave: 0 };
    const panel = (k) => panels.find((p) => p.dataset.key === k);
    const items = (p) => (p ? [...p.querySelectorAll('[data-fx-part="item"]')] : []);
    const idx = (k) => toggles.findIndex((t) => t.dataset.key === k);
    const stag = (n) => (n <= 1 ? 0 : { amount: D.stagger });
    const veil = backdrop ? [backdrop] : [];
    const measure = (p) => { gsap.set(p, { visibility: "visible", position: "relative" }); const h = p.getBoundingClientRect().height; gsap.set(p, { clearProps: "position" }); return h; };
    const kill = () => { st.tl?.kill(); gsap.killTweensOf([box, ...veil, ...panels]); panels.forEach((p) => { const f = items(p); if (f.length) gsap.killTweensOf(f); }); };
    const reset = () => panels.forEach((p) => { gsap.set(p, { visibility: "hidden", opacity: 0, pointerEvents: "none" }); const f = items(p); if (f.length) gsap.set(f, { autoAlpha: 0, x: 0, y: 0 }); });
    const aria = (k) => toggles.forEach((t) => t.setAttribute("aria-expanded", String(t.dataset.key === k)));
    reset();
    function open(k) {
      const p = panel(k);
      if (!p || (st.open && st.key === k)) return;
      if (st.open) return swap(st.key, k);
      kill(); reset();
      const h = measure(p);
      gsap.set(p, { visibility: "hidden" });
      st.open = true; st.key = k; aria(k);
      el.dispatchEvent(new CustomEvent("fx:open", { detail: { key: k } }));
      gsap.set(box, { height: 0 });
      const tl = (st.tl = gsap.timeline());
      if (veil.length) tl.to(veil, { autoAlpha: 1, duration: D.bin, ease: "power2.out" }, 0);
      tl.to(box, { height: h, duration: D.open, ease: "power3.out" }, 0);
      tl.set(p, { visibility: "visible", opacity: 1, pointerEvents: "auto" }, 0.05);
      const f = items(p);
      if (f.length) tl.fromTo(f, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: D.in, stagger: stag(f.length), ease: "power3.out" }, 0.1);
    }
    function close() {
      if (!st.open) return;
      const p = panel(st.key), f = items(p);
      kill(); aria(null);
      const tl = (st.tl = gsap.timeline({ onComplete() { st.open = false; st.key = null; reset(); el.dispatchEvent(new CustomEvent("fx:close")); } }));
      if (f.length) tl.to(f, { autoAlpha: 0, y: -4, duration: D.out * 0.7, ease: "power2.in" }, 0);
      tl.to(box, { height: 0, duration: D.close, ease: "power2.in" }, 0.05);
      if (veil.length) tl.to(veil, { autoAlpha: 0, duration: D.bout, ease: "power2.out" }, 0);
    }
    function swap(from, to) {
      const dir = idx(to) > idx(from) ? 1 : -1;
      const a = panel(from), b = panel(to), fa = items(a), fb = items(b);
      kill(); reset();
      const h = measure(b);
      gsap.set(b, { visibility: "hidden" });
      gsap.set(a, { visibility: "visible", opacity: 1, pointerEvents: "auto" });
      if (fa.length) gsap.set(fa, { autoAlpha: 1 });
      if (veil.length) gsap.set(veil, { autoAlpha: 1 });
      st.key = to; aria(to);
      const tl = (st.tl = gsap.timeline());
      if (fa.length) tl.to(fa, { autoAlpha: 0, x: -dir * shift, duration: D.out, ease: "power2.in" }, 0);
      tl.set(a, { visibility: "hidden", opacity: 0, pointerEvents: "none" }, D.out);
      tl.to(box, { height: h, duration: D.morph, ease: "power3.out" }, 0.05);
      tl.set(b, { visibility: "visible", opacity: 1, pointerEvents: "auto" }, D.out * 0.5);
      if (fb.length) tl.fromTo(fb, { autoAlpha: 0, x: dir * shift }, { autoAlpha: 1, x: 0, duration: D.in, stagger: stag(fb.length), ease: "power3.out" }, D.out * 0.6);
    }
    const clear = () => { clearTimeout(st.enter); clearTimeout(st.leave); };
    const ac = new AbortController(), on = { signal: ac.signal };
    toggles.forEach((t) => {
      if (hover) t.addEventListener("mouseenter", () => { clear(); st.enter = setTimeout(() => open(t.dataset.key), st.open ? 0 : enterMs); }, on);
      t.addEventListener("click", () => (st.open && st.key === t.dataset.key ? close() : open(t.dataset.key)), on);
    });
    if (hover) {
      el.addEventListener("mouseleave", () => { clear(); st.leave = setTimeout(close, leaveMs); }, on);
      el.addEventListener("mouseenter", () => clearTimeout(st.leave), on);
    }
    backdrop?.addEventListener("click", close, on);
    addEventListener("keydown", (e) => e.key === "Escape" && close(), on);
    return () => {
      ac.abort(); clear(); kill();
      gsap.set([box, ...panels, ...veil], { clearProps: "all" });
      panels.forEach((p) => { const f = items(p); if (f.length) gsap.set(f, { clearProps: "all" }); });
      toggles.forEach((t) => t.removeAttribute("aria-expanded"));
    };
  });
})();
