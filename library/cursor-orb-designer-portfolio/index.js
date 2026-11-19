// First page — once the loader clears (fx:done), the header, title, three works and beads rise in turn, then the sections below switch on as they come into view
(() => {
  const root = document.documentElement;
  const hero = document.querySelector(".ab-hero");
  const head = document.querySelector(".ab-head");
  let opened = false;
  const open = () => {
    if (opened) return;
    Promise.all([abSite.ready, abSite.revealed]).then(() => {
      if (opened) return;
      opened = true;
      root.classList.add("ab-entered");
      hero?.classList.add("is-in");
      head?.classList.add("is-glass");
      abSite.watch();
    });
  };
  document.addEventListener("fx:done", (e) => { if (e.target.closest?.(".ab-loader")) open(); });
  // Open at 6.5 seconds even if loader or font signals break
  setTimeout(open, 6500);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) open();
})();
