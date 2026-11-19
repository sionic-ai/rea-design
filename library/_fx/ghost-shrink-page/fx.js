// Clicking a same-site link shrinks the old screen’s clone to .94 and darkens it while the curtain covers from below, and in the new document the body rises from below to cover the curtain — Brand page transition
(() => {
  const KEY = "fx-gsp-at";
  // One slider per document — only the first attached element handles links (later ones stay quiet)
  let owner = null;
  kfFx.register("ghost-shrink-page", (el, { options, reduce }) => {
    if (reduce || (owner && owner.isConnected)) return;
    owner = el;
    const shrink = +(options.shrink ?? 0.94), dark = +(options.dark ?? 0.4), out = +(options.out ?? 0.6), dur = +(options.in ?? 0.8), hold = +(options.hold ?? 0.5);
    const curtain = document.createElement("div");
    curtain.className = "fx-gsp-curtain";
    curtain.setAttribute("aria-hidden", "true");
    document.body.append(curtain);
    gsap.set(curtain, { yPercent: 100 });
    let at = 0;
    try { at = +sessionStorage.getItem(KEY) || 0; sessionStorage.removeItem(KEY); } catch {}
    if (at && Date.now() - at < 6000) {
      const root = document.documentElement;
      root.classList.add("fx-gsp-entering");
      gsap.set(curtain, { yPercent: 0 });
      gsap.fromTo(el, { y: innerHeight }, {
        y: 0, duration: dur, ease: "power3.out", delay: Math.max(0, hold - (Date.now() - at) / 1000),
        onComplete: () => { root.classList.remove("fx-gsp-entering"); gsap.set(curtain, { yPercent: 100 }); gsap.set(el, { clearProps: "transform" }); },
      });
    }
    let busy = false;
    const click = (e) => {
      if (busy || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.getAttribute("href").startsWith("#")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      e.preventDefault();
      busy = true;
      const ghost = document.createElement("div"), shade = document.createElement("div"), copy = el.cloneNode(true);
      ghost.className = "fx-gsp-ghost"; shade.className = "fx-gsp-dark";
      copy.removeAttribute("data-fx");
      copy.style.cssText = `position:absolute;left:0;right:0;top:${el.getBoundingClientRect().top}px`;
      ghost.append(copy, shade);
      document.body.append(ghost);
      el.style.visibility = "hidden";
      gsap.set(curtain, { visibility: "visible" });
      gsap.to(ghost, { scale: shrink, duration: out, ease: "power3.inOut" });
      gsap.to(shade, { opacity: dark, duration: out, ease: "power2.out" });
      gsap.to(curtain, { yPercent: 0, duration: out, ease: "power3.inOut", onComplete: () => { try { sessionStorage.setItem(KEY, String(Date.now())); } catch {} location.href = u.href; } });
    };
    document.addEventListener("click", click);
    const back = (e) => { if (e.persisted) location.reload(); };
    addEventListener("pageshow", back);
    return () => {
      document.removeEventListener("click", click);
      removeEventListener("pageshow", back);
      curtain.remove();
      if (owner === el) owner = null;
      el.style.visibility = "";
      gsap.set(el, { clearProps: "transform" });
    };
  });
})();
