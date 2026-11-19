// News list: fills the cards and filters by category (a category with no posts shows an empty-state message, like the original category page)
(() => {
  const ig = FT.ico.insta;
  const posts = [
    ["news", "Category 03", "Your event news title, up to two lines. Truncate with an ellipsis if long", "Event poster · pink and sky blue graphics · square", ""],
    ["press", "Category 02", "Your collaboration news title, up to two lines. Truncate with an ellipsis if long", "Vertical-text poster · purple background · square", ""],
    ["press", "Category 02", "Your seasonal menu news title here", "Burger and pancake plates · Yellow star decoration · Square", ""],
    ["press", "Category 02", "Your new dinner menu news here", "Layered dessert tower · neon lighting · square", ""],
    ["news", "Category 03", "Your reservations opening news here", "Night event poster · black background with neon lettering · square", ""],
    ["news", "Category 03", "Add group rate news here, up to two lines.", "Large plate of meat and waffle fries · from above · square", ""],
    ["news", "Category 03", "Your limited-time menu news here.", "Plate of fish and vegetables · pink background · social media photo · square", "sns"],
    ["news", "Category 03", "Your limited-time burger news here.", "Petal-decorated burger · pink background · social media photo · square", "sns"],
    ["news", "Category 03", "Your limited-time dessert news goes here", "Pink pancakes · petals · social media photo · square", "sns"],
    ["press", "Category 02", "Add limited-time event news here, up to two lines", "Red stand and mascot · pink background · square", ""],
  ];
  const grid = document.querySelector(".np-grid");
  const empty = document.querySelector(".np-empty");
  const render = (cat) => {
    const list = posts.filter((p) => cat === "all" || p[0] === cat);
    grid.innerHTML = list
      .map(
        ([, c, t, l, sns]) => {
          const body = `<div class="ft-card__img"><div class="wf-img" data-label="${l}"></div>${sns ? `<span class="ft-card__ico">${ig}</span>` : ""}</div>
          <div class="ft-card__meta"><small class="ft-card__cat">${c}</small><time class="ft-card__date">2026.00.00</time></div>
          <p class="ft-card__t">${t}</p>`;
          return sns ? `<div class="ft-card" data-ft-modal="instagram" role="button" tabindex="0">${body}</div>` : `<a class="ft-card" href="#">${body}</a>`;
        }
      )
      .join("");
    empty.hidden = list.length > 0;
    if (!FT.reduced && list.length) gsap.from(grid.children, { yPercent: 20, opacity: 0, duration: 0.6, stagger: 0.05 });
    ScrollTrigger.refresh();
  };
  const btns = document.querySelectorAll(".np-filter button");
  btns.forEach((b) =>
    b.addEventListener("click", () => {
      btns.forEach((o) => o.classList.toggle("is-on", o === b));
      render(b.dataset.cat);
    })
  );
  render("all");
})();
