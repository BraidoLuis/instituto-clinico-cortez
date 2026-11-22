const menu = document.querySelector(".menu-toggle");
const nav = document.getElementById("navegacao");

function setMenu(open) {
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  nav.classList.toggle("is-open", open);
}

menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menu.focus();
  }
});
document.querySelector('a[href="#horarios"]').addEventListener("click", () => {
  document.getElementById("horarios").open = true;
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: no-preference)");
const progress = document.querySelector(".reading-progress");
const parallax = Array.from(document.querySelectorAll(".about-image img, .service-card figure img"));
const revealGroups = document.querySelectorAll(
  ".section-head, .tech-grid, .contact-strip .strip-inner, .faq, .footer-links"
);
const revealItems = Array.from(document.querySelectorAll(
  ".card-copy, .about-copy, .about-image, .faq-section h2, .location > div, .location iframe, .footer-main .brand"
));

for (const group of revealGroups) {
  Array.from(group.children).forEach((item, index) => {
    item.style.setProperty("--motion-delay", `${index * 35}ms`);
    revealItems.push(item);
  });
}

const signal = document.querySelector(".signal-art");
let revealObserver;
let frame = 0;

function renderScrollMotion() {
  frame = 0;
  const viewport = window.innerHeight;
  const distance = document.documentElement.scrollHeight - viewport;
  const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
  const offsets = parallax.map((image) => {
    const box = image.parentElement.getBoundingClientRect();
    if (box.bottom < 0 || box.top > viewport) return null;
    const travel = Math.min(9, box.height * .03);
    return Math.max(-1, Math.min(1, (viewport - box.top - box.bottom) / (viewport + box.height))) * travel;
  });
  progress.style.transform = `scaleX(${fraction})`;
  parallax.forEach((image, index) => {
    if (offsets[index] !== null) {
      image.style.transform = `translateY(${offsets[index]}px) scale(1.07)`;
    }
  });
}

function queueScrollMotion() {
  if (!frame) frame = window.requestAnimationFrame(renderScrollMotion);
}

function applyMotionPreference() {
  revealObserver?.disconnect();
  window.removeEventListener("scroll", queueScrollMotion);
  window.removeEventListener("resize", queueScrollMotion);
  if (frame) window.cancelAnimationFrame(frame);
  frame = 0;

  if (!motionPreference.matches) {
    progress.style.removeProperty("transform");
    for (const image of parallax) image.style.removeProperty("transform");
    return;
  }

  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(entry.target === signal ? "motion-active" : "motion-enter");
        observer.unobserve(entry.target);
      }
    }, { threshold: .12 });
    for (const element of [...revealItems, signal]) {
      if (!element.matches(".motion-enter, .motion-active")) revealObserver.observe(element);
    }
  }

  window.addEventListener("scroll", queueScrollMotion, { passive: true });
  window.addEventListener("resize", queueScrollMotion);
  queueScrollMotion();
}

motionPreference.addEventListener("change", applyMotionPreference);
applyMotionPreference();

