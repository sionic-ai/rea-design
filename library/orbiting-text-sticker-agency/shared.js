// Common to all pages: draws header · phone menu · contact block · today’s line · footer, and hooks up the sticker picker window and drag-to-attach.
// The original is a Next.js app router so there is no transition effect between pages — none here either.
// Original numbers: the sticker is a bounce-in keyframe (−35%→−40%→…→0) .7s, and the window opens growing with .3s (0,0,.2,1).
(() => {
  const page = document.body.dataset.page || "home";
  const ID = (window.ID = window.ID || {});
  const chara = (name, extra = "") => `<span data-shape="${name}" ${extra}></span>`;

  const menu = [["Company About", "about.html", "about"], ["Service", "service.html", "service"], ["Track record", "works.html", "works"], ["News", "news.html", "news"], ["Blog", "index.html#blog"], ["Hiring", "recruit.html", "recruit"]];
  const logo = '<a class="id-logo" href="index.html" aria-label="Home">LOGO</a>';

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("id-head");
    head.innerHTML = `${logo}<nav class="id-nav" aria-label="Main menu">${menu.map(([t, h]) => `<a class="id-ul" href="${h}">${t}</a>`).join("")}</nav><a class="id-cta" href="#contact">Contact Us</a>`;
    head.insertAdjacentHTML("afterend", `
      <button class="id-menu-btn" type="button" aria-expanded="false">MENU</button>
      <div class="id-menu" data-slot="menu-overlay">
        ${logo}
        <span class="id-menu__label">MENU</span>
        <div>
          <nav>${menu.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}<a href="#contact">Contact Us</a></nav>
          <div class="id-menu__sub"><a href="#">Privacy policy</a><a href="#">SNS 1</a><a href="#">SNS 2</a></div>
          <div class="id-menu__chara" data-shape="gblob"></div>
        </div>
      </div>
      <button class="id-add" type="button" aria-label="Apply a sticker" data-slot="add-sticker"><span class="id-add__dot"><span class="id-add__chara" data-shape="blacky"></span></span><span class="id-add__txt">Add Sticker</span></button>`);
    const btn = document.querySelector(".id-menu-btn");
    const root = document.documentElement;
    const set = (open) => { root.classList.toggle("is-menu", open); btn.textContent = open ? "CLOSE" : "MENU"; btn.setAttribute("aria-expanded", open); };
    btn.addEventListener("click", () => set(!root.classList.contains("is-menu")));
    document.querySelectorAll(".id-menu a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    contact.id = "contact";
    contact.classList.add("id-contact");
    contact.innerHTML = `
      <h2 class="id-h2">Contact</h2>
      <p class="id-t18">Your one line here: feel free to ask about anything, consultations, quotes and more.<br>A line noting phone inquiries are welcome too.</p>
      <p class="id-contact__tel"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M5 2h3l1.5 4-2 1.5a10 10 0 0 0 5 5L14 10.5l4 1.5v3c0 1-1 2-2 2C9 17 3 11 3 4c0-1 1-2 2-2Z"/></svg>000-000-0000 (Weekdays 0:00–00:00)</p>
      <p class="id-t15">※ No sales solicitations, please.</p>
      <a class="id-btn" href="#">Contact Us</a>`;
    contact.insertAdjacentHTML("afterend", `<div class="id-word" data-slot="word-line"><span>Today’s quote</span><p>Put today’s one-line quote here. Put the speaker in parentheses after it. (Name)</p></div>`);
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("id-foot");
    // Original footer flow: six characters (name · footer background color when a hand is raised · position % · width % · tilt)
    const row = [
      ["arrow", "red", 50, 60, 100, 0], ["yman", "orange", 54, 42.86, 130, 9], ["figure", "violet2", 50, 50, 120, 0],
      ["book", "cream", 50, 50, 100, 0], ["gblob", "green", 50, 50, 100, 0], ["burst", "pink", 57.14, 57.14, 130, 5],
    ];
    const cell = ([n, c, t, l, w, r]) => `<div class="id-foot__cell" data-c="${c}"><span data-shape="${n}" style="top:${t}%;left:${l}%;width:${w}%;rotate:${r}deg"></span></div>`;
    foot.innerHTML = `
      <div class="id-foot__top">
        <a class="id-foot__logo" href="index.html"><i></i>LOGO</a>
        <ul>${menu.slice(0, 4).map(([t, h]) => `<li><a class="id-ul" href="${h}">${t}</a></li>`).join("")}</ul>
        <ul><li><a class="id-ul" href="index.html#blog">Blog</a></li><li><a class="id-ul" href="recruit.html">Hiring</a></li><li><a class="id-ul" href="#contact">Contact Us</a></li></ul>
        <ul><li><a class="id-ul" href="#">Privacy policy</a></li><li><a class="id-ul" href="#">SNS 1</a></li><li><a class="id-ul" href="#">SNS 2</a></li></ul>
      </div>
      <div class="id-foot__run" aria-hidden="true">${[0, 1].map(() => `<div class="id-foot__track">${row.map(cell).join("")}</div>`).join("")}</div>
      <p class="id-foot__copy">0000 COMPANY INC. All Rights Reserved</p>`;
    // When the pointer touches a character image the Footer background takes that character’s color (transition-colors .15s), and returns to its own color when leaving the Footer
    foot.querySelectorAll(".id-foot__cell").forEach((c) => c.addEventListener("mouseover", () => foot.style.setProperty("--foot-bg", `var(--site-c-${c.dataset.c})`)));
    foot.addEventListener("mouseleave", () => foot.style.removeProperty("--foot-bg"));
    // react-fast-marquee speed 40: the distance one set (minimum band width) travels = One set width ÷ 40px/s — character width overflowing the cell is not counted (original 38.88s = 18vw × 6 ÷ 40)
    const run = foot.querySelector(".id-foot__run"), track = run.querySelector(".id-foot__track");
    const dur = () => run.style.setProperty("--dur", `${track.offsetWidth / 40}s`);
    new ResizeObserver(dur).observe(run);
    dur();
  }

  // ── Work card: random ±1.5~3° each time it enters (original WorksCard), 0 when it leaves ──
  document.querySelectorAll(".id-work").forEach((a) => {
    a.addEventListener("mouseenter", () => { const d = 1.5 * Math.random() + 1.5; a.style.setProperty("--tilt", `${Math.random() < 0.5 ? -d : d}deg`); });
    a.addEventListener("mouseleave", () => a.style.setProperty("--tilt", "0deg"));
  });

  // ── Sticker: picker window → chosen shape pops out at screen center, drag to place it anywhere ──
  const picker = document.createElement("div");
  picker.className = "id-picker";
  picker.dataset.slot = "sticker-picker";
  picker.innerHTML = `<div class="id-picker__win" role="dialog" aria-modal="true" aria-label="Pick a sticker">
      <div class="id-picker__bar"><span class="id-picker__dots"><i style="background:var(--site-c-sky)"></i><i style="background:var(--site-c-red)"></i><i style="background:var(--site-c-yellow)"></i></span><button class="id-picker__x" type="button">CLOSE <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.6"><path d="m1 1 12 12M13 1 1 13"/></svg></button></div>
      <h2>CHOOSE STICKER</h2>
      <div class="id-picker__grid">${ID.stickerNames.map((n) => `<button type="button" data-pick="${n}" aria-label="${n}">${chara(n, "data-still")}</button>`).join("")}</div>
    </div>`;
  document.body.append(picker);
  const close = () => picker.classList.remove("is-open");
  picker.querySelector(".id-picker__x").addEventListener("click", close);
  picker.addEventListener("click", (e) => e.target === picker && close());
  addEventListener("keydown", (e) => e.key === "Escape" && close());
  document.querySelector(".id-add")?.addEventListener("click", () => picker.classList.add("is-open"));
  picker.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => {
    close();
    const s = document.createElement("div");
    s.className = "id-sticker";
    s.innerHTML = chara(b.dataset.pick);
    const w = innerWidth <= 840 ? 96 : 140;
    s.style.left = innerWidth / 2 - w / 2 + (Math.random() - 0.5) * 200 + "px";
    s.style.top = scrollY + innerHeight / 2 - w / 2 + (Math.random() - 0.5) * 120 + "px";
    s.style.rotate = (Math.random() - 0.5) * 30 + "deg";
    document.body.append(s);
    ID.mount?.(s.firstElementChild, b.dataset.pick);
    let sx, sy, ox, oy;
    s.addEventListener("pointerdown", (e) => {
      s.setPointerCapture(e.pointerId);
      s.classList.add("is-drag");
      sx = e.pageX; sy = e.pageY; ox = parseFloat(s.style.left); oy = parseFloat(s.style.top);
    });
    s.addEventListener("pointermove", (e) => {
      if (!s.classList.contains("is-drag")) return;
      s.style.left = ox + e.pageX - sx + "px";
      s.style.top = oy + e.pageY - sy + "px";
    });
    const up = () => s.classList.remove("is-drag");
    s.addEventListener("pointerup", up);
    s.addEventListener("pointercancel", up);
  }));

})();
