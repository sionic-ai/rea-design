// Work list — built from cell data. The original shuffles cells each time it opens and picks big cells (2×2) at 25%, but this copy always keeps the same positions so it works well as a frame.
(() => {
  const grid = document.querySelector(".lm-works__grid");
  if (!grid) return;
  const more = document.querySelector(".lm-works__more");
  const B = "brand", D = "digital", V = "ventures";
  const TILES = [
    { n: "Work name 1", t: [B, D, V], l: "Beige synthesizer still life against an olive wall · soft side light · square" },
    { n: "Work name 2", t: [B, D], l: "Large pink type poster · flat graphic · square" },
    { n: "Work name 3", t: [B, V], l: "Red background instant camera ad · bold primary colors · square", d: 1 },
    { n: "Work name 4", t: [D], l: "Person standing in a flower field · overcast daylight · square" },
    { n: "Work name 5", t: [B, D], l: "Smiling face close-up · Backlit · Square", v: 1 },
    { n: "Work name 6", t: [V], l: "Man in front of plants and instruments · warm interior · square", d: 1 },
    { n: "Work name 7", t: [B, D, V], l: "Rainbow bold lettering pattern · flat primary colors · square" },
    { n: "Work name 8", t: [B], l: "White handwritten logo on black · strong contrast · square", p: 0 },
    { n: "Work name 9", t: [B, D], l: "Vertical text poster on orange background · flat · square" },
    { n: "Work name 10", t: [D, V], l: "Shiny silver round character 3D video · white background · square", v: 1 },
    { n: "Work name 11", t: [B], l: "Yellow background hand-drawn illustration · flat · square" },
    { n: "Work name 12", t: [B, D], l: "White line drawing of a machine on black background · Square", d: 1 },
    { n: "Work name 13", t: [D], l: "Navy-background sneaker membership card · Square" },
    { n: "Work name 14", t: [B, V], l: "Person in a white shirt, upper body · dark interior · square" },
    { n: "Work name 15", t: [D], l: "App screen mockup on black · square", v: 1 },
    { n: "Work name 16", t: [B, D], l: "Sky-blue name tag card · Flat · Square" },
    { n: "Work name 17", t: [B], l: "Child’s hand-drawn character poster · white background · square", p: 0 },
    { n: "Work name 18", t: [V], l: "Two workers in uniforms inside a factory · fluorescent light · square", d: 1 },
    { n: "Work name 19", t: [B, D, V], l: "Pile of product shipping boxes · brown paper · square" },
    { n: "Work name 20", t: [D], l: "Yellow background black dot pattern video · square", v: 1 },
    { n: "Work name 21", t: [B, D], l: "Green can pattern label close-up · Square" },
    { n: "Work name 22", t: [B], l: "Red signboard on a night street · neon · square" },
    { n: "Work name 23", t: [D, V], l: "Black background white dot flow logo · square" },
    { n: "Work name 24", t: [B, D], l: "Person standing on a sandy beach · clear daytime · square" },
  ];
  const PAGE = 12;
  const tagNow = () => { const t = new URLSearchParams(location.search).get("tag"); return [B, D, V].includes(t) ? t : null; };
  const isMobile = () => innerWidth < 768;
  let shown = PAGE, loading = false, ready = false;
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>';

  const items = TILES.map((d, r) => {
    const li = document.createElement("li");
    if (d.d) li.classList.add("is-double");
    li.innerHTML = `<div data-lm-fade data-lm-dur="400" data-lm-delay="${(r % 4) * 60}" data-lm-margin="0px">
        <a class="lm-case" href="detail.html">
          <div class="wf-img lm-case__ph${d.v ? " wf-video" : ""}" data-label="${d.l}${d.v ? " · Auto-loop video" : ""}">${d.v ? '<video class="lm-fill" src="media/loop-1x1.mp4" autoplay muted loop playsinline aria-hidden="true"></video>' : ""}</div>
          <div class="t-label lm-case__over"><p>${d.n}</p><div class="lm-case__view"><span>View</span>${arrow}</div></div>
        </a>
      </div>`;
    grid.append(li);
    return { li, d, a: li.querySelector(".lm-case"), clear: null };
  });

  const loaderMark = window.lmMark && (() => {
    more.querySelector(".lm-works__loader").innerHTML = window.lmMarkSvg;
    return window.lmMark(more.querySelector(".lm-mark"));
  })();

  const update = () => {
    const tag = tagNow();
    const mob = isMobile();
    const list = mob ? items.filter((it) => (!tag || it.d.t.includes(tag)) && it.d.p !== 0) : items;
    items.forEach((it) => {
      const match = !tag || it.d.t.includes(tag);
      const live = match && it.d.p !== 0;
      const idx = list.indexOf(it);
      it.li.hidden = idx < 0 || idx >= shown;
      it.a.classList.toggle("is-off", !live);
      it.a.setAttribute("aria-disabled", String(!live));
      if (live) it.a.removeAttribute("tabindex"); else it.a.tabIndex = -1;
      it.a.classList.toggle("is-faded", ready && !match);
      if (!match && ready && !it.clear) {
        it.clear = document.createElement("button");
        it.clear.type = "button";
        it.clear.className = "lm-clear";
        it.clear.setAttribute("aria-label", "Clear filter");
        it.clear.addEventListener("click", () => {
          const u = new URL(location.href);
          u.searchParams.delete("tag");
          history.pushState(null, "", u);
          dispatchEvent(new PopStateEvent("popstate"));
        });
        it.li.append(it.clear);
      } else if ((match || !ready) && it.clear) { it.clear.remove(); it.clear = null; }
    });
    const hasMore = shown < list.length;
    more.hidden = !hasMore;
    document.body.classList.toggle("is-footless", hasMore);
    if (hasMore && loaderMark) loaderMark.loop(); else if (loaderMark) loaderMark.stop();
    window.lmFade(grid);
  };

  const loadMore = () => {
    if (loading || more.hidden) return;
    if (more.getBoundingClientRect().top > innerHeight) return;
    loading = true;
    setTimeout(() => { shown += PAGE; loading = false; update(); }, 1000);
  };

  addEventListener("lm:tag", () => { if (isMobile()) shown = PAGE; update(); });
  addEventListener("popstate", update);
  addEventListener("scroll", loadMore, { passive: true });
  addEventListener("resize", () => { update(); loadMore(); });
  update();
  setTimeout(loadMore, 50);
  setTimeout(() => { ready = true; update(); }, 1000);
})();
