// First page: draw two News cards below the phone hero, and when those cards rise, fade out the center wordmark over 1s (original logo_hide).
(() => {
  const list = document.querySelector(".z-mv__postList");
  const POSTS = [
    ["Your news title in one line goes here", "0000/00/00"],
    ["Your slightly longer news title here", "0000/00/00"],
  ];
  if (list) list.innerHTML = POSTS.map(Z.postCard).join("");

  const logo = document.querySelector(".z-mv__logo");
  const post = document.querySelector(".z-mv__post");
  if (logo && post) {
    // Original: hides when the card position + 200px touches the bottom of the screen
    Z.onPast(post, "top+=200 bottom", (v) => logo.classList.toggle("is-hide", v));
  }
})();
