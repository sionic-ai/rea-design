// News — draws the list cells, and pressing Grid / List changes the list’s type after .15s (opacity 0), then brightens again and replays the cell entrance from the start.
// The chosen type is remembered until the next visit (the original uses IndexedDB, this copy uses localStorage)
(() => {
  const NS = (window.NS = window.NS || { views: {} });
  const PICS = ["Open book spread · Black-and-white photo", "Snack box · from above on gray background", "Postcard bundle · white background", "Black-and-white pattern poster · front view", "Potted plant illustration · yellow background", "Calendar set · White wall",
    "Person in the kitchen · natural light", "Person in front of shelf · bright interior", "Exterior wall corner · shade", "Poster · gray background", "Book cover · white background", "Paper craft · white background"];
  const TITLES = ["Your news title goes here, about two lines: the work taken on and its result in one sentence", "Your news title here — sales start notice", "Add a one-line news title here.", "Your news title here — exhibition and event notice"];
  const KEY = "ns-news-layout";
  const item = (i) => `<div class="ns-news__item" data-animate><a href="#"><span class="ns-news__pic ns-pic"><span class="wf-img" data-label="${PICS[i % PICS.length]} · Landscape 4:3"></span></span><span class="ns-news__txt"><span class="ns-news__date">0000.00.00</span><span class="ns-news__title">${TITLES[i % TITLES.length]}</span></span></a></div>`;
  let timer = 0;
  NS.views.news = {
    init(c) {
      const list = c.querySelector("[data-news]");
      const btns = [...c.querySelectorAll(".ns-layout button")];
      if (!list) return;
      if (!list.childElementCount) list.innerHTML = Array.from({ length: +list.dataset.news }, (_, i) => item(i)).join("");
      const apply = (v) => {
        list.dataset.layout = v;
        btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.layout === v)));
      };
      let saved = "grid";
      try { saved = localStorage.getItem(KEY) || "grid"; } catch {}
      apply(saved);
      btns.forEach((b) => b.addEventListener("click", () => {
        const v = b.dataset.layout;
        if (v === list.dataset.layout) return;
        try { localStorage.setItem(KEY, v); } catch {}
        list.style.opacity = "0";
        clearTimeout(timer);
        timer = setTimeout(() => {
          list.querySelectorAll('[data-animate="active"]').forEach((n) => n.setAttribute("data-animate", ""));
          apply(v);
          list.style.opacity = "1";
          NS.watchAnimate?.(list);
          NS.lenis?.resize();
        }, 150);
      }));
    },
    destroy() { clearTimeout(timer); },
  };
})();
