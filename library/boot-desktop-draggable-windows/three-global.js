// three.cjs is the CommonJS build so it needs exports to load — load this one file before three.cjs and it is read as window.THREE once everything has loaded.
// (Inline <script> The reason for using a file instead: the empty-element test in library-fx-check is the demo’s <script src> just carry it over)
(() => {
  const exp = (window.exports = window.exports || {});
  if (!("THREE" in window)) Object.defineProperty(window, "THREE", { get: () => exp, configurable: true });
})();
