/* Preloader

window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");

    setTimeout(() => {
        preloader.classList.add("open");

        preloader.addEventListener("animationend", () => {
            preloader.remove();
        });
    }, 700);
});

*/

/* hover prefetch */

function enableHoverPrefetch() {
  if (!("requestIdleCallback" in window)) return;

  document.querySelectorAll("blog-header nav a").forEach(link => {
    link.addEventListener("mouseenter", () => {

      const preload = document.createElement("link");
      preload.rel = "prefetch";
      preload.href = link.href;
      preload.as = "document";

      document.head.appendChild(preload);

    }, { once: true });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  requestIdleCallback(enableHoverPrefetch);
});

/* keyboard movement */

document.addEventListener("keydown", (e) => {
  // 입력창에서는 작동하지 않도록
  const tag = document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement.isContentEditable) {
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth"
    });
  }
});
