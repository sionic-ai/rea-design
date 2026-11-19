// Shared by all pages: fills the top pill nav, the bottom Book a call pill and the footer pill row in one place,
// Off the first page, the nav is attached (with shadow) at 8px scroll, and the bottom pill turns on after passing 60% of the screen. The pill goes down when the footer is visible.
(() => {
  const here = document.body.dataset.page || "index.html";
  const NAV = [
    ["works.html", "case studies", ""],
    ["services.html", "services", " is-more"],
    ["services.html#pricing", "pricing", " is-more"],
    ["works.html#clients", "clients", " is-more"],
    ["about.html", "about", " is-more"],
  ];
  const cur = (href) => (href === here ? ' aria-current="page"' : "");
  const nav = document.querySelector(".bk-nav");
  if (nav) {
    nav.innerHTML = `<a class="bk-np" href="index.html"${cur("index.html")} data-label="Studio English wordmark">studio.name</a>
      <nav class="bk-nav__links" aria-label="Main">${NAV.map(([h, t, c]) => `<a class="bk-np${c}" href="${h}"${cur(h)}>${t}</a>`).join("")}<a class="bk-np is-go" href="#book">book a call</a></nav>`;
  }
  const float = document.querySelector(".bk-float");
  if (float && !float.textContent.trim()) float.textContent = "Book a call";
  const foot = document.querySelector(".bk-foot");
  if (foot) {
    const links = [["works.html", "case studies"], ["services.html", "services"], ["services.html#pricing", "pricing"], ["works.html#clients", "clients"], ["works.html#yc", "YC"], ["about.html", "about"], ["about.html#contact", "contact"], ["#privacy", "privacy"]];
    foot.innerHTML = `<nav aria-label="Pages"><ul>${links.map(([h, t]) => `<li><a class="bk-np" href="${h}"${cur(h)}>${t}</a></li>`).join("")}
      <li><button class="bk-np" type="button" aria-expanded="false" aria-controls="bk-scrap" data-scrap>scrapbook <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3.5 5 6.5 8 3.5"/></svg></button></li></ul></nav>
      <nav class="bk-scrap" id="bk-scrap" aria-label="Scrapbook" hidden><ul>${["Scrap 01", "Scrap 02", "Scrap 03", "Scrap 04"].map((t) => `<li><a class="bk-np" href="#">${t}</a></li>`).join("")}</ul></nav>`;
    const btn = foot.querySelector("[data-scrap]");
    const list = foot.querySelector(".bk-scrap");
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      list.hidden = !open;
    });
    if (float) new IntersectionObserver(([e]) => {
      float.classList.toggle("foot", e.isIntersecting);
      document.querySelector(".bk-pause")?.classList.toggle("foot", e.isIntersecting);
    }).observe(foot);
  }
  // The first page’s stage script (index.js) sets the nav·pill state directly
  if (!document.querySelector("[data-world]")) {
    let state = "", on = false, queued = false;
    const tick = () => {
      queued = false;
      const s = scrollY > 8 ? "stuck" : "top";
      if (nav && s !== state) nav.dataset.state = state = s;
      const o = scrollY > innerHeight * 0.6;
      if (float && o !== on) float.classList.toggle("on", (on = o));
    };
    addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(tick); } }, { passive: true });
    tick();
  }
})();
