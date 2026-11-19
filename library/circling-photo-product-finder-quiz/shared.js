// Shared by both pages — the chair silhouette drawing set, the bottom-right three-dot drawer, and inner link transitions (the original moves within the app, so it passes with no loader curtain).
(() => {
  // Three of our own silhouettes to lay in the chair cutout slot: wheeled chair, shell chair, lounge chair. When a photo arrives, remove the svg and <img> puts in
  const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <symbol id="vf-chair-task" viewBox="0 0 100 100"><rect x="30" y="6" width="40" height="40" rx="11"/><rect x="47" y="44" width="6" height="8"/><rect x="18" y="42" width="6" height="16" rx="2"/><rect x="76" y="42" width="6" height="16" rx="2"/><ellipse cx="50" cy="58" rx="27" ry="8.5"/><rect x="47.5" y="64" width="5" height="16"/><path d="M50 78 13 86l1 3 36-7 36 7 1-3zM50 78 29 94l2 2 19-14 19 14 2-2zM48.5 80h3v13h-3z"/><circle cx="13" cy="89.5" r="3.5"/><circle cx="87" cy="89.5" r="3.5"/><circle cx="30" cy="96" r="3.5"/><circle cx="70" cy="96" r="3.5"/><circle cx="50" cy="95" r="3.5"/></symbol>
    <symbol id="vf-chair-shell" viewBox="0 0 100 100"><path d="M22 26c18-11 38-11 56 0l-3 34c-16 9-34 9-50 0z"/><path d="M33 62h4l-7 34h-3zM63 62h4l6 34h-3zM44 66h3l-2 30h-3zM53 66h3l2 30h-3z"/><path d="M30 80h40v2.5H30z"/></symbol>
    <symbol id="vf-chair-lounge" viewBox="0 0 100 100"><path d="M24 14h52a9 9 0 0 1 9 9v34H15V23a9 9 0 0 1 9-9z"/><rect x="8" y="40" width="16" height="34" rx="7"/><rect x="76" y="40" width="16" height="34" rx="7"/><rect x="20" y="54" width="60" height="20" rx="6"/><path d="M14 74h5l-2 14h-3zM81 74h5v14h-3z"/></symbol>
    <symbol id="vf-chair-top-task" viewBox="0 0 100 100"><rect x="29" y="10" width="42" height="14" rx="6"/><rect x="26" y="22" width="48" height="34" rx="13"/><rect x="19" y="26" width="6" height="24" rx="3"/><rect x="75" y="26" width="6" height="24" rx="3"/><path d="m48.6 44 2.8 0 0 48-2.8 0zM50 44l-36 20-1.4-2.4L48.6 41.6zM50 44l36 20 1.4-2.4L51.4 41.6zM50 44 26 86l-2.4-1.4 24-42zM50 44l24 42 2.4-1.4-24-42z"/><circle cx="12" cy="64" r="4"/><circle cx="88" cy="64" r="4"/><circle cx="24" cy="88" r="4"/><circle cx="76" cy="88" r="4"/><circle cx="50" cy="94" r="4"/></symbol>
    <symbol id="vf-chair-top-shell" viewBox="0 0 100 100"><path d="M22 18c10-6 46-6 56 0 4 14 2 34-6 44-12 6-32 6-44 0-8-10-10-30-6-44z"/><path d="M49 50h2v40h-2zM50 50l-30 26-1.3-1.5 30-26zM50 50l30 26 1.3-1.5-30-26z"/><circle cx="19" cy="76" r="3.6"/><circle cx="81" cy="76" r="3.6"/><circle cx="50" cy="91" r="3.6"/></symbol>
    <symbol id="vf-chair-top-lounge" viewBox="0 0 100 100"><path d="M18 14h64a8 8 0 0 1 8 8v52a10 10 0 0 1-10 10H20a10 10 0 0 1-10-10V22a8 8 0 0 1 8-8z"/><rect x="24" y="26" width="52" height="46" rx="10" fill-opacity=".55"/></symbol>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", SPRITE);
  const KINDS = ["task", "task", "shell", "task", "lounge", "task", "shell"];
  const TOP = ["top-task", "top-task", "top-shell", "top-task", "top-lounge", "top-task", "top-shell", "top-task"];
  document.querySelectorAll(".vf-cut").forEach((cut, i) => {
    if (cut.querySelector("svg, img")) return;
    const kind = cut.dataset.kind || (cut.closest(".vf-ring") ? TOP[i % TOP.length] : KINDS[i % KINDS.length]);
    cut.insertAdjacentHTML("beforeend", `<svg aria-hidden="true"><use href="#vf-chair-${kind}"/></svg>`);
  });

  // Three-dot drawer — pressing opens the bubble, and clicking the backdrop or Esc closes it
  document.querySelectorAll(".vf-foot").forEach((foot) => {
    const dots = foot.querySelector(".vf-foot__dots");
    const overlay = foot.querySelector(".vf-foot__overlay");
    const set = (open) => {
      foot.classList.toggle("is-open", open);
      dots.setAttribute("aria-expanded", String(open));
    };
    dots.addEventListener("click", () => set(!foot.classList.contains("is-open")));
    overlay.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  });

  // Inner navigation — marks the next page to skip the loader curtain, and moves after the leaving motion (wait ms)
  window.vfGo = (href, wait = 0) => {
    sessionStorage.setItem("vf-nav", String(Date.now() + wait));
    if (!wait) { location.href = href; return; }
    setTimeout(() => { location.href = href; }, wait);
  };
  document.querySelectorAll("a[data-vf-link]").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
      e.preventDefault();
      window.vfGo(a.getAttribute("href"), +(a.dataset.vfLink || 0));
    });
  });
  // A page restored via the back button (bfcache) is exactly as it was when left, so open it fresh
  addEventListener("pageshow", (e) => { if (e.persisted) { sessionStorage.setItem("vf-nav", String(Date.now())); location.reload(); } });
})();
