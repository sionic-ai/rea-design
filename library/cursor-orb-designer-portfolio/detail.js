// Case detail — title row, info and main image rise, the header title rolls over to the case name, and the table of contents marks the chapter currently being read (original project-page.js)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intro = document.querySelector(".dt-intro");
  if (intro && !reduce) intro.classList.add("is-armed");
  Promise.all([abSite.ready, abSite.revealed]).then(() => requestAnimationFrame(() => requestAnimationFrame(() => { intro?.classList.add("is-in"); abSite.watch(); })));

  // Title swap: after 320ms, .5s at 20ms per letter, cell width .6s
  const role = document.querySelector("[data-role-swap]");
  if (role) {
    const from = role.textContent.trim(), to = role.dataset.roleTo || from;
    const chars = (t) => [...t].map((c, i) => `<span class="ab-swap__c" style="--c:${i}">${c}</span>`).join("");
    role.setAttribute("aria-label", to);
    role.innerHTML = `<span class="ab-swap" aria-hidden="true"><span class="ab-swap__line ab-swap__line--from">${chars(from)}</span><span class="ab-swap__line ab-swap__line--to">${chars(to)}</span></span>`;
    const box = role.firstElementChild, a = box.children[0], b = box.children[1];
    box.style.width = `${a.scrollWidth}px`;
    const go = () => (document.fonts?.ready || Promise.resolve()).then(() => {
      box.style.width = `${a.getBoundingClientRect().width}px`;
      requestAnimationFrame(() => requestAnimationFrame(() => { box.style.width = `${b.getBoundingClientRect().width}px`; box.classList.add("is-on"); }));
    });
    reduce ? go() : setTimeout(go, 320);
  }

  // Table of contents: the last chapter past screen center is the current one, and clicking centers that chapter’s title on screen
  const links = [...document.querySelectorAll('.dt-nav a[href^="#"]')].map((link) => ({ link, sec: document.querySelector(link.getAttribute("href")) })).filter((e) => e.sec);
  if (!links.length) return;
  let cur, raf = 0;
  const mark = (link) => {
    if (cur === link) return;
    cur = link;
    links.forEach((e) => { e.link.classList.toggle("is-active", e.link === link); e.link === link ? e.link.setAttribute("aria-current", "location") : e.link.removeAttribute("aria-current"); });
  };
  const spy = () => {
    raf = 0;
    let now = links[0];
    links.forEach((e) => { if (e.sec.getBoundingClientRect().top <= innerHeight / 2) now = e; });
    mark(now.link);
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(spy); }, { passive: true });
  spy();
  links.forEach((e) => e.link.addEventListener("click", (ev) => {
    ev.preventDefault();
    const h = e.sec.querySelector(".dt-copy h2") || e.sec, r = h.getBoundingClientRect();
    const top = Math.max(0, scrollY + r.top - (innerHeight - r.height) / 2);
    if (abSite.lenis) abSite.lenis.scrollTo(top); else scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    mark(e.link);
  }));
})();
