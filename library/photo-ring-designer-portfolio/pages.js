// Three subpages: Work list industry filter (pixel curtain), case detail other-case paging and video pause, Contact topic pills and send (pixel curtain)
(() => {
  const { reduced } = EE;

  // ───── Work List
  const filter = document.querySelector(".ee-filter__list");
  if (filter) {
    const grid = document.querySelector(".ee-showcase__grid");
    const cards = [...grid.querySelectorAll(".ee-card")];
    const inds = [...new Set(cards.map((c) => c.dataset.industry))];
    filter.innerHTML = inds.map((n) => `<li><button type="button" aria-pressed="false"><span class="ee-filter__name">${n}</span><span class="ee-filter__x" aria-hidden="true">×</span></button></li>`).join("");
    // Cell mask per card (14 rows · 10 cells on wide screens)
    cards.forEach((c) => {
      const cols = 10, rows = 14;
      c.insertAdjacentHTML("beforeend", `<span class="ee-card-pixels" aria-hidden="true" style="--cols:${cols};--rows:${rows}">${Array.from({ length: cols * rows }, (_, i) => `<span style="--x:${i % cols};--y:${Math.floor(i / cols)}"></span>`).join("")}</span>`);
    });
    let picked = [], busy = false, want = null;
    const apply = () => cards.forEach((c) => (c.hidden = picked.length > 0 && !picked.includes(c.dataset.industry)));
    const run = (next) => {
      if (busy) { want = next; return; }
      busy = true;
      picked = next;
      EE.pixelSwap(grid, apply);
      setTimeout(() => { busy = false; if (want) { const w = want; want = null; run(w); } }, reduced ? 0 : 900);
    };
    filter.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      const next = [...filter.querySelectorAll('[aria-pressed="true"] .ee-filter__name')].map((x) => x.textContent);
      run(next);
    });
  }

  // ───── Case detail — flips the other-case strip one card at a time
  const track = document.querySelector(".ee-other__track");
  if (track) {
    document.querySelectorAll(".ee-other__arrow").forEach((b) => b.addEventListener("click", () => {
      const item = track.querySelector(".ee-other__item");
      const step = item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth * 0.8;
      track.scrollBy({ left: b.dataset.dir === "next" ? step : -step, behavior: reduced ? "auto" : "smooth" });
    }));
  }
  document.querySelectorAll("[data-video]").forEach((v) => {
    // Pauses the video and progress bar when off screen — the bar runs in sync with the video length (8s)
    const media = v.querySelector("video");
    new IntersectionObserver(([e]) => { v.toggleAttribute("data-paused", !e.isIntersecting); if (media) e.isIntersecting && !reduced ? media.play().catch(() => {}) : media.pause(); }).observe(v);
  });

  // ───── Contact
  const topics = document.querySelector(".ee-topics");
  if (topics) {
    const list = ["Web design", "Screen design", "Screen Flow", "Product Design", "Design system", "Prototype", "Website redesign", "Landing page", "Online store", "Development", "Front-end", "Design", "No-code builder", "Branding", "Visual Identity", "Creative Direction", "Motion · Interaction", "Accessibility", "Steady support", "I’m not sure yet"];
    topics.innerHTML = list.map((t) => `<button type="button" aria-pressed="false">${t}</button>`).join("");
    topics.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
    });
    const form = document.querySelector(".ee-form"), sent = document.querySelector(".ee-sent"), err = form.querySelector(".ee-form__error");
    const box = document.querySelector(".ee-contact__box"), px = box.querySelector(".ee-form-pixels");
    // Cover the panel with cells of about 24px, switch them on in shuffled order (within .35s), swap, then switch them off the same way
    const swap = (fn) => {
      if (reduced) return fn();
      const b = box.getBoundingClientRect(), size = 24, cols = Math.ceil(b.width / size), rows = Math.ceil(b.height / size);
      px.innerHTML = Array.from({ length: cols * rows }, (_, i) => `<span style="left:${(i % cols) * size}px;top:${Math.floor(i / cols) * size}px;width:${size + 1}px;height:${size + 1}px"></span>`).join("");
      const cells = px.children;
      gsap.to(cells, { opacity: 1, duration: 0, stagger: { amount: 0.35, from: "random" }, onComplete: () => {
        fn();
        ScrollTrigger.refresh();
        gsap.to(cells, { opacity: 0, duration: 0, delay: 0.08, stagger: { amount: 0.35, from: "random" }, onComplete: () => (px.innerHTML = "") });
      } });
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = form.name.value.trim() && /.+@.+/.test(form.email.value) && form.message.value.trim() && form.consent.checked;
      err.hidden = !!ok;
      if (!ok) return;
      swap(() => { form.hidden = true; sent.hidden = false; sent.querySelector(".ee-sent__head").focus({ preventScroll: true }); });
    });
    sent.querySelector("[data-again]").addEventListener("click", () => swap(() => { form.reset(); topics.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false")); sent.hidden = true; form.hidden = false; }));
  }
})();
