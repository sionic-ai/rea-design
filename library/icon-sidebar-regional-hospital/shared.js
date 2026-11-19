// Original values — reveal: children at 500ms offsets from 30% of the panel with .show (.9s ease-out), recruit hero: photos at 300ms offsets, then text at 900ms,
// Mega menu: opens 100ms after hover (1024 and up), hero Splide fade 5000/2000 + photo 1.1→1 over 5s, topic Splide 313/26 → above 1024 438/56.
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = window.matchMedia("(min-width: 1024px)");

  const fades = () => {
    const show = (els, step) => els.forEach((el, i) => setTimeout(() => el.classList.add("show"), i * step));
    const groups = document.querySelectorAll(".sg-fade");
    const saiyo = document.querySelector("[data-fade-saiyo]");
    if (reduce || !("IntersectionObserver" in window)) {
      groups.forEach((g) => show([...g.children], 0));
      document.querySelectorAll("[data-fade-img],[data-fade-text]").forEach((el) => el.classList.add("show"));
      return;
    }
    groups.forEach((g) => {
      const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); show([...g.children], 500); } }), { threshold: 0.3 });
      io.observe(g);
    });
    if (saiyo) {
      const imgs = [...document.querySelectorAll("[data-fade-img]")];
      const txt = document.querySelector("[data-fade-text]");
      const io = new IntersectionObserver((en) => en.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        show(imgs, 300);
        setTimeout(() => txt?.classList.add("show"), (imgs.length - 1) * 300 + 900);
      }), { threshold: 0.3 });
      setTimeout(() => io.observe(saiyo), 500);
    }
  };

  const header = () => {
    const cover = document.getElementById("sg-cover");
    const btn = document.querySelector(".sg-navbtn");
    const nav = document.querySelector(".sg-nav");
    const triggers = [...document.querySelectorAll("[data-menu-trigger]")];
    let openT = null, closeT = null;
    const setCover = () => cover?.classList.toggle("is-on", wide.matches && triggers.some((t) => t.getAttribute("aria-expanded") === "true"));
    const openOne = (t) => { triggers.forEach((o) => { o.setAttribute("aria-expanded", String(o === t)); o.nextElementSibling?.classList.toggle("is-open", o === t); }); setCover(); };
    const closeAll = () => { triggers.forEach((o) => { o.setAttribute("aria-expanded", "false"); o.nextElementSibling?.classList.remove("is-open"); }); setCover(); };
    triggers.forEach((t) => {
      const li = t.closest("li");
      t.addEventListener("click", (e) => { if (wide.matches && e.pointerType !== "touch" && e.detail) return; e.preventDefault(); t.getAttribute("aria-expanded") === "true" ? closeAll() : openOne(t); });
      li.addEventListener("pointerenter", (e) => { if (!wide.matches || e.pointerType === "touch") return; clearTimeout(closeT); clearTimeout(openT); openT = setTimeout(() => openOne(t), 100); });
      li.addEventListener("pointerleave", (e) => { if (!wide.matches || e.pointerType === "touch") return; clearTimeout(openT); closeT = setTimeout(closeAll, 100); });
    });
    cover?.addEventListener("click", () => { closeAll(); if (nav?.classList.contains("is-open")) btn?.click(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
    btn?.addEventListener("click", () => {
      const on = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", on);
      btn.closest(".sg-header")?.classList.toggle("is-open", on);
      btn.parentElement.classList.toggle("is-open", on);
      cover?.classList.toggle("is-on", on);
      btn.setAttribute("aria-expanded", String(on));
      document.documentElement.style.overflow = on ? "hidden" : "";
    });
    wide.addEventListener("change", () => { closeAll(); nav?.classList.remove("is-open"); btn?.closest(".sg-header")?.classList.remove("is-open"); btn?.parentElement.classList.remove("is-open"); btn?.setAttribute("aria-expanded", "false"); document.documentElement.style.overflow = ""; });
  };

  const tabs = () => document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const all = [...list.querySelectorAll('[role="tab"]')];
    const pick = (t) => all.forEach((o) => {
      const on = o === t;
      o.setAttribute("aria-selected", String(on));
      const p = document.getElementById(o.getAttribute("aria-controls"));
      if (p) on ? p.removeAttribute("inert") : p.setAttribute("inert", "");
    });
    all.forEach((t) => t.addEventListener("click", () => pick(t)));
  });

  // News and topic placeholder rows — the original is a post list, so the same type is stamped a few rows at a time
  const CATS = [["is-blue", "Bidding Info"], ["is-blue", "News"], ["is-imp", "Important"], ["is-blue", "Patients·General"], ["is-blue", "Hiring Info"]];
  const row = (i) => {
    const c1 = CATS[i % CATS.length], c2 = CATS[(i + 3) % CATS.length];
    const ttl = ["Your news title goes here in one line, bid notice (open competitive bidding)", "Your short News title here", "A line for a slightly longer news title here", "Days left until the festival", "Your clinic day change notice here"][i % 5];
    return `<li class="sg-row"><a class="sg-arwlink sg-row__a" href="news.html"><time class="sg-row__date sg-num">0000.00.00</time><span class="sg-row__cats"><span class="sg-cat ${c1[0]}">${c1[1]}</span><span class="sg-cat ${c2[0]}">${c2[1]}</span></span><span class="sg-row__ttl">${ttl}</span><span class="sg-arwlink__arrow"><svg class="sg-ico"><use href="#sg-i-arw"/></svg></span></a></li>`;
  };
  const lists = () => {
    const host = document.querySelector("[data-sg-panels]");
    if (host) {
      const ids = ["all", "bid", "imp", "news", "pt", "pro", "rec"];
      host.innerHTML = ids.map((id, k) => `<div class="sg-panel" id="sg-panel-${id}" role="tabpanel"${k ? " inert" : ""}><ul class="sg-rows">${[0, 1, 2, 3, 4].map((i) => row(i + k)).join("")}</ul></div>`).join("");
    }
    document.querySelectorAll("[data-sg-rows]").forEach((ul) => { ul.innerHTML = Array.from({ length: +ul.dataset.sgRows || 10 }, (_, i) => row(i)).join(""); });
    const topics = document.querySelector("[data-sg-topics]");
    if (topics) {
      const pics = ["Staff member pushing a wheelchair · hospital corridor · landscape", "Hospital building view and program guide · landscape", "Festival stage · Landscape", "Smiling staff in restaurant · landscape", "Health class scene · landscape"];
      topics.innerHTML = pics.map((p, i) => `<li class="splide__slide sg-topic"><a class="sg-topic__a" href="news.html"><span class="sg-topic__img"><span class="sg-zoom wf-img" data-label="${p}"></span></span><span class="sg-topic__meta"><time class="sg-num">0000.00.00</time><span class="sg-cat">News</span><span class="sg-cat">Topic</span></span><span class="sg-topic__ttl">${["Your topic title in one line here", "Hospital name here · specialist training program", "Festival Name 0000", "Your topic title here", "Health Class Info"][i]}</span></a></li>`).join("");
    }
  };

  const sliders = () => {
    if (!window.Splide) return;
    const fv = document.querySelector(".js-fv-slider");
    if (fv) new Splide(fv, { type: "fade", autoplay: !reduce, interval: 5000, speed: 2000, rewind: true, rewindSpeed: 0, drag: false, pauseOnHover: false, pauseOnFocus: false, pagination: false, arrows: false }).mount();
    const tp = document.querySelector(".js-topics-slider");
    if (tp) new Splide(tp, { fixedWidth: 313, gap: 26, pagination: false, mediaQuery: "min", breakpoints: { 1024: { fixedWidth: 438, gap: 56 } } }).mount();
  };

  const footer = () => document.querySelectorAll(".sg-sitemap__toggle").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true"))));

  const current = () => { const k = document.body.dataset.current; if (k != null) document.querySelectorAll(".sg-nav__item")[+k]?.classList.add("is-current"); };
  const init = () => { lists(); current(); header(); tabs(); sliders(); footer(); fades(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
