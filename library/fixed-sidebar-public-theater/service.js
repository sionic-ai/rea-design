// Category filtering is handled by the flip-filter-grid part (same fade scale .6s ease as the original MixItUp). Here only the feature article ”READ MORE” window —
// Same Magnific Popup as the original (horizontal move effect, .75s)
(() => {
  const $ = window.jQuery;
  if (window.gsap && window.CustomEase) gsap.registerPlugin(CustomEase);
  if (!$ || !$.fn.magnificPopup) return;
  $("#jisyu-new-container").magnificPopup({
    delegate: "[data-popup]", removalDelay: 250, showCloseBtn: false, midClick: true, fixedContentPos: true,
    callbacks: { beforeOpen() { this.st.mainClass = this.st.el.attr("data-effect"); } },
  });
  $(document).on("click", "[data-popup-close]", () => $.magnificPopup.close());
})();
