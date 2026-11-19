// First page — Hero · mission photo slider (slick fade 1000ms · 4s), pledge fold (slideToggle 300), team · work intro window (slick, grows at .3s), career/about tabs
(() => {
  const $ = window.jQuery;
  if (!$ || !$.fn.slick) return;
  const root = document.documentElement;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fade = {
    arrows: false, dots: false, speed: 1000, autoplay: true, autoplaySpeed: 4000,
    draggable: false, swipe: false, fade: true, pauseOnFocus: false, pauseOnHover: false,
  };
  // Add is-add (5s zoom in/out) to the incoming section and is-remove to the leaving one — remove both when the transition ends
  const zoomEvents = {
    beforeChange(e, s, cur, next) {
      $(".slick-slide", this).eq(next).addClass("is-add");
      $(".slick-slide", this).eq(cur).addClass("is-remove");
    },
    afterChange() { $(".is-remove", this).removeClass("is-remove is-add"); },
  };

  // ── Pledge fold ──
  let last = 0;
  document.querySelectorAll(".sm-acc").forEach((acc) => {
    const btn = acc.querySelector(".sm-acc__btn"), body = acc.querySelector(".sm-acc__body");
    btn.addEventListener("click", () => {
      const now = Date.now();
      if (now - last <= 300) return;
      last = now;
      $(body).slideToggle(reduce() ? 0 : 300);
      const open = !btn.classList.contains("is-open");
      btn.classList.toggle("is-open", open);
      btn.classList.toggle("is-close", !open);
      body.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  // ── About window: bakes a chapter from a list row ──
  const boxes = {};
  function buildTeam(box) {
    const tpl = document.getElementById("sm-tpl-team");
    const slider = box.querySelector("[data-slider]");
    document.querySelectorAll(".sm-team__item").forEach((item, i) => {
      const s = tpl.content.firstElementChild.cloneNode(true);
      s.querySelector(".sm-slide__name").textContent = item.querySelector(".sm-team__name span").textContent;
      if (i % 3 !== 2) s.querySelector('[data-tab="media"]').parentElement.remove();
      slider.append(s);
    });
  }
  function buildWorks(box) {
    const tpl = document.getElementById("sm-tpl-works");
    const slider = box.querySelector("[data-slider]");
    document.querySelectorAll(".sm-work").forEach((item, i) => {
      const s = tpl.content.firstElementChild.cloneNode(true);
      const tags = s.querySelector(".sm-tags");
      const note = item.querySelector(".sm-work__note")?.textContent;
      [note ? `#${note}` : null, ...[...item.querySelectorAll(".sm-tags li")].map((t) => t.textContent)].filter(Boolean)
        .forEach((t) => tags.append(Object.assign(document.createElement("li"), { textContent: t })));
      s.querySelector(".sm-slide__name").textContent = item.querySelector(".sm-work__ttl").textContent;
      s.querySelector(".sm-slide__img .wf-img").dataset.label = item.querySelector(".wf-img").dataset.label;
      if (i % 2) s.querySelector(".sm-related")?.remove();
      slider.append(s);
    });
  }

  // Only text cells taller than the window get inner scroll + bottom blur (original overflowScrollSetFnc)
  function fitScroll() {
    document.querySelectorAll(".sm-modal.is-show .slick-current [data-scroll-area]").forEach((area) => {
      if (area.offsetParent === null) return;
      area.scrollTop = 0;
      area.removeAttribute("style");
      area.classList.remove("is-scroll", "is-end");
      const wrap = area.closest("[data-scroll-wrap]");
      const used = [...wrap.querySelectorAll("[data-scroll-child]")].reduce((h, c) => h + c.offsetHeight, 0);
      const dif = used + Math.floor(area.offsetHeight) - Math.round(wrap.clientHeight);
      if (dif > 0) {
        area.classList.add("is-scroll");
        area.style.maxHeight = `${Math.floor(area.offsetHeight) - dif}px`;
      }
    });
  }
  document.addEventListener("scroll", (e) => {
    const a = e.target;
    if (!(a instanceof Element) || !a.classList.contains("is-scroll")) return;
    a.classList.toggle("is-end", Math.round(a.offsetHeight + a.scrollTop + 0.5) >= Math.floor(a.firstElementChild.offsetHeight));
  }, true);

  let keep = 0, opener = null;
  function open(kind, index) {
    const box = boxes[kind];
    if (!box) return;
    keep = scrollY;
    $(box.querySelector("[data-slider]")).slick("slickGoTo", index, true);
    box.classList.add("is-show");
    box.focus({ preventScroll: true });
    root.classList.add("fx-modal-open");
    fitScroll();
  }
  function close() {
    Object.values(boxes).forEach((b) => b.classList.remove("is-show"));
    document.querySelectorAll('.sm-tabs__btn[data-tab="career"]:not(.is-active)').forEach((b) => b.click());
    root.classList.remove("fx-modal-open");
    scrollTo(0, keep);
    opener?.focus({ preventScroll: true });
    opener = null;
  }

  function initModals() {
    document.querySelectorAll("[data-modal-box]").forEach((box) => {
      const kind = box.dataset.modalBox;
      boxes[kind] = box;
      if (kind === "team") buildTeam(box); else buildWorks(box);
      const slider = box.querySelector("[data-slider]");
      const slides = [...slider.children];
      slides.forEach((s, i) => {
        s.querySelector(".sm-pager__n").textContent = i + 1;
        s.querySelector(".sm-pager__all").textContent = slides.length;
        s.insertAdjacentHTML("beforeend", '<button type="button" class="sm-modal__side is-l" data-close>Close</button><button type="button" class="sm-modal__side is-r" data-close>Close</button>');
      });
      $(slider).slick({ speed: reduce() ? 0 : 300 }).on("afterChange", fitScroll);
      box.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
    });
    // Tabs (original fadeIn 300)
    document.querySelectorAll("[data-tabs]").forEach((tabs) => {
      tabs.querySelectorAll(".sm-tabs__btn").forEach((btn) => btn.addEventListener("click", () => {
        if (btn.classList.contains("is-active")) return;
        const panel = tabs.querySelector(`[data-panel="${btn.dataset.tab}"]`);
        tabs.querySelectorAll(".is-active").forEach((x) => x.classList.remove("is-active"));
        $(panel).siblings("[data-panel]").hide();
        btn.classList.add("is-active");
        panel.classList.add("is-active");
        $(panel).hide().fadeIn(reduce() ? 0 : 300);
        setTimeout(fitScroll, 300);
      }));
    });
    document.querySelectorAll("[data-modal]").forEach((t) => {
      const go = () => { opener = t; open(t.dataset.modal, +t.dataset.index); };
      t.addEventListener("click", go);
      t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("fx-modal-open") && Object.values(boxes).some((b) => b.classList.contains("is-show"))) close(); });
    let t = 0;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fitScroll, 100); });
  }

  // ── After loader clears ──
  document.addEventListener("sm:ready", () => {
    const kv = $('[data-slider="kv"]');
    kv.on("init", () => kv.find('.slick-slide[data-slick-index="0"]').addClass("is-add"))
      .slick({ ...fade, autoplay: !reduce() })
      .on(zoomEvents);

    // The mission photo starts rotating together once the back track decoration has come in by ⅔ of its height
    const ms = $('[data-slider="mission"]').slick({ ...fade }).on(zoomEvents).slick("slickPause");
    const deco = document.querySelector(".sm-deco--tracks");
    const start = () => {
      if (ms.hasClass("is-play") || !deco) return;
      const r = deco.getBoundingClientRect();
      if (innerHeight >= r.top + r.height * (2 / 3)) {
        if (!reduce()) ms.slick("slickPlay");
        ms.addClass("is-play").find('.slick-slide[data-slick-index="0"]').addClass("is-add");
        removeEventListener("scroll", start);
      }
    };
    addEventListener("scroll", start, { passive: true });
    start();

    // While off screen, auto advance pauses — so the 1s fade of an unseen section doesn’t overlap another section’s interaction response
    if (!reduce() && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        const $s = $(e.target);
        if (e.target.dataset.slider === "mission" && !$s.hasClass("is-play")) return;
        $s.slick(e.isIntersecting ? "slickPlay" : "slickPause");
      }));
      kv.each((_, el) => io.observe(el));
      ms.each((_, el) => io.observe(el));
    }
  });

  if (document.readyState === "complete") initModals(); else addEventListener("load", initModals);
})();
