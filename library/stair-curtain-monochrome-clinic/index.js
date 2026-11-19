// Home — hero curtain (once per session), feature strip horizontal scroll, treatment row photo swap, phone hero news line advance.
// Original value: membrane = 300ms later splash-is-on (2.56s, wheel and touch blocked meanwhile) → splashed · News slides every 5450ms with .5s ease-in-out
(() => {
  let ticker = null;
  MK.page("home", (box, move) => {
    const offs = [];

    // Hero curtain — only on the first page opened in a session. After that, straight to splashed (lifts in .3s)
    const sp = box.querySelectorAll("[data-splash]");
    const first = !sessionStorage.getItem("splashed") && !MK.reduced;
    if (first) {
      const block = (e) => e.preventDefault();
      const t1 = setTimeout(() => {
        document.addEventListener("touchmove", block, { passive: false });
        document.addEventListener("wheel", block, { passive: false });
        sp.forEach((el) => el.classList.add("splash-is-on"));
        sessionStorage.setItem("splashed", "1");
        const t2 = setTimeout(() => {
          document.removeEventListener("touchmove", block);
          document.removeEventListener("wheel", block);
          document.body.classList.add("splashed");
          sp.forEach((el) => el.classList.add("splashed"));
        }, 2560);
        offs.push(() => clearTimeout(t2));
      }, 300);
      offs.push(() => clearTimeout(t1));
    } else {
      document.body.classList.add("splashed");
      sp.forEach((el) => el.classList.add("splashed"));
    }

    // Phone hero News — the current row moves to the center, the previous row slides up and out
    clearInterval(ticker);
    const news = box.querySelectorAll(".hm-mv__newsTxt a");
    if (news.length) {
      let n = 0;
      const show = (i) => news.forEach((a, k) => {
        a.classList.remove("is-on", "is-off");
        if (k === i) a.classList.add("is-on");
        if (k === (i - 1 < 0 ? news.length - 1 : i - 1)) a.classList.add("is-off");
      });
      const step = () => { show(n); n = (n + 1) % news.length; };
      step();
      ticker = setInterval(step, 5450);
      offs.push(() => clearInterval(ticker));
    }

    // Features — PC: section height = (Strip width − window width) + window height, moves the strip horizontally 1:1 with the in-section scroll share. Phone: swipe the strip by hand
    const fea = box.querySelector(".hm-fea");
    const inner = box.querySelector(".hm-fea__inner");
    const track = box.querySelector(".hm-fea__track");
    const slides = box.querySelectorAll(".hm-fea__slide");
    const crnt = box.querySelector(".hm-fea__num .crnt");
    box.querySelector(".hm-fea__num .total").textContent = String(slides.length).padStart(2, "0");
    const count = () => slides.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.left <= innerWidth / 2) crnt.textContent = String(i + 1).padStart(2, "0");
    });
    if (MK.isPC()) {
      let over = 0, top = 0, rt = 0;
      const size = () => {
        over = track.clientWidth - innerWidth;
        fea.style.height = over + innerHeight + "px";
        top = fea.offsetTop;
      };
      const resize = () => { if (MK.move !== move) return; clearTimeout(rt); rt = setTimeout(size, 1500); };
      const onScroll = () => {
        if (MK.move !== move) return;
        count();
        const y = scrollY - top;
        if (y >= 0 && y - over <= 0) {
          inner.scroll(Math.round((y / over) * over), 0);
          slides.forEach((s) => {
            const r = s.getBoundingClientRect();
            if (r.top <= innerHeight && !s.classList.contains("watched") && r.left <= innerWidth / 2) s.classList.add("watched");
          });
        } else if (y >= 0) inner.scroll(Math.round(over), 0);
        else if (y - over <= 0) inner.scroll(0, 0);
      };
      addEventListener("resize", resize);
      addEventListener("scroll", onScroll);
      size();
      onScroll();
      // If the font loads late and the strip width changes, measure again
      document.fonts && document.fonts.ready.then(() => { if (MK.move === move) { size(); onScroll(); } });
      offs.push(() => { removeEventListener("resize", resize); removeEventListener("scroll", onScroll); clearTimeout(rt); fea.style.height = ""; });
    } else {
      let t = 0;
      const tick = () => {
        if (MK.move !== move) return;
        slides.forEach((s, i) => {
          const r = s.getBoundingClientRect();
          if (r.left <= innerWidth / 2) {
            crnt.textContent = String(i + 1).padStart(2, "0");
            if (r.top <= innerHeight / 2 && !s.classList.contains("watched")) s.classList.add("watched");
          }
        });
        t = setTimeout(tick, 200);
      };
      tick();
      offs.push(() => clearTimeout(t));
    }

    // Treatment row — enlarge the photo (1 + index) of the hovered row, and show the first photo (flower) on release
    const imgs = box.querySelectorAll(".hm-tre__frame > .wf-img");
    box.querySelectorAll(".hm-tre__row").forEach((row, i) => {
      const pick = (k) => imgs.forEach((im, j) => im.classList.toggle("crnt", j === k));
      const on = () => pick(i + 1), out = () => pick(0);
      row.addEventListener("mouseenter", on);
      row.addEventListener("mouseleave", out);
      offs.push(() => { row.removeEventListener("mouseenter", on); row.removeEventListener("mouseleave", out); });
    });

    return () => offs.forEach((f) => f());
  });
})();
