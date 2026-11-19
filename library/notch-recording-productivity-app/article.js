// Blog post: copy-link button — pressing it copies the URL and switches to a check icon for 4 seconds (original setTimeout 4000, color unchanged)
(() => {
  const b = document.querySelector("[data-copy]");
  if (!b) return;
  const link = b.innerHTML;
  const check = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>';
  let t;
  b.addEventListener("click", () => {
    (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.resolve()).catch(() => {});
    b.innerHTML = check;
    clearTimeout(t);
    t = setTimeout(() => (b.innerHTML = link), 4000);
  });
})();
