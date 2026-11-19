// Home — staff photo gallery (endlessly flowing row + CLICK mark + modal), future policy Swiper (3.5 slides and loop as in the original), SKIP, employee voice cards entering.
(() => {
  const STAFF = [
    ["A plate that fuels a student’s day", "Campus", "Cooking", "Cook at the cafeteria serving counter · smiling · landscape 5:3"],
    ["A stadium for shared thrills", "Stadium", "Kiosk management", "Vendor in the stadium stands · evening lighting · horizontal 5:3"],
    ["The child’s ‹Yummy›", "Childcare center", "Management Division", "Daycare cafeteria staff · bright interior · landscape 5:3"],
    ["The source of energy for working people", "Staff cafeteria", "Operations management", "Cafeteria cashier · daytime · landscape 5:3"],
    ["The joy of a fresh start", "Admin · Reception", "Operations management", "Company reception staff · suit · landscape 5:3"],
    ["Mealtimes that bring peace of mind", "Medical", "Operations management", "Hospital cafeteria dietitian · white coat · landscape 5:3"],
    ["Conversation where people gather", "Cafe", "Operations", "Office café barista · afternoon light · landscape 5:3"],
    ["A moment to change your mood", "Coffee Service", "Business", "Sales staff beside a coffee machine · office · landscape 5:3"],
  ];
  const row = document.querySelector(".am-gallery__row");
  const modals = document.querySelector(".am-modals");
  if (row && modals) {
    const items = STAFF.map(([, , , label], i) => `<a href="#staff_${i + 1}" class="glightbox click-sign" data-gallery="staff" data-type="inline"><div class="wf-img" data-label="${label}"></div></a>`).join("");
    row.innerHTML = `${items}<div class="am-gallery__row is-copy" aria-hidden="true">${items.replaceAll('class="glightbox click-sign"', 'class="click-sign" tabindex="-1"')}</div>`;
    modals.innerHTML = STAFF.map(([catch_, svc, role, label], i) => `<div class="am-modal" id="staff_${i + 1}"><p class="am-modal__head"><span>STAFF</span><span class="num">${String(i + 1).padStart(2, "0")}</span></p><div class="wf-img" data-label="${label.replace("Landscape 5:3", "Vertical 4:5")}"></div><div><p class="am-modal__catch">The future is<br><strong>${catch_}</strong><br>Inside</p><dl><dt>Service</dt><dd>${svc}</dd><dt>In charge</dt><dd>${role}</dd></dl></div></div>`).join("");
    // When 30% of the gallery is visible, remove the CLICK badge after 3s, and put it back once it leaves the screen
    let timer = null;
    const wrap = document.querySelector(".am-gallery");
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!timer) timer = setTimeout(() => wrap.querySelectorAll(".click-sign").forEach((a) => a.classList.remove("click-sign")), 3000); }
      else { clearTimeout(timer); timer = null; wrap.querySelectorAll(".am-gallery__row a").forEach((a) => a.classList.add("click-sign")); }
    }, { threshold: 0.3 }).observe(wrap);
  }

  // Staff sound — when the card stack reaches the screen center, the cards settle one by one at .3s intervals
  const cards = document.querySelector(".am-voice__cards");
  if (cards) new IntersectionObserver(([e], io) => {
    if (!e.isIntersecting) return;
    cards.querySelectorAll(".senryu").forEach((c, i) => setTimeout(() => c.classList.add("show"), i * 300));
    cards.classList.add("inviewed");
    io.disconnect();
  }, { rootMargin: "-50% 0%" }).observe(cards);

  document.querySelector(".am-kv__skip")?.addEventListener("click", () => {
    const intro = document.querySelector("#intro");
    scrollTo({ top: intro.getBoundingClientRect().top + scrollY, behavior: "instant" });
  });

  const fut = document.querySelector(".am-future");
  if (fut) {
    const el = fut.querySelector(".swiper");
    const wrapper = el.querySelector(".swiper-wrapper");
    [...wrapper.children].forEach((s) => { const c = s.cloneNode(true); c.setAttribute("aria-hidden", "true"); wrapper.append(c); });
    new Swiper(el, {
      loop: true, speed: 1000, spaceBetween: 12, slidesPerView: 1.5,
      navigation: { nextEl: fut.querySelector(".swiper-button-next"), prevEl: fut.querySelector(".swiper-button-prev"), addIcons: false },
      breakpoints: { 769: { slidesPerView: 2.5, spaceBetween: 30 }, 1001: { slidesPerView: 3.5, spaceBetween: 30 }, 1281: { slidesPerView: 3.5, spaceBetween: 50 } },
    });
  }
})();
