"use strict";

// The gallery is local: it loads supplied image files and makes no API calls.
const galleryTriggers = Array.from(document.querySelectorAll("[data-review-image]"));
const lightbox = document.getElementById("review-lightbox");
const image = document.getElementById("lightbox-image");
const stage = document.getElementById("lightbox-stage");
const title = document.getElementById("lightbox-title");
const caption = document.getElementById("lightbox-caption");
const count = document.getElementById("lightbox-count");
const previous = document.getElementById("lightbox-previous");
const next = document.getElementById("lightbox-next");
const fit = document.getElementById("lightbox-fit");
const close = document.getElementById("lightbox-close");
let galleryIndex = 0;
let returnFocus = null;
let nativeSize = false;

function setNativeSize(enabled) {
  nativeSize = enabled;
  stage.classList.toggle("is-native", nativeSize);
  fit.setAttribute("aria-pressed", String(nativeSize));
  fit.textContent = nativeSize ? "适合屏幕" : "放大细节";
  stage.scrollTo(0, 0);
}

function showImage(index) {
  galleryIndex = (index + galleryTriggers.length) % galleryTriggers.length;
  const trigger = galleryTriggers[galleryIndex];
  title.textContent = trigger.dataset.reviewTitle;
  caption.textContent = trigger.dataset.reviewCaption;
  count.textContent = `${galleryIndex + 1} / ${galleryTriggers.length}`;
  image.alt = trigger.querySelector("img").alt;
  image.src = trigger.dataset.reviewImage;
  const knownWidth = trigger.querySelector("img").naturalWidth;
  stage.style.setProperty("--image-native-width", `${knownWidth || 1920}px`);
  previous.disabled = galleryTriggers.length < 2;
  next.disabled = galleryTriggers.length < 2;
  setNativeSize(false);
}

if (lightbox && galleryTriggers.length) {
  galleryTriggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      returnFocus = trigger;
      showImage(index);
      lightbox.showModal();
      document.documentElement.classList.add("js-lightbox-open");
      close.focus({ preventScroll: true });
    });
  });
  image.addEventListener("load", () => stage.style.setProperty("--image-native-width", `${image.naturalWidth}px`));
  fit.addEventListener("click", () => setNativeSize(!nativeSize));
  image.addEventListener("click", () => setNativeSize(!nativeSize));
  previous.addEventListener("click", () => showImage(galleryIndex - 1));
  next.addEventListener("click", () => showImage(galleryIndex + 1));
  close.addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && !nativeSize) {
      event.preventDefault();
      showImage(galleryIndex - 1);
    }
    if (event.key === "ArrowRight" && !nativeSize) {
      event.preventDefault();
      showImage(galleryIndex + 1);
    }
  });
  lightbox.addEventListener("close", () => {
    document.documentElement.classList.remove("js-lightbox-open");
    setNativeSize(false);
    returnFocus?.focus({ preventScroll: true });
  });
  let pointerStartedOutside = false;
  lightbox.addEventListener("pointerdown", (event) => {
    const bounds = lightbox.getBoundingClientRect();
    pointerStartedOutside = event.target === lightbox && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
  });
  lightbox.addEventListener("click", (event) => {
    const bounds = lightbox.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (event.target === lightbox && pointerStartedOutside && outside) lightbox.close();
    pointerStartedOutside = false;
  });
}

// Preserve the original self-contained retrieval exercise on the Zhiyu detail.
const sampleAnswers = {
  location: { title: "字幕源文件在“字幕”目录。", detail: "原文明确写明了目录位置，可以据此回答。" },
  font: { title: "资料未说明字幕字体，信息不足。", detail: "这份原文只说明文件存放位置，没有字体要求。需要补充资料后再判断。" }
};
document.querySelectorAll("[data-question]").forEach((question) => {
  question.addEventListener("click", () => {
    const selected = question.dataset.question;
    const answer = sampleAnswers[selected];
    document.querySelectorAll("[data-question]").forEach((button) => button.setAttribute("aria-pressed", String(button === question)));
    document.getElementById("answer-title").textContent = answer.title;
    document.getElementById("answer-detail").textContent = answer.detail;
    document.querySelector(".demo-result").classList.toggle("is-insufficient", selected === "font");
    document.getElementById("source-highlight").classList.toggle("is-muted", selected === "font");
  });
});
document.querySelector(".source-reference")?.addEventListener("click", () => {
  const source = document.getElementById("sample-source");
  source.classList.remove("is-referenced");
  source.focus({ preventScroll: true });
  source.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  requestAnimationFrame(() => source.classList.add("is-referenced"));
});
