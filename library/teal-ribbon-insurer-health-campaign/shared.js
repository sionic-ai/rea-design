// Interactions shared by several pages — header burger·dropdown, Hero slider (Swiper fade), tabs (pressing scrolls to the tab head .8s easeOutQuart), video modal (MicroModal), company page card slider.
// In-page anchor moves and folding are handled by the motion parts (anchor-glide-open, height-fold).
(() => {
  const mqSp = window.matchMedia("(max-width: 960px)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headH = () => document.querySelector(".js-head")?.clientHeight || 0;

  // Original tab and anchor scrolling is anime.js easeOutQuart 800ms — GSAP power3.out is the same formula (1-(1-t)^4)
  const glideTo = (y) => {
    const s = { y: window.scrollY };
    if (reduce) return window.scrollTo(0, y);
    gsap.to(s, { y, duration: 0.8, ease: "power3.out", overwrite: true, onUpdate: () => window.scrollTo(0, s.y) });
  };

  const initHead = () => {
    const head = document.querySelector(".js-head");
    if (!head) return;
    const trigger = head.querySelector(".js-head-trigger");
    let y = 0;
    const close = () => {
      if (!head.classList.contains("is-open")) return;
      head.classList.remove("is-open");
      trigger?.setAttribute("aria-expanded", "false");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      window.scrollTo(0, y);
    };
    const open = () => {
      y = window.scrollY;
      head.classList.add("is-open");
      trigger?.setAttribute("aria-expanded", "true");
      // The original pins body with fixed while open so the page behind doesn’t shift
      Object.assign(document.body.style, { position: "fixed", top: `-${y}px`, width: "100%" });
    };
    trigger?.addEventListener("click", () => (head.classList.contains("is-open") ? close() : open()));
    mqSp.addEventListener("change", () => { if (!mqSp.matches) close(); });

    const drop = head.querySelector(".js-nav-trigger");
    if (drop) {
      drop.addEventListener("click", () => {
        const on = drop.classList.toggle("is-open");
        drop.setAttribute("aria-expanded", on);
      });
      mqSp.addEventListener("change", () => { if (mqSp.matches) { drop.classList.remove("is-open"); drop.setAttribute("aria-expanded", "false"); } });
      document.addEventListener("click", (e) => {
        if (!drop.parentElement.contains(e.target) && drop.classList.contains("is-open")) { drop.classList.remove("is-open"); drop.setAttribute("aria-expanded", "false"); }
      });
    }

    // Company header bar — original js-ariaToggle: pressing an item button opens a white mega panel beneath it (other panels close), pressing again or outside closes it
    const megas = [...head.querySelectorAll(".js-mega")];
    const shut = (except) => megas.forEach((m) => { if (m !== except) { m.classList.remove("is-open"); m.querySelector("button")?.setAttribute("aria-expanded", "false"); } });
    megas.forEach((item) => {
      const btn = item.querySelector("button");
      btn?.addEventListener("click", () => {
        const on = !item.classList.contains("is-open");
        shut(item);
        item.classList.toggle("is-open", on);
        btn.setAttribute("aria-expanded", on);
      });
    });
    if (megas.length) document.addEventListener("click", (e) => { if (!e.target.closest(".js-mega")) shut(); });
    head.querySelectorAll(".js-search").forEach((wrap) => {
      const btn = wrap.querySelector(".js-search-toggle");
      const set = (on) => { wrap.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", on); if (on) wrap.querySelector("input")?.focus(); };
      btn.addEventListener("click", () => set(!wrap.classList.contains("is-open")));
      document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) set(false); });
      wrap.addEventListener("keydown", (e) => { if (e.key === "Escape") { set(false); btn.focus(); } });
    });
    head.querySelectorAll(".js-size").forEach((size) => {
      const btn = size.querySelector("button");
      btn?.addEventListener("click", () => btn.setAttribute("aria-expanded", size.classList.toggle("is-open")));
      size.querySelectorAll(".my-chead__size-pick button").forEach((b) => b.addEventListener("click", () => {
        size.querySelectorAll(".my-chead__size-pick button").forEach((x) => x.classList.toggle("is-active", x === b));
      }));
    });
  };

  const initMv = () => {
    document.querySelectorAll(".js-mv").forEach((mv) => {
      const slider = mv.querySelector(".js-mv-slider");
      const ctrl = mv.querySelector(".js-mv-controller");
      // Original: if there is only one slide, Swiper isn’t created and the buttons are hidden
      if (!slider || slider.querySelectorAll(".swiper-slide").length < 2 || !window.Swiper) return;
      const sw = new Swiper(slider, {
        grabCursor: true,
        loop: true,
        speed: 500,
        effect: "fade",
        fadeEffect: { crossFade: true },
        autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
        pagination: { el: mv.querySelector(".swiper-pagination"), clickable: true },
        keyboard: { enabled: true },
      });
      if (!ctrl) return;
      ctrl.hidden = false;
      let paused = reduce;
      ctrl.classList.toggle("is-pause", paused);
      ctrl.addEventListener("click", () => {
        paused = !paused;
        if (paused) sw.autoplay?.stop(); else sw.autoplay?.start();
        ctrl.classList.toggle("is-pause", paused);
      });
    });
  };

  const initTabs = () => {
    document.querySelectorAll(".js-tab").forEach((tab) => {
      const buttons = [...tab.querySelectorAll('[role="tab"]')];
      const panels = buttons.map((b) => tab.querySelector(`#${b.getAttribute("aria-controls")}`)).filter(Boolean);
      const render = (id, scroll) => {
        buttons.forEach((b) => {
          const on = b.getAttribute("aria-controls") === id;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on);
        });
        panels.forEach((p) => {
          const on = p.id === id;
          p.classList.toggle("is-hidden", !on);
          p.setAttribute("aria-hidden", !on);
        });
        if (scroll) glideTo(tab.getBoundingClientRect().top + window.scrollY - headH());
      };
      buttons.forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); render(b.getAttribute("aria-controls"), true); }));
      render(buttons[0]?.getAttribute("aria-controls"), false);
    });
  };

  // Video card — the original shows a video player in MicroModal (.3s fade and slide). Here, a placeholder video panel of the same ratio
  const initModal = () => {
    if (!window.MicroModal || !document.querySelector(".my-modal")) return;
    MicroModal.init({ disableScroll: true, awaitOpenAnimation: true, awaitCloseAnimation: true });
    document.querySelectorAll("[data-my-video]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const box = document.querySelector("#my-video .wf-img");
        if (box) box.dataset.label = btn.dataset.myVideo;
        MicroModal.show("my-video", { disableScroll: true, awaitOpenAnimation: true, awaitCloseAnimation: true });
      });
    });
  };

  // Company page card slider — original Swiper (.swiper-container): 1.5 cards on phones · 3 at 961 and up, 24px gap, arrows · dots, only when overflowing
  const initCarousel = () => {
    if (!window.Swiper) return;
    document.querySelectorAll(".js-carousel").forEach((outer) => {
      const box = outer.querySelector(".swiper-container");
      const n = box?.querySelectorAll(".swiper-slide").length || 0;
      if (!box || n < 2) return;
      if (n <= 3) outer.classList.add("is-few");
      new Swiper(box, {
        slidesPerView: 1.5,
        spaceBetween: 24,
        navigation: { nextEl: outer.querySelector(".swiper-button-next"), prevEl: outer.querySelector(".swiper-button-prev") },
        pagination: { el: outer.querySelector(".swiper-pagination"), type: "bullets", clickable: true },
        breakpoints: { 961: { slidesPerView: 3 } },
        watchOverflow: true,
      });
    });
  };

  // Company page side menu · footer fold — the original jQuery slideToggle (400ms swing) is handled by the height-fold part, and here only the current-page marker
  const markCurrent = () => {
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-page]").forEach((a) => a.closest("li")?.classList.toggle("is-current", a.dataset.page === here));
  };

  // Original handles same-page links (a[href^="#"]) moves everything up by the header row height with .8s easeOutQuart — attaches the parts
  const tagAnchors = () => {
    document.querySelectorAll('a[href^="#"]:not([data-fx])').forEach((a) => {
      a.dataset.fx = "anchor-glide-open";
      a.setAttribute("data-fx-anchor-glide-open", "offset: .js-head");
    });
  };

  const start = () => { tagAnchors(); initHead(); initMv(); initTabs(); initModal(); initCarousel(); markCurrent(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
