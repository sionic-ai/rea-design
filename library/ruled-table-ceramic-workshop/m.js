// Phone board: wordmark letters rising, lines that appear when visible, three people above the table (scroll angle), bowl line swap, order board.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Wordmark: split letters per line and raise each with a 200ms + 50ms delay
  let k = 0;
  $$(".ttl .ln").forEach((ln) => { ln.innerHTML = [...ln.textContent].map((c) => `<span class="ch" aria-hidden="true" style="animation-delay:${200 + 50 * k++}ms">${c}</span>`).join(""); });

  // Table text: split into lines, then each line rises in when visible
  $$(".tr p").forEach((p) => {
    const words = p.textContent.trim().split(" ");
    p.innerHTML = words.map((w) => `<span style="white-space:nowrap">${w}</span>`).join(" ");
    const rows = [];
    [...p.children].forEach((s) => { const t = s.offsetTop; rows.length && rows[rows.length - 1].t === t ? rows[rows.length - 1].w.push(s.textContent) : rows.push({ t, w: [s.textContent] }); });
    p.innerHTML = rows.map((r, i) => `<span class="ln-in" style="transition-delay:${i * .09}s">${r.w.join(" ")}</span>`).join("");
  });

  $$(".aw li").forEach((li, i) => li.style.setProperty("--i", i));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("on");
    if (!e.target.classList.contains("fin")) io.unobserve(e.target);
  }), { rootMargin: "0px 0px -12% 0px" });
  $$(".in, .aw, .tr p, .fin").forEach((n) => (reduce ? n.classList.add("on") : io.observe(n)));

  // Three figures: over the table, limbs swing by scroll angle (.22° per px)
  const gymEl = $(".gym"), gym = window.dhGym ? window.dhGym(gymEl) : null;
  const morph = $(".forms path"), forms = $(".forms");
  function tick() {
    const s = scrollY, H = innerHeight;
    if (gym) { const r = gymEl.getBoundingClientRect(); if (r.bottom > -H * .2 && r.top < H * 1.2) gym.draw(.22 * s); }
    const fy = forms.getBoundingClientRect().top;
    if (window.dhVessel && fy < H * 1.2 && fy > -H) morph.setAttribute("d", window.dhVessel(Math.max(0, Math.min(1, (H - fy) / (H + forms.offsetHeight))) * 2.999));
  }
  addEventListener("scroll", tick, { passive: true });
  tick();

  $(".totop").addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  $$(".rv").forEach((n) => (reduce ? n.classList.add("on") : io.observe(n)));

  // One detail panel: the inside is rebuilt each time it opens and appears over .45s. On closing, blocks inside the panel rise 16px from the bottom over .35s while vanishing, and
  // The name letters slide up and out at .4s and then the panel closes (original order and values)
  const view = $("#view"), xBtn = $("#close");
  let openNow = false, keep = 0, closing = false;
  const chars = (t) => [...t].map((c) => `<span class="ch" aria-hidden="true">${c === " " ? "&nbsp;" : c}</span>`).join("");
  function open(html) {
    view.innerHTML = html;
    view.scrollTop = 0;
    // After a beat (about 65ms) to build the panel inside and fix the body, the panel appears — the original opens that late too
    setTimeout(() => { view.classList.add("open"); view.setAttribute("aria-hidden", "false"); xBtn.hidden = false; }, reduce ? 0 : 65);
    if (!openNow) { keep = scrollY; Object.assign(document.body.style, { position: "fixed", top: -keep + "px", left: "0", right: "0" }); }
    openNow = true;
  }
  function close() {
    if (closing || !openNow) return;
    closing = true;
    const parts = $$(".head .lab, .face, .rows, .txt, .shelves", view).reverse(), letters = $$(".head .h .ch, .shelf .h", view);
    if (!reduce) {
      gsap.to(parts, { opacity: 0, y: -16, duration: .35, ease: "power2.in", stagger: .06 });
      gsap.to(letters, { yPercent: -110, opacity: 0, duration: .4, ease: "power2.in", stagger: { each: .03, from: "start" }, delay: .06 * parts.length * .6 });
    }
    setTimeout(() => {
      closing = false; openNow = false;
      view.classList.remove("open"); view.setAttribute("aria-hidden", "true"); xBtn.hidden = true;
      Object.assign(document.body.style, { position: "", top: "", left: "", right: "" });
      scrollTo({ top: keep, behavior: "instant" });
      if (location.hash === "#order") history.replaceState(null, "", location.pathname);
    }, reduce ? 0 : 380 + 60 * parts.length * .6 + 120);
  }
  xBtn.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && openNow) close(); });

  // Name · photo · row panes (People · Category · Case): text .8s (.04 stagger, .1 delay) · label .7s (.35) · photo from the top edge 1.1s power2.inOut (.45) · rules 1s (.12 stagger)
  function person(d) {
    open(`<div class="pv"><div class="head"><p class="disp h" aria-label="${d.name}">${chars(d.name)}</p><p class="lab">${d.sub}</p></div><div class="face ph wf-img${d.wide ? " wide" : ""}" data-label="${d.label}"></div><div class="rows">${d.rows.map((t, i) => `<div class="r"><i class="rl"></i><span class="n">0${i + 1}</span><p>${t}</p></div>`).join("")}</div></div>`);
    const face = $(".face", view);
    if (reduce) { face.style.clipPath = "none"; return; }
    gsap.fromTo($$(".head .ch", view), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .8, ease: "power3.out", stagger: .04, delay: .1 });
    gsap.fromTo($(".head .lab", view), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .7, ease: "power3.out", delay: .35 });
    gsap.fromTo(face, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power2.inOut", delay: .45 });
    gsap.fromTo($$(".rl", view), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.out", stagger: .12, delay: 1.2 });
    gsap.fromTo($$(".r .n, .r p", view), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .7, ease: "power3.out", stagger: .06, delay: 1.3 });
  }
  // Order board: a ruled three-cell shelf with one word each — from screen center into place in 1.3s power3.out (.12 stagger, .15 delay)
  function order() {
    open(`<div class="head" style="padding-bottom:var(--s3)"></div><div class="shelves"><div class="shelf"><span class="disp h">Order</span></div><div class="shelf"><span class="disp h">and</span></div><div class="shelf"><span class="disp h">Collaborate</span></div></div><div class="txt"><p>Your text goes here on what is made to order. Say panels and works are made from the first sketches and drawings.</p><p>Two or three lines here on the kind of people we want to work with.</p><a class="ul-on" href="mailto:hello@example.com">hello@example.com</a></div>`);
    if (reduce) return;
    gsap.fromTo($$(".shelf .h", view), { opacity: 0, x: (i, el) => innerWidth / 2 - (el.offsetLeft + el.offsetWidth / 2) }, { opacity: 1, x: 0, duration: 1.3, ease: "power3.out", stagger: .12, delay: .215 });
  }
  $(".ord").addEventListener("click", (e) => { e.preventDefault(); order(); });
  if (location.hash === "#order") order();
  $$(".cat").forEach((c) => c.addEventListener("click", (e) => { e.preventDefault(); person({ name: c.querySelector("span").textContent, sub: "Your category line here", label: c.querySelector("i").dataset.label, rows: ["Introduce the works in this category here in two lines.", "Your material and size in one line here."] }); }));
  $$(".who").forEach((w) => w.addEventListener("click", (e) => { e.stopPropagation(); person({ name: w.querySelector("b").textContent, sub: w.querySelector("span").textContent, label: "Black-and-white portrait of that person · Portrait 4:5", rows: ["Your three or so lines on what this person does here.", "What you bring to the work goes here, about three lines."] }); }));
  $$(".mcase").forEach((c) => c.querySelector(".pic").addEventListener("click", () => person({ name: c.querySelector("h3").textContent, sub: c.querySelector(".cc .lab").textContent, label: c.querySelector(".pic").dataset.label, wide: true, rows: ["Case location in one line — which city, what shop.", "Your two lines here describing the work created for this space."] })));
})();
