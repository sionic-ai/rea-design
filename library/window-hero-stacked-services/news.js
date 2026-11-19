(() => {
  // Twelve News rows — date and category tag / title / right photo. First eight rows, the rest with ”Load more”
  const list = document.querySelector("[data-news-list]");
  if (!list) return;
  const CAT = { media: "Featured News", info: "Notice", press: "Press Release" };
  const rows = [
    ["info", "Your news here about attending a regional tourism content support program seminar", "Person at a lectern · white background"],
    ["press", "Your two-line news goes here announcing several experiences meeting the people who stage old buildings.", "Workshop in an old building · warm light"],
    ["media", "Your one-line news here about the experience featured on TV", "Pink lettering broadcast screen · bright colors"],
    ["press", "News of a limited experience to learn and taste at a World Heritage temple", "Temple among red maples · dusk"],
    ["info", "Your two-line notice here about the reply on designation as a master craft technique holder", "Craftsman working in a liquor cellar · Dark interior"],
    ["info", "Your two-line notice title about a website-builder service incident goes here", "Company logo alone on a white board"],
    ["media", "One line of news that the experience aired on TV.", "Broadcast scene of two people laughing"],
    ["press", "Your news about the renewed membership service here", "Counter of a dark bar · soft lighting"],
    ["info", "Your notice about attending an overseas travel fair here", "Service logo in front of a snowy mountain"],
    ["media", "News of a morning hands-on cooking class featured on a broadcast", "Green text broadcast screen"],
    ["media", "Your one-line news about a magazine feature goes here", "Magazine cover · person"],
    ["media", "Your one line on being featured in a newspaper", "Newspaper page · black and white"],
  ];
  list.innerHTML = rows.map(([c, t, ph], i) => `
    <a class="nrow" href="#" data-cat="${c}"${i >= 8 ? " hidden data-more" : ""}>
      <div class="nrow__meta"><time>0000.00.00</time><span class="jc-tag">${CAT[c]}</span></div>
      <div class="nrow__body"><p>${t}</p><div class="nrow__img"><div class="wf-img" data-label="${ph} · Landscape 16:10"></div></div></div>
    </a>`).join("");

  const more = document.querySelector("[data-news-more]");
  more?.addEventListener("click", () => { list.querySelectorAll("[data-more]").forEach((r) => { r.hidden = false; r.removeAttribute("data-more"); }); more.hidden = true; });

  // Category: pressing keeps only that category (the original is /news/category/<Category> (pages of the same type leading to it)
  const cats = document.querySelectorAll("[data-news-cats] a");
  cats.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    cats.forEach((x) => x.classList.toggle("is-now", x === a));
    const c = a.dataset.cat;
    list.querySelectorAll(".nrow").forEach((r) => { r.style.display = c === "all" || r.dataset.cat === c ? "" : "none"; });
  }));
})();
