// About page: sections with a top line being drawn, number counting, team photo circle wipe and member drawer, testimonial Splide (fade, rewind)
(() => {
  MV.page("about", {
    ready(box) {
      const offs = [];
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, () => {
        // Original c-text-mb: the top line color fills in over 1.2s after .6s, and the back circle enters from the lower left
        box.querySelectorAll(".mv-textb:not(.t-gray)").forEach((sec) => {
          const wrap = sec.querySelector(".mv-textb__wrap");
          const color = getComputedStyle(wrap).borderTopColor;
          const tl = gsap.timeline({ defaults: { ease: "ff_expo_out" }, scrollTrigger: { trigger: sec, start: "top 90%" } });
          tl.fromTo(wrap, { borderTopColor: "transparent" }, { borderTopColor: color, duration: 1.2, delay: 0.6 });
          tl.from(sec.querySelector(".u-circle"), { xPercent: -25, yPercent: 25, opacity: 0, duration: 1.2 }, "<");
        });
        // Original statistics-data: from 0 to the end number in 1s power2.out, padding the digits with 0
        box.querySelectorAll(".mv-stat").forEach((stat) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: stat, start: "top 90%" } });
          stat.querySelectorAll("[data-digits]").forEach((d) => {
            const end = parseFloat(d.dataset.digits);
            const len = d.dataset.digits.length;
            const o = { value: 0 };
            tl.to(o, { value: end, duration: 1, ease: "power2.out", onUpdate: () => (d.textContent = String(Math.floor(o.value)).padStart(len, "0")) }, 0);
          });
        });
        // Original team-mb-member: photo circle wipe 1.4x faster, name text .125 later
        box.querySelectorAll(".mv-member").forEach((m) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: "top 90%" } });
          tl.add(MV.mediaReveal(m.querySelector(".mv-member__image")).timeScale(1.4), 0);
          tl.add(MV.wysiwyg(m.querySelector(".mv-member__info")), 0.125);
        });
        // Original c-testimonials-mb: section name 1.2s, quote lines rise from 110% below over 1.2s (.03), name .9s ff_expo_in_out
        box.querySelectorAll(".mv-testi").forEach((sec) => {
          const quote = sec.querySelector(".mv-testi__item .mv-testi__quote");
          const st = MV.split(quote, "lines", { mask: "lines" });
          const tl = gsap.timeline({ defaults: { stagger: 0.03 }, scrollTrigger: { trigger: sec, start: "top 90%" }, onComplete: () => st.revert() });
          tl.from(sec.querySelector(".mv-surtitle"), { opacity: 0, duration: 1.2, ease: "power2.out" }, "<+0.2");
          tl.from(st.lines, { yPercent: 110, duration: 1.2, ease: "ff_expo_out" }, "<-0.2");
          tl.from(sec.querySelectorAll(".mv-testi__item:first-child .mv-testi__info > *"), { opacity: 0, yPercent: 20, duration: 0.9, ease: "ff_expo_in_out", stagger: 0.05 }, "<+0.1");
        });
      });

      // Review slider: same Splide fade and rewind as the original, numbering 01 / 03
      box.querySelectorAll(".mv-testi__slider").forEach((el) => {
        if (!window.Splide) return;
        const s = new Splide(el, { type: "fade", rewind: true, speed: 400, pagination: false, drag: !MV.reduced, arrows: true });
        const cur = el.querySelector("[data-cur]");
        const total = el.querySelector("[data-total]");
        s.on("mounted move", () => {
          cur.textContent = String(s.index + 1).padStart(2, "0");
          total.textContent = String(s.length).padStart(2, "0");
        });
        s.mount();
        offs.push(() => s.destroy(true));
      });

      // Member drawer (original dynamic-content-overlay): .125s after the panel turns on, the original team-mb-member — photo circle wipe 1.4x, text blur rise
      const modal = box.querySelector("[data-member-modal]");
      if (modal) {
        const panel = modal.querySelector(".mv-modal__panel");
        const back = modal.querySelector(".mv-modal__backdrop");
        const open = (m) => {
          modal.querySelector("[data-modal-name]").textContent = m.querySelector(".mv-member__name").textContent;
          modal.querySelector("[data-modal-pos]").textContent = m.querySelector(".mv-member__pos").textContent;
          modal.classList.add("is-open");
          modal.setAttribute("aria-hidden", "false");
          MV.lock();
          gsap.to(back, { opacity: 1, duration: MV.reduced ? 0 : 0.6, ease: "ff_expo_out", overwrite: true });
          gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: MV.reduced ? 0 : 0.3, ease: "power2.out", overwrite: true });
          if (!MV.reduced) {
            const tl = gsap.timeline({ delay: 0.125 });
            tl.add(MV.mediaReveal(modal.querySelector(".mv-modal__image")).timeScale(1.4), 0);
            tl.add(MV.wysiwyg(modal.querySelector(".mv-modal__info")), 0.125);
          }
        };
        const close = () => {
          if (!modal.classList.contains("is-open")) return;
          MV.unlock();
          modal.setAttribute("aria-hidden", "true");
          gsap.to(back, { opacity: 0, duration: MV.reduced ? 0 : 0.5, ease: "power2.inOut", overwrite: true });
          gsap.to(panel, { opacity: 0, duration: MV.reduced ? 0 : 0.4, ease: "power2.in", overwrite: true, onComplete: () => modal.classList.remove("is-open") });
        };
        gsap.set(panel, { opacity: 0 });
        box.querySelectorAll("[data-member]").forEach((m) => {
          const b = m.querySelector(".mv-member__link");
          const h = () => open(m);
          b.addEventListener("click", h);
          offs.push(() => b.removeEventListener("click", h));
        });
        modal.querySelectorAll("[data-close-modal]").forEach((b) => b.addEventListener("click", close));
        const esc = (e) => e.key === "Escape" && close();
        addEventListener("keydown", esc);
        offs.push(() => { removeEventListener("keydown", esc); close(); });
      }
      return () => { mm.revert(); offs.forEach((f) => f()); };
    },
  });
})();
