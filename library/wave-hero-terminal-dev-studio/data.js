// Placeholder data — draws in six services · seven cases · four testimonials · article cards · question rows · logo strip (runs before shared.js).
(() => {
  const arrow = '<svg class="ag-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => (el.innerHTML = html));

  const SERVICES = [
    ["Entrust Your Product Team", ["Product development", "Long-haul delivery"]],
    ["Seniors Join", ["Senior Engineer", "Team expand"]],
    ["Tech Advisory", ["Design", "Inspection", "Strategy"]],
    ["First product · launch", ["Prototype", "Launch", "Repeat"]],
    ["Add AI", ["AI", "Sync", "Flow"]],
    ["Cloud · Platform", ["Cloud", "Observation", "Stability"]],
  ];
  fill("[data-services]", SERVICES.map(([h, tags], i) => `
    <div class="ag-svc" data-stagger="60">
      <div class="ag-svc__num" data-anim="fade-up">0${i + 1}</div>
      <h3 class="ag-svc__title" data-anim="fade-up" data-order="1">${h}</h3>
      <div class="ag-svc__body"><div class="ag-svc__tags" data-anim="fade-up" data-order="2">${tags.map((t) => `<span class="ag-tag">${t}</span>`).join("")}</div>
      <p class="ag-svc__text" data-anim="fade-up" data-order="3">Your service description here in two lines. Say who handles what and how far responsibility goes.</p></div>
    </div>`).join(""));

  const PROJECTS = [
    ["Case Name 1", "Finance", "Payment dashboard screen · laptop front view · indigo background"],
    ["Case Name 2", "Finance · Inclusion", "Three mobile wallet app screens · side by side"],
    ["Case Name 3", "Regulatory technology", "Document management screen · light background"],
    ["Case Name 4", "Music technology", "Audio waveform editing screen · Dark background"],
    ["Case Name 5", "Entertainment", "Movie streaming list screen · poster grid"],
    ["Case Name 6", "Music copyright", "Settlement table screen · laptop at an angle"],
    ["Case Name 7", "Finance", "Trading screen · chart and order list"],
  ];
  // Work — images scattered in a staggered way over two columns (right column pushed down), with name ↗ and category under each image
  const tile = ([t, cat, shot], i) => `
    <a class="ag-tile" href="article.html" data-anim="fade-up" style="--w:${[100, 78, 64, 86, 72, 100, 70][i]}%;--ar:${["4 / 3", "3 / 4", "4 / 3", "16 / 10", "3 / 4", "4 / 3", "1 / 1"][i]}">
      <span class="ag-tile__img"><span class="wf-img" data-label="${shot}"></span></span>
      <span class="ag-tile__name">${t} <svg class="ag-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7"/></svg></span>
      <span class="ag-tile__cat">${cat}</span>
    </a>`;
  document.querySelectorAll("[data-projects]").forEach((el) => {
    el.innerHTML = `<div class="ag-projects__col">${PROJECTS.filter((_, i) => i % 2 === 0).map((p, k) => tile(p, k * 2)).join("")}</div><div class="ag-projects__col">${PROJECTS.filter((_, i) => i % 2).map((p, k) => tile(p, k * 2 + 1)).join("")}</div>`;
  });
  fill("[data-testis]", [1, 2, 3, 4].map((n) => `
    <figure class="ag-testi" data-anim="fade-up"><blockquote>Your customer testimonial goes here in three lines. Write in that person’s own voice how communication was good from day one and the work entrusted was done on time and solidly.</blockquote>
    <figcaption><i class="ag-testi__dot"></i><span>Name ${n}, Title · Company name</span></figcaption></figure>`).join(""));

  const POSTS = [
    ["Your one-line article title here — Fine Outside, but Inside?", "Extension", "Check score on dark screen · Pink accent"],
    ["Your article title here — the model that can’t remember conversations", "AI", "Speech bubble graphic · Purple"],
    ["Your article title here — When Code Review Breaks Down", "Development Culture", "Review Screen Graphic"],
    ["Your article title here — Why the Basics Still Win", "AI", "Diagram graphic"],
    ["Article title here — date and time mistakes", "Backend", "Clock Graphic"],
    ["Your article title here — Keeping Records of Complex Systems", "Observation", "Log screen graphic"],
    ["Post title here — API Versioning That Changes the Game", "Backend", "Version graphic"],
  ];
  const post = ([t, tag, shot], i) => `
    <a class="ag-post${i === 0 ? " ag-post--hero" : ""}" href="article.html" data-anim="fade-up" data-order="${i % 3}" data-stagger="80">
      ${i === 0 ? `<span class="wf-img ag-post__img" data-label="${shot}"></span>` : ""}
      <div class="ag-post__head"><h3 class="ag-post__title">${t}</h3><p class="ag-post__ex">Your two-line article summary here. Make it clear at a glance what it covers.</p></div>
      <div class="ag-post__foot"><span class="ag-pill">${tag}</span><span class="ag-post__meta"><span>00/00, 0000</span>${arrow}</span></div>
    </a>`;
  fill("[data-blog]", POSTS.map(post).join(""));
  // Social card — image on top, a few lines of text, date and icons below
  fill("[data-social]", POSTS.slice(1, 7).map(([t, tag, shot], i) => `
    <a class="ag-social__card" href="#" data-anim="fade-up" data-order="${i % 3}" data-stagger="80"><span class="wf-img" data-label="Social post graphic · Bold text graphic · ${shot}"></span><p>Your three-line post text here. ${t}</p><span class="ag-post__meta"><span>0000.00.00 · 0 min</span></span></a>`).join(""));
  window.AG_POSTS = POSTS;

  const QS = ["Your question goes here — how much does custom development cost?", "Your question here — How long until the first product?", "Your question here — Do you work with overseas clients?", "Your question: Work with an early-stage company or a large one?", "Your question here — what technology do you use?", "Your question here — Does it hold up as you scale?", "Your question goes here — do you stay on after launch?", "Your question — do you also fix existing code? here", "Your question here — In what order does the work begin?", "Your question — What type of contract is it? here"];
  fill("[data-faq]", QS.map((q, i) => `
    <div class="ag-faq__item" data-anim="fade-up" data-order="${i}" data-stagger="40"><button class="ag-faq__q" type="button" aria-expanded="false"><span>${q}</span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></button>
    <div class="ag-faq__a"><p>Your two or three line answer here. Honestly say what varies by scope, period and people, and what gets decided in the first conversation.</p></div></div>`).join(""));

  const logos = Array.from({ length: 11 }, (_, i) => `<span class="ag-partners__logo"><span class="wf-logo">Logo ${i + 1}</span></span>`).join("");
  fill(".ag-partners__track", `<div class="ag-marq__set">${logos}</div><div class="ag-marq__set" aria-hidden="true">${logos}</div><div class="ag-marq__set" aria-hidden="true">${logos}</div><div class="ag-marq__set" aria-hidden="true">${logos}</div>`);
  document.querySelectorAll(".ag-infinity__track").forEach((t) => { const p = t.innerHTML; t.innerHTML = p + p.replace("<p ", '<p aria-hidden="true" '); });
})();
