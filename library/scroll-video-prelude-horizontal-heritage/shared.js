(() => {
  const wrapper = document.getElementById("wrapper");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Letter entrance and roll need per-letter delays, so wrap each character one by one (blanks stay as a single cell too)
  function split(root = document) {
    root.querySelectorAll("[data-letters]").forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      const text = el.textContent.trim();
      el.textContent = "";
      [...text].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "ct-l";
        s.style.setProperty("--i", i);
        s.textContent = ch;
        el.appendChild(s);
      });
    });
  }
  split();

  // When going to another page on the same site, a background-color curtain covers from below in 1s, then navigates (original is-loadingStart)
  document.addEventListener("click", (e) => {
    const a = e.target.closest(".js-page-transition");
    if (!a) return;
    const url = a.getAttribute("href");
    if (!url) return;
    e.preventDefault();
    wrapper.classList.add("is-cover-in");
    setTimeout(() => { location.href = url; }, reduce ? 0 : 1000);
  });
  window.addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  window.ctSite = { split, reduce };
})();
