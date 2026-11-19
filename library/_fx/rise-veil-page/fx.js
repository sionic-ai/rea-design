// Transition: clicking a same-site link fills a curtain from the bottom with scaleY 0→1 while the body is pushed up by shift, and once it is full the page moves on.
// The arriving page has its sheet lift with the top as the axis, and the body rises into place from below by shift — Brand TransitionRouter (1s power2.inOut, body ∓50vh)
(() => {
  const KEY = "fx-rise-veil-page";
  kfFx.register("rise-veil-page", (root, { options, reduce }) => {
    const dur = reduce ? 0 : +(options.dur ?? 1), shift = options.shift ?? "50vh";
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    // Uncover handled separately — Person site: cover .6s power1.inOut · uncover rests .2s then .8s power4.out
    const rdur = reduce ? 0 : +(options.reveal ?? dur), rease = kfFx.ease(options["reveal-ease"] || options.ease || "power2.inOut", "power2.inOut"), rdelay = +(options.delay ?? 0);
    const ac = new AbortController(), on = { signal: ac.signal };
    // Put on body so the curtain isn’t pushed along while the content moves
    const veil = document.createElement("div");
    veil.className = "fx-rise-veil-page__veil";
    veil.setAttribute("aria-hidden", "true");
    document.body.append(veil);
    let came = false;
    try { came = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch (e) {}
    let entry = null;
    if (came && rdur) {
      gsap.set(veil, { scaleY: 1, transformOrigin: "50% 0%" });
      entry = gsap.timeline({ delay: rdelay, onComplete: () => gsap.set(root, { clearProps: "transform" }) })
        .to(veil, { scaleY: 0, duration: rdur, ease: rease }, 0)
        .fromTo(root, { y: shift }, { y: 0, duration: rdur, ease: rease }, 0);
    }
    addEventListener("pageshow", (e) => e.persisted && (gsap.set(root, { clearProps: "transform" }), gsap.set(veil, { scaleY: 0 })), on);
    let leaving = null;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || !root.isConnected || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.origin !== location.origin || a.href.split("#")[0] === location.href.split("#")[0]) return;
      e.preventDefault();
      if (leaving) return;
      try { sessionStorage.setItem(KEY, "1"); } catch (err) {}
      root.dispatchEvent(new CustomEvent("fx:leave", { bubbles: true }));
      if (!dur) { location.href = a.href; return; }
      gsap.set(veil, { scaleY: 0, transformOrigin: "50% 100%" });
      leaving = gsap.timeline({ onComplete: () => (location.href = a.href) })
        .to(veil, { scaleY: 1, duration: dur, ease }, 0)
        .to(root, { y: `-${shift}`, duration: dur, ease }, 0);
    }, on);
    return () => { ac.abort(); entry?.kill(); leaving?.kill(); gsap.set(root, { clearProps: "transform" }); veil.remove(); };
  });
})();
