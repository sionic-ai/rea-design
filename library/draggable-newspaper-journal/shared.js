// Draws the top-right logo, three-line button and expanding menu of all pages in one place, and opens and closes them in .35s with WAAPI like the original headerBtn.
(() => {
  const WORD = '<svg class="fc-wordmark" viewBox="0 0 114 26" aria-label="BRAND"><text x="0" y="22" font-size="25" font-weight="700" letter-spacing="2">BR✦ND</text></svg>';
  let starSeed = 7;
  const rnd = () => { starSeed = (starSeed * 9301 + 49297) % 233280; return starSeed / 233280; };
  const stars = Array.from({ length: 26 }, () => `<circle class="em-ink" cx="${(30 + rnd() * 140).toFixed(1)}" cy="${(95 + rnd() * 160).toFixed(1)}" r="${(0.8 + rnd() * 1.6).toFixed(1)}"/>`).join("");
  const EMBLEM = `<span class="fc-emblem" data-label="Cover print — figure holding a telescope under a starry night · black and white · portrait 5:8"><svg viewBox="0 0 200 320" aria-hidden="true">
    <rect class="em-fill" x="0" y="0" width="200" height="320"/>
    <text class="em-cap" x="100" y="22" text-anchor="middle">OPEN THE PAGE</text>
    <rect class="em-frame" x="10" y="32" width="180" height="256"/>
    <text class="em-word" x="100" y="80" text-anchor="middle">BRAND</text>
    ${stars}
    <path class="em-ink" d="M118 300V200c0-22-8-40-22-48l-4-14c10-2 16-10 16-20 0-12-9-20-20-20s-20 8-20 20c0 6 2 11 6 15l-20 40c-6 14-8 30-8 50v77z" opacity=".95"/>
    <path class="em-ink" d="M98 132l70-46 4 6-70 46z"/>
    <text class="em-cap" x="100" y="310" text-anchor="middle">LINK THE IDEAS</text>
  </svg></span>`;
  window.fcEmblem = EMBLEM;

  const persons = (list) => list.map(([n, p]) => `<li class="fc-person"><span class="wf-img" data-label="Person face front photo · bright interior · square"></span><p>${n}<small>${p}</small></p></li>`).join("");
  const toc = [
    ["focal: 008", "“Here” title placeholder No.4", "article.html", [["Author name", "Your affiliation and title here"]]],
    ["focal: 009", "See it here, read it here", "article.html", [["Author name", "Your affiliation and title here"]]],
    ["focal: 010", "Your ”Interview” title here?", "dialogue.html", [["Speaker 1", "Your affiliation here"], ["Speaker 2", "Your affiliation here"], ["Speaker 3", "Your affiliation here"], ["Speaker 4", "Your affiliation here"], ["Speaker 5", "Your affiliation here"], ["Speaker 6", "Your affiliation here"]]],
    ["focal: 011", "Your social issue title here", "article.html", [["Author name", "Your affiliation here"], ["Author name", "Your affiliation here"]]],
    ["focal: 012", "Introducing “Project Name Here”", "article.html", [["Author name", "Your affiliation here"], ["Author name", "Your affiliation here"]]]
  ].map(([num, t, href, ps]) => `<li><a class="fc-toc__link" href="${href}"><span class="fc-toc__num"><span class="fc-toc__tag">NEW</span>${num}</span><span class="fc-toc__bar">${t}</span></a><ul class="fc-toc__persons${ps.length === 1 ? " is-one" : ""}">${persons(ps)}</ul></li>`).join("");

  const header = `
<div class="fc-nav">
  <h1 class="fc-logo"><a href="index.html" aria-label="First Page">${WORD}</a></h1>
  <button class="fc-burger js-menu" type="button" aria-label="Menu"><span class="fc-burger__in"><span></span><span></span><span></span></span></button>
</div>
<div class="fc-menu" data-slot="menu">
  <div class="fc-menu__left">
    <div>
      ${EMBLEM}
      <p class="fc-menu__txt">Your intro saying you bring ”Focus” to the frontier of research.<br>Put in three lines. Each and every person<br>A journal for becoming a “seeker of knowledge.”</p>
      <p class="fc-menu__sub">Your line here: like a child seeing the stars through a telescope for the first time<br>A sentence about meeting the thrill of learning<br>Add close to four lines.</p>
      <a class="fc-menu__partner" href="#" data-label="Operating organization logo">Center Name<span aria-hidden="true">↗</span></a>
      <p class="fc-menu__small">※ Note that some images are AI-generated.</p>
      <p class="fc-menu__copy">Copyright © Organization Name. All rights reserved.</p>
    </div>
  </div>
  <div class="fc-menu__right fc-paper">
    <h2 class="fc-menu__ttl">Contents</h2>
    <div class="fc-menu__head"><span>Volume 3</span><time>September 30, 2026</time></div>
    <ul class="fc-toc">${toc}</ul>
  </div>
</div>`;

  const head = document.querySelector('[data-slot="header"]');
  if (!head) return;
  head.classList.add("fc-header");
  head.innerHTML = header;

  const menu = head.querySelector(".fc-menu");
  const timing = { duration: 350, easing: "cubic-bezier(0.39, 0.575, 0.565, 1)", fill: "forwards" };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toggle = () => {
    const open = !menu.classList.contains("is-open");
    document.body.classList.toggle("is-scroll", open);
    head.classList.toggle("is-active", open);
    document.querySelectorAll(".js-menu").forEach((b) => b.classList.toggle("is-open", open));
    menu.classList.toggle("is-open", open);
    const frames = [{ visibility: "hidden", opacity: 0 }, { visibility: "visible", opacity: 1 }];
    menu.animate(open ? frames : frames.reverse(), { ...timing, duration: reduce ? 0 : 350 });
  };
  document.addEventListener("click", (e) => { if (e.target.closest(".js-menu")) toggle(); });
})();
