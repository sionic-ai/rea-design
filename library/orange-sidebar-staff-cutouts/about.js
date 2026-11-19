// About — floats the photos around the story section at different speeds with rellax (same library as the original .js-rellax)
(() => {
  if (!window.Rellax || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const start = () => new Rellax(".t-story__float");
  document.readyState === "complete" ? start() : addEventListener("load", start, { once: true });
})();
