// Careers — header photo strip 60s flow (original z()), careers menu pinned clone·current section marker, video colorbox and a CLOSE that follows the mouse.
(() => {
  const { isPC, reduce } = window.kfJb;
  const $ = jQuery;

  // Header photo strip — scales the 2056×540 board to fit the width and moves one image width per 60s
  const bg = document.getElementById("jb-rherobg");
  const size = () => {
    if (isPC()) {
      const a = innerWidth <= 1620 ? (2056 * innerWidth) / 1600 : 2056;
      return [a, (540 * a) / 2056];
    }
    const c = matchMedia("(max-width: 480px)").matches ? 266 : matchMedia("(max-width: 640px)").matches ? 332 : 415;
    return [(2056 * c) / 540, c];
  };
  const [a, c] = size();
  bg.style.backgroundSize = `${a}px ${c}px`;
  if (!reduce) gsap.fromTo(bg, { backgroundPosition: "0px 0px" }, { duration: 60, ease: "none", backgroundPosition: `-${a}px 0px`, repeat: -1 });

  // Careers menu — one more identical row under the fixed header (shared.js lowers it at 750px)
  const nav = document.querySelector(".jb-rnav");
  const copy = nav.cloneNode(true);
  copy.classList.add("is-clone");
  copy.removeAttribute("data-slot");
  copy.querySelector(".wf-note")?.remove();
  document.body.append(copy);
  const ids = ["#message", "#interview", "#question"];
  const mark = () => {
    if (!isPC()) return;
    const off = 50 + 9 + nav.offsetHeight;
    let cur = "";
    ids.forEach((id) => { if (document.querySelector(id).getBoundingClientRect().top - off < 0) cur = id; });
    document.querySelectorAll(".jb-rnav a[data-href]").forEach((el) => el.classList.toggle("is-active", el.dataset.href === cur));
  };
  addEventListener("scroll", mark, { passive: true });
  document.querySelectorAll(".jb-rnav a[data-href]").forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    const t = document.querySelector(el.dataset.href);
    gsap.to(window, { duration: reduce ? 0 : 0.7, ease: "power2.inOut", scrollTo: { y: t.getBoundingClientRect().top + scrollY - 50, autoKill: false } });
  }));

  // Video window — white cover, .35s fade, window width 60% at 16:9, close label 20px from the right of the mouse
  $(".jb-msg__play").on("click", (e) => {
    e.preventDefault();
    if (!isPC()) return;
    const w = 0.6 * innerWidth, h = (9 * w) / 16;
    $.colorbox({
      html: '<div class="jb-lbmovie"><div class="wf-img wf-video" data-label="Recruiting video playback area · 16:9"></div></div>',
      transition: "fade", speed: reduce ? 0 : 350, fadeOut: reduce ? 0 : 350, innerWidth: w + "px", innerHeight: h + "px", opacity: 1,
      onLoad: () => $("body").append('<span class="jb-lbclose" id="jb-lbclose">Close</span>'),
      onComplete: () => $("#jb-lbclose").css({ display: "block" }),
      onCleanup: () => $("#jb-lbclose").remove(),
    });
  });
  $(document).on("mousemove", (e) => $("#jb-lbclose").css({ left: e.pageX + 20 + "px", top: e.pageY + "px" }));
})();
