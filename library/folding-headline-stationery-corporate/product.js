// Product list — left filter: step 1 (ways to browse) → step 2 (tap a category header to expand its children, at 1000 or below only the expanded ones remain) → back. On phones the drawer opens via ‹Browse by filter›
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const mobile = matchMedia("(max-width: 1000px)");
  const shapes = ["Ballpoint pen · silver body", "Mechanical pencil · Translucent blue", "Ballpoint pen · Black rubber grip", "Highlighter · Pink", "Ballpoint Pen · Navy", "Pencil · Wood grain", "Felt pen · Black", "Pencil lead case · Black"];
  $("#tb-grid").innerHTML = Array.from({ length: 32 }, (_, i) => `
    <li class="pc-item"><a href="#">${i % 5 === 0 ? '<span class="new">NEW</span>' : ""}<span class="wf-img" data-label="${shapes[i % shapes.length]} Cutout · angled · pale gray background · square"></span>
      <p class="nm">Product name ${String(i + 1).padStart(2, "0")}${i % 3 === 0 ? " Long name that wraps to two lines" : ""}</p><p class="en">Product Name ${String(i + 1).padStart(2, "0")}</p></a></li>`).join("");

  const nav = $(".tb-product .nav");
  $$(".lv1-btn").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    nav.classList.add("is-lv2");
    $$(".group").forEach((g) => g.classList.toggle("is-active", g.dataset.menu === b.dataset.menu));
  }));
  $$(".g-head").forEach((h) => h.addEventListener("click", () => {
    const item = h.closest(".g");
    if (mobile.matches) {
      const open = item.classList.contains("is-open");
      $$(".g", item.parentElement).forEach((g) => { g.classList.toggle("is-hide", !open && g !== item); g.classList.remove("is-open"); });
      item.classList.toggle("is-open", !open);
    } else item.classList.toggle("is-open");
  }));
  $(".back").addEventListener("click", () => {
    nav.classList.remove("is-lv2");
    $$(".group").forEach((g) => g.classList.remove("is-active"));
    $$(".g").forEach((g) => g.classList.remove("is-open", "is-hide"));
  });
  $(".side-open").addEventListener("click", () => document.body.classList.add("is-side-open"));
  $(".side-close").addEventListener("click", () => document.body.classList.remove("is-side-open"));
})();
