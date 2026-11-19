// The panel recedes only while the footer marker is in view (original FooterTrigger: IntersectionObserver threshold 0)
(() => {
  kfFx.register("recede-footer", (el, { options, scroller }) => {
    let end = el.parentElement && el.parentElement.querySelector(':scope > [data-fx-part="end"]');
    let made = null;
    if (!end) {
      made = end = document.createElement("div");
      end.setAttribute("data-fx-part", "end");
      end.setAttribute("aria-hidden", "true");
      end.style.marginTop = `${-Math.abs(+(options.lead ?? 200))}px`;
      (el.nextElementSibling ? el.nextElementSibling : el).after(end);
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => el.classList.toggle("is-receded", e.isIntersecting)), { root: scroller || null, threshold: 0 });
    io.observe(end);
    return () => { io.disconnect(); el.classList.remove("is-receded"); if (made) made.remove(); };
  });
})();
