(() => {
  kfFx.register("glass-row-follow", (el, { options, reduce, hover }) => {
    if (!hover) return;
    let bar = el.querySelector('[data-fx-part="bar"]'), made = false;
    if (!bar) { bar = document.createElement("span"); bar.className = "fx-bar"; el.prepend(bar); made = true; }
    const move = +(options.move ?? 0.35), inD = +(options.in ?? 0.3), outD = +(options.out ?? 0.15);
    const rows = () => { const r = [...el.querySelectorAll('[data-fx-part="row"]')]; return r.length ? r : [...el.querySelectorAll("li")]; };
    let on = false;
    const top = (row) => { const a = row.getBoundingClientRect(), b = el.getBoundingClientRect(); return a.top - b.top + (a.height - bar.offsetHeight) / 2; };
    const go = (row) => {
      const y = top(row);
      if (on) gsap.to(bar, { y, duration: reduce ? 0 : move, ease: "expo", overwrite: "auto" });
      else { on = true; gsap.set(bar, { y }); gsap.to(bar, { autoAlpha: 1, duration: reduce ? 0 : inD, ease: "expo", overwrite: "auto" }); }
    };
    const leave = () => { if (!on) return; on = false; gsap.to(bar, { autoAlpha: 0, duration: reduce ? 0 : outD, ease: "power1", overwrite: "auto" }); };
    const onOver = (e) => {
      const row = rows().find((r) => r.contains(e.target));
      if (!row) return;
      if (row.matches('[data-fx-part="skip"]') || row.querySelector('[data-fx-part="skip"]')) leave(); else go(row);
    };
    el.addEventListener("mouseover", onOver);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mouseover", onOver); el.removeEventListener("mouseleave", leave); gsap.killTweensOf(bar); if (made) bar.remove(); else gsap.set(bar, { clearProps: "all" }); };
  });
})();
