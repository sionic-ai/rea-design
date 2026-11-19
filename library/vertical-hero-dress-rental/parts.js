// Fills repeating rows of the same type (dress cards · feature cards · price rows · news cards · questions) to the original count — runs before shared.js picks up .anim
(() => {

  const control = '<div class="control"><div class="swiper-button-prev" role="button" aria-label="Previous"></div><div class="swiper-button-next" role="button" aria-label="Next"></div></div><div class="swiper-scrollbar"></div>';
  const DRESS = {
    wedding: ["Full-body white voluminous dress · in front of green wall", "White off-shoulder dress · light gray background", "Lace-sleeve dress · By the window", "Long-train dress from behind · white wall", "Slim satin dress · shade", "Layered tulle dress · Flower background", "Beaded dress · indoors"],
    color: ["Light pink dress full-length · white background", "Sky-blue tulle dress · By the window", "Olive satin dress · shade", "Lavender dress · flower field", "Champagne dress · White wall", "Black velvet dress · dark room", "Apricot dress · Afternoon light"],
    kimono: ["Bride in a white kimono · front view · white background", "Red floral kimono · Front view", "Golden kimono · front view", "Floral kimono on a black background · front", "Pink kimono · Front view", "Green kimono · front view", "Navy kimono · front view"],
  };
  document.querySelectorAll("[data-dress]").forEach((el) => {
    const items = DRESS[el.dataset.dress].map((l, i) => `<li class="p-dress-recommend__list__item swiper-slide"><a href="#"><figure class="p-dress-recommend__list__image zoom"><span class="wf-img" data-label="${l} · Portrait 3:4"></span></figure><div class="p-dress-recommend__list__txt"><p class="tit lv-label">Name ${String(i + 1).padStart(2, "0")}</p><p class="sub lv-label">Line by brand</p></div></a></li>`).join("");
    el.innerHTML = `<ul class="p-dress-recommend__list swiper-wrapper">${items}</ul>${control}`;
  });

  const POINTS = [
    ["Good quality, closer to you", "Your three lines here saying hand-picked dresses are offered at an affordable price. Stay firm on fabric and detail while bringing more brides their ideal gown.", "Dress hem spread out like waves · top-down view · landscape 4:3"],
    ["Many designs that give ”love” a shape", "Here goes a three-line text on dresses from classic styles to designs where trend and individuality shine. Also a line noting that many are original dresses.", "Pale pink dresses on hangers · window light · landscape 4:3"],
    ["A silhouette that looks beautiful for your body type", "Your note in about three lines that every bride should enjoy her day with confidence. Add a line on finding the perfect dress through extended sizes and silhouettes that flatter every body shape.", "Hands fitting a dress at the waist · close-up · landscape 4:3"],
    ["00 stores nationwide, the same peace of mind everywhere", "Your text here, about three lines, saying every store offers the same outfits and service. Include a line that you can try on the same dress for photo shoots or ceremonies anywhere.", "Customer walking into the store entrance · dark corridor · 4:3 landscape"],
  ];
  document.querySelectorAll("[data-points]").forEach((el) => {
    el.innerHTML = POINTS.map(([t, d, l], i) => `<li class="p-feature-point__list__item anim fade-up"><div class="budge"><span class="label lv-label">POINT</span><span class="num lv-label">${i + 1}</span></div><figure class="image"><span class="wf-img wf-r-4x3" data-label="${l}"></span></figure><dl class="txt-wrap"><dt>${t}</dt><dd>${d}</dd></dl></li>`).join("");
  });

  const PRICE = [
    ["Wedding dress rental", "000,000", "Bride in a white dress, upper body · white background · 4:5 portrait"],
    ["Tuxedo Rental", "000,000", "Groom in tuxedo, upper body · white background · portrait 4:5"],
    ["White kimono · colored kimono rental", "000,000", "Bride in white kimono, upper body · white background · portrait 4:5"],
    ["Formalwear rental", "000,000", "Groom in black formal wear, upper body · white background · vertical 4:5"],
  ];
  document.querySelectorAll("[data-price]").forEach((el) => {
    el.innerHTML = PRICE.map(([t, n, l]) => `<li class="p-dress-price__list__item"><figure class="image anim fade-up"><span class="wf-img" data-label="${l}"></span></figure><section class="txt-wrap"><h3 class="c-ja-heading anim fade-up">${t}</h3><div class="price anim fade-up"><span class="num lv-label">₩${n}</span><span class="sub lv-sans">(Tax included)~</span></div><p class="summary lv-sans anim fade-up">Your line about rental items used for events or shoots goes here.<br>Second line saying you can try it on beforehand and use it smoothly until the day.</p><p class="contents lv-sans anim fade-up">[Included props]<br>Your prop names here, joined by middle dots in one line</p></section></li>`).join("");
  });

  const NEWS = [["2026.09.15", "Column", "Table with props spread out · top-down view"], ["2026.08.21", "Collection", "Illustration of four dresses side by side · white background"], ["2026.08.19", "Collection", "Bride in white kimono · garden"], ["2026.07.23", "Campaign", "Smiling bride upper body · by the window"], ["2026.07.10", "Notice", "Hand holding a magazine cover · white background"], ["2026.06.16", "Notice", "Two tuxedos · studio"]];
  document.querySelectorAll("[data-news]").forEach((el) => {
    el.innerHTML = `<ul class="p-index-news__list swiper-wrapper">${NEWS.map(([d, c, l]) => `<li class="p-index-news__list__item swiper-slide"><a href="news.html"><figure class="p-index-news__list__image zoom"><span class="wf-img wf-r-3x2" data-label="${l} · Landscape 3:2"></span></figure><div class="p-index-news__list__txt"><div class="info"><time class="lv-label">${d}</time><div class="cat lv-sans">${c}</div></div><div class="title">Your news title goes here in about two lines. It also shows that long titles get cut off at three lines.</div></div></a></li>`).join("")}</ul>${control}`;
  });

  const FAQ = [["How long is the rental period?", "The answer: the default is 2 nights 3 days, here.<br>※ A line saying items are handed over the day before use and returned the next day."], ["How many sizes are there?", "Answer about size range here, two lines. Designs differ by store, so please visit a nearby store."], ["Can I rent just the props?", "Your one-line answer here: yes, props can be rented on their own."], ["Is online consultation available?", "Your two-line answer here: online consultation before a fitting."], ["Can I take it abroad?", "Two lines here: the answer that up to ten days is the base fee, and the amount added per day beyond that."]];
  document.querySelectorAll("[data-faq]").forEach((el) => {
    el.innerHTML = FAQ.map(([q, a]) => `<div><dt class="p-faq__list__tit anim fade-up"><span class="icon-q">Q</span><span class="txt">$ here{q}<span class="plus"></span></span></dt><dd class="p-faq__list__desc"><div class="txt">${a}</div></dd></div>`).join("");
  });
})();
