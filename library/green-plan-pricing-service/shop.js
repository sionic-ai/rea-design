/* Store finder — choosing region and conditions changes the count (the original uses a search API, here a placeholder that narrows by the number of selections) */
(() => {
  const count = document.querySelector("[data-sh-count]");
  if (!count) return;
  const prefs = [...document.querySelectorAll(".sh-pref")];
  const checks = [...document.querySelectorAll(".sh-chk")];
  const update = () => {
    const p = prefs.filter((b) => b.classList.contains("is-on")).length;
    const c = checks.filter((i) => i.getAttribute("aria-checked") === "true").length;
    count.textContent = Math.max(1, (p ? p * 4 : 93) - c * 3);
  };
  prefs.forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); b.classList.toggle("is-on"); b.setAttribute("aria-pressed", b.classList.contains("is-on")); update(); }));
  checks.forEach((i) => i.addEventListener("click", (e) => { e.preventDefault(); i.setAttribute("aria-checked", i.getAttribute("aria-checked") !== "true"); update(); }));
})();
