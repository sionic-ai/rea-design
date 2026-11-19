// Recruit detail: SNS and guide buttons below the application flow, SCROLL hint on the horizontal table (ScrollHint — disappears after one push)
(() => {
  const { sns } = window.euParts;
  document.querySelector(".entry__sns").innerHTML = sns("line", "SNS link 2");
  document.querySelector(".entry__pdf").innerHTML = sns("pdf", "Download the guide · 0000 recruitment", "is-wide");

  // Horizontal table hint — as in the original, ScrollHint (scroll-hint 1.2.9) SCROLL
  new ScrollHint(".curri__scroll", { i18n: { scrollable: "SCROLL" } });
})();
