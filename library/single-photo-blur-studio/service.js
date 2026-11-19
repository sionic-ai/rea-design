// Aligns the three-branch line to the right end of the ”Services” menu text — the menu scatters with screen width, so its position shifts
(() => {
  const fit = () => {
    const a = document.querySelector('.b-nav [data-nav="services"]');
    if (!a) return;
    const b = a.getBoundingClientRect();
    document.documentElement.style.setProperty("--svc-x", `${Math.round(b.right - 15)}px`);
  };
  fit();
  addEventListener("resize", fit);
})();
