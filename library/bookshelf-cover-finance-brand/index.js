(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Ten fund covers — cover image slot + name. As in the original slick, each cell must be wrapped in one more div so the % inner padding is based on cell width
  const books = document.querySelector("[data-books]");
  if (books) {
    const names = ["Brand-i Index 225", "Brand-i Index TOPIX", "Brand-i Semiconductors", "Brand-i overseas stocks", "Brand-i Emerging Market Equities", "Brand-i domestic bonds", "Brand-i overseas bonds", "Brand-i REIT", "Brand-i Balance", "Brand-i Basic"];
    const covers = ["Hand shaking with the number 225 · blue cover", "Semiconductor chip close-up · teal cover", "Stock price board · dark green cover", "World map and cities · navy cover", "Emerging-city street scene · orange cover", "Domestic bond certificate · gray-blue cover", "Foreign government bond · Sky cover", "Building forest · gray cover", "Scale and coins · beige cover", "Graph line · White cover"];
    books.innerHTML = names.map((n, i) => `
      <div><div class="fi-book"><a href="#"><div class="fi-book__fig"><div class="fi-book__cover wf-img" data-label="Product illustration drawn like a book cover · ${covers[i]} · Portrait 1:1.48"><b>${String(i + 1).padStart(2, "0")}</b></div></div><h3 class="fi-book__t">${n}</h3></a></div></div>`).join("");
    if (window.jQuery && jQuery.fn.slick) {
      // Exactly the original slick settings — center mode · 12.5% on both sides · three books · 500ms · 1.5s autoplay (phone 75px · one book · autoplay off)
      jQuery(books).slick({
        centerMode: true, infinite: true, centerPadding: "12.5%", slidesToShow: 3, speed: reduce ? 0 : 500, arrows: false,
        autoplay: !reduce, autoplaySpeed: 1500,
        responsive: [{ breakpoint: 767, settings: { arrows: false, centerMode: true, centerPadding: "75px", slidesToShow: 1, autoplay: false } }],
      });
    }
  }

  // Six new posts
  const cards = document.querySelector("[data-new-cards]");
  if (cards) {
    const items = [
      ["#Advanced", "Your article title here in two lines about treating a big event as an opportunity", "Table with masks · White background"],
      ["#Advanced", "Your article title here on better asset allocation", "Person holding open a newspaper · indoors"],
      ["#Advanced", "Your article title on asset splitting and rebalancing goes here", "Hand taking notes in a notebook · by the window"],
      ["#Advanced", "Your article title on market trends and future operations", "Laptop and coffee · Desk"],
      ["#How much did that dream cost you?", "Your third serial episode title here", "Two people standing in front of the shop · bright street"],
      ["#Career Talk", "Your series title about one person’s stubbornness here", "Text-only cover panel · white background"],
    ];
    cards.innerHTML = items.map(([c, t, ph]) => `
      <li data-fx-part="item"><a href="list.html"><span class="fi-new__fig"><span class="wf-img" data-label="${ph} · Landscape 4:3"></span></span><span class="fi-new__cat">${c}</span><h3 class="fi-new__t">${t}</h3></a></li>`).join("");
  }

  // Section head · band: once, is-in when the top edge crosses the ratio (.6) line from the top of the screen (original js-scroll-animation → is-tween)
  const tweens = [...document.querySelectorAll("[data-tween]")];
  const check = () => {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const el = tweens[i], r = el.getBoundingClientRect(), ratio = +(el.dataset.ratio || 0.6);
      if (r.top < innerHeight * ratio && r.bottom > 0) { el.classList.add("is-in"); tweens.splice(i, 1); }
    }
    if (!tweens.length) removeEventListener("scroll", check);
  };
  if (reduce) tweens.forEach((el) => el.classList.add("is-in"));
  else { addEventListener("scroll", check, { passive: true }); requestAnimationFrame(check); }

  // Hero photos take color after the loader clears (original onLoadingComplete → is-tween)
  const hero = document.querySelector(".fi-hero");
  const loader = document.querySelector("[data-fx~='hue-breath-loader']");
  const heroIn = () => hero?.classList.add("is-in");
  if (!loader || reduce) heroIn();
  else {
    loader.addEventListener("fx:done", heroIn, { once: true });
    if (getComputedStyle(loader).display === "none") heroIn();
  }
})();
