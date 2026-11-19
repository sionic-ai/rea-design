// Clicking a same-site link: an accent-color curtain covers the screen from the top (scaleY, top origin), the destination page name springs up from below with elasticity, then navigation happens.
// The incoming page opens covered, the name fades and the curtain lifts toward the bottom edge.
// Original values (Brand page transition): cover .7s expo.inOut · name 110% → 0 .6s elastic.out(1, .55) .22s later · exit name .28s power2.in, curtain .75s expo.inOut .12s later.
(() => {
  const KEY = "fx-sheet-label-page";
  kfFx.register("sheet-label-page", (el, { options, reduce }) => {
    const DUR = +(options.dur ?? 0.7), LABEL = +(options["label-dur"] ?? 0.6), OUT = +(options.out ?? 0.75), AT = +(options.at ?? 0.22);
    const inOut = kfFx.ease(options.ease || "0.87,0,0.13,1", "expo.inOut"), land = options.land || "elastic.out(1, 0.55)";
    el.setAttribute("aria-hidden", "true");
    let sheet = el.querySelector('[data-fx-part="sheet"]'), label = el.querySelector('[data-fx-part="label"]');
    const made = [];
    if (!sheet) { sheet = document.createElement("div"); sheet.dataset.fxPart = "sheet"; el.append(sheet); made.push(sheet); }
    if (!label) {
      const mask = document.createElement("div"); mask.dataset.fxPart = "mask";
      label = document.createElement("span"); label.dataset.fxPart = "label"; mask.append(label); el.append(mask); made.push(mask);
    }
    const setName = (t) => { label.textContent = t; label.style.setProperty("--fx-chars", Math.max(4, t.length)); };
    // Arriving page — starts covered and walks in
    let enter = null;
    const came = sessionStorage.getItem(KEY);
    if (came != null) {
      sessionStorage.removeItem(KEY);
      setName(came);
      if (!reduce) {
        el.dataset.active = "true";
        gsap.set(sheet, { scaleY: 1, transformOrigin: "50% 100%" });
        gsap.set(label, { yPercent: 0, opacity: 1 });
        // Notify after it has fully lifted — running the heavy hero entrance (3D etc.) overlapped with the lift makes the lift stutter
        enter = gsap.timeline({ delay: +(options.hold ?? 0.1), onComplete: () => { el.dataset.active = "false"; gsap.set(sheet, { scaleY: 0 }); dispatchEvent(new CustomEvent("fx:sheet-label-page:shown")); } })
          .to(label, { opacity: 0, duration: 0.28, ease: "power2.in" }, 0)
          .fromTo(sheet, { scaleY: 1, transformOrigin: "50% 100%" }, { scaleY: 0, duration: OUT, ease: inOut }, 0.12);
      }
    }
    let busy = false;
    const same = (a) => {
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/.test(href)) return false;
      const u = new URL(a.href, location.href);
      return u.origin === location.origin && !(u.pathname === location.pathname && u.hash);
    };
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!same(a)) return;
      e.preventDefault();
      if (busy) return;
      busy = true;
      const name = a.dataset.pageLabel || a.textContent.trim().split("\n")[0].trim() || "";
      setName(name);
      const go = () => { sessionStorage.setItem(KEY, name); location.href = a.href; };
      if (reduce) return go();
      el.dataset.active = "true";
      gsap.timeline({ onComplete: go })
        .fromTo(sheet, { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: DUR, ease: inOut }, 0)
        .fromTo(label, { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: LABEL, ease: land }, AT);
    };
    // Clear the cover on return via Back so it doesn’t stay covered (bfcache)
    const onShow = (e) => { if (e.persisted) { busy = false; el.dataset.active = "false"; gsap.set(sheet, { scaleY: 0 }); } };
    document.addEventListener("click", onClick);
    addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", onClick); removeEventListener("pageshow", onShow);
      enter?.kill(); made.forEach((m) => m.remove()); el.dataset.active = "false";
    };
  });
})();
