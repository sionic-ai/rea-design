(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Six News cards — date, category tag, two-line title, photo on the right
  const grid = document.querySelector("[data-news-cards]");
  if (grid) {
    const items = [
      ["Notice", "Your news here about attending a regional tourism content support program seminar", "Person at lectern · white background · landscape 3:2"],
      ["Press Release", "Your two-line news goes here announcing several experiences meeting the people who stage old buildings.", "Workshop in an old building · warm light · landscape 3:2"],
      ["Press Release", "Your news here of a limited experience at a World Heritage temple: learn, wander and taste", "Temple among red maple leaves · sunset · landscape 3:2"],
      ["Notice", "Your two-line notice here about the reply on designation as a master craft technique holder", "Craftsman working in a sake cellar · dark interior · landscape 3:2"],
      ["Notice", "Your two-line notice title about a website-builder service incident goes here", "White board with only the company logo · landscape 3:2"],
      ["Press Release", "Your news that the members-only service for adults has been refreshed goes here.", "Counter of a dark bar · soft lighting · landscape 3:2"],
    ];
    grid.innerHTML = items.map(([cat, title, ph]) => `
      <a class="ncard" href="news.html">
        <div class="ncard__top"><span class="jc-tag">${cat}</span><time>0000.00.00</time></div>
        <div class="ncard__body"><p>${title}</p><div class="ncard__img"><div class="wf-img" data-label="${ph}"></div></div></div>
      </a>`).join("");
  }

  // Partner marquee: shuffle logo order and append two more copies, one set flows every (logo count × 3 × 1.6s)
  document.querySelectorAll("[data-partner]").forEach((row) => {
    const ul = row.querySelector("ul");
    if (!ul) return;
    const items = [...ul.children];
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
    ul.replaceChildren(...items);
    ul.style.setProperty("--length", items.length);
    for (let k = 0; k < 2; k++) { const c = ul.cloneNode(true); c.setAttribute("aria-hidden", "true"); row.append(c); }
    if (!reduce) row.classList.add("is-on");
  });

  // Project story: Splide infinite loop · own width · 800ms cubic-bezier(.4,0,.2,1)
  const slider = document.querySelector("[data-story-slider]");
  if (slider && window.Splide) {
    const splide = new Splide(slider, { type: "loop", autoWidth: true, arrows: false, pagination: false, speed: reduce ? 0 : 800, easing: "cubic-bezier(0.4,0,0.2,1)" });
    splide.mount();
    document.querySelector("[data-story-prev]")?.addEventListener("click", () => splide.go("<"));
    document.querySelector("[data-story-next]")?.addEventListener("click", () => splide.go(">"));
  }

  // Service list: while rows stack at the top, the previous row’s head panel is pushed up 32px (wide and tall screens only)
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 961px) and (min-height: 690px)", () => {
      const lis = [...document.querySelectorAll("[data-service-list] > li")];
      lis.forEach((li, i) => {
        if (i === lis.length - 1) return;
        const nav = li.querySelector("[data-service-nav]");
        if (nav) gsap.to(nav, { y: -32, ease: "none", scrollTrigger: { trigger: li, start: "top top", end: "center top", scrub: true, invalidateOnRefresh: true } });
      });
    });
    setTimeout(() => ScrollTrigger.refresh(true), 400);
  }
})();
