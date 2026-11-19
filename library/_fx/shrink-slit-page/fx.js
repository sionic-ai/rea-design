// Clicking a same-site link shrinks the current screen in place to .75 while blurring, and the new page opens full-screen from a gap polygon at bottom center — Brand page transition
(() => {
  const KEY = "fx-ssp-at";
  const SHUT = "polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 100%, 100% 100%, 100% 0%)";
  const OPEN = "polygon(0% 0%, 0% 100%, 45% 100%, 45% 50%, 55% 50%, 55% 50%, 45% 50%, 45% 100%, 100% 100%, 100% 0%)";
  let owner = null;
  kfFx.register("shrink-slit-page", (el, { options, reduce }) => {
    if (reduce || (owner && owner.isConnected)) return;
    owner = el;
    const dur = +(options.dur ?? 1.2), scale = +(options.scale ?? 0.75), out = +(options.out ?? dur);
    const ease = kfFx.ease(options.ease || "0.75,0,0.25,1", "power3.inOut");
    let at = 0;
    try { at = +sessionStorage.getItem(KEY) || 0; sessionStorage.removeItem(KEY); } catch (e) {}
    let opening = null;
    if (at && Date.now() - at < 6000) {
      opening = gsap.fromTo(el, { clipPath: SHUT }, { clipPath: OPEN, duration: dur, ease, onComplete: () => gsap.set(el, { clearProps: "clipPath" }) });
    }
    let busy = false;
    const click = (e) => {
      if (busy || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || (a.getAttribute("href") || "").startsWith("#")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      e.preventDefault();
      busy = true;
      const y = scrollY;
      gsap.set(el, { position: "fixed", top: -y, left: 0, right: 0, transformOrigin: `center calc(${y}px + 50vh)`, pointerEvents: "none" });
      gsap.to(el, { opacity: 0, scale, duration: out, ease, onComplete: () => { try { sessionStorage.setItem(KEY, String(Date.now())); } catch (e) {} location.href = u.href; } });
    };
    document.addEventListener("click", click);
    const back = (e) => { if (e.persisted) location.reload(); };
    addEventListener("pageshow", back);
    return () => {
      document.removeEventListener("click", click);
      removeEventListener("pageshow", back);
      opening?.kill();
      if (owner === el) owner = null;
      gsap.set(el, { clearProps: "position,top,left,right,transform,transformOrigin,opacity,pointerEvents,clipPath" });
    };
  });
})();
