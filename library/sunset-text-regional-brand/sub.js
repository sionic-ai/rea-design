// Sub-pages: fish and sentence graphic fills, yellow sea map, FAQ expand (height .4s power2.out, the + rotates 360° into a −), shop type tabs.
(() => {
  document.querySelectorAll("[data-fish]").forEach((el) => (el.innerHTML = NM.fish(+el.dataset.fish)));
  document.querySelectorAll("[data-emblem]").forEach((el) => (el.outerHTML = NM.emblem()));

  // Yellow sea chart: island ridges on a grid with markers per fish type (the original is a single image)
  const sea = document.getElementById("sea");
  if (sea) {
    const fishAt = [[300, 70, "var(--site-navy)", "Type 4"], [420, 120, "var(--site-black)", "Type 1"], [300, 170, "var(--site-crimson)", "Type 2"], [180, 220, "var(--site-gold)", "Type 3"], [330, 260, "var(--site-navy)", "Type 4"], [230, 300, "var(--site-crimson)", "Type 2"], [380, 330, "var(--site-black)", "Type 1"]];
    let grid = "";
    for (let x = 0; x <= 520; x += 52) grid += `<line x1="${x}" y1="0" x2="${x}" y2="380" style="stroke:var(--site-sea-line)" stroke-opacity=".35"/>`;
    for (let y = 0; y <= 380; y += 54) grid += `<line x1="0" y1="${y}" x2="520" y2="${y}" style="stroke:var(--site-sea-line)" stroke-opacity=".35"/>`;
    sea.innerHTML = `<svg viewBox="0 0 520 380" aria-hidden="true"><rect width="520" height="380" style="fill:var(--site-sea)"/>${grid}
      <path d="M0 40 Q60 60 90 120 Q120 170 70 230 Q40 270 0 280Z" style="fill:var(--site-sea-land)"/><path d="M150 330 l20 -8 l14 10 l-18 8z M200 300 l12 -4 l8 6 l-12 4z M250 280 l8 -3 l6 4 l-8 3z M470 40 l18 -6 l10 10 l-16 6z" style="fill:var(--site-sea-land)"/>
      ${fishAt.map(([x, y, c, t]) => `<g transform="translate(${x} ${y})"><path d="M-30 0 Q-10 -12 18 -6 L30 -14 L28 0 L30 14 L18 6 Q-10 12 -30 0Z" style="fill:${c};stroke:var(--kf-on-accent)" stroke-width="1.5"/><rect x="-26" y="12" width="${t.length * 11 + 10}" height="16" rx="8" style="fill:${c}"/><text x="-21" y="24" font-weight="900" font-size="10" style="fill:var(--kf-on-accent);font-family:var(--kf-font-display)">${t}</text></g>`).join("")}</svg>`;
  }

  document.querySelectorAll(".faq dt").forEach((dt) =>
    dt.addEventListener("click", () => {
      const dd = dt.nextElementSibling;
      const open = !dt.classList.contains("is-open");
      dt.classList.toggle("is-open", open);
      // Original: opens and closes the height with .4s power2.out
      const dur = NM.reduced ? 0 : 0.4;
      gsap.killTweensOf(dd);
      if (open) gsap.fromTo(dd, { height: 0 }, { height: dd.scrollHeight, duration: dur, ease: "power2.out", onComplete: () => { gsap.set(dd, { height: "auto" }); ScrollTrigger.refresh(); } });
      else gsap.fromTo(dd, { height: dd.offsetHeight }, { height: 0, duration: dur, ease: "power2.out", onComplete: () => ScrollTrigger.refresh() });
    })
  );

  const tabs = document.querySelectorAll(".tabs a");
  const show = (k) => {
    tabs.forEach((b) => (b.dataset.tab === k ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
    document.querySelectorAll(".shop").forEach((s) => s.classList.toggle("is-off", s.dataset.type !== k));
    ScrollTrigger.refresh();
  };
  tabs.forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); show(b.dataset.tab); }));
  if (tabs.length) show("food");
})();
