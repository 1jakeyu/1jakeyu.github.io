"use strict";

document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const mainNavigation = document.querySelector(".main-nav");
const header = document.querySelector(".site-header");
const dialogTriggers = new WeakMap();
const backdropStarts = new WeakMap();
const imageDialog = document.getElementById("image-dialog");
const zoomImage = document.getElementById("zoom-image");
const zoomCaption = document.getElementById("zoom-caption");
const zoomToggle = document.getElementById("zoom-toggle");
const imageStage = document.getElementById("image-stage");

function setImageZoom(zoomed) {
  imageStage.classList.toggle("is-zoomed", zoomed);
  zoomToggle.setAttribute("aria-pressed", String(zoomed));
  zoomToggle.textContent = zoomed ? "适合屏幕" : "放大细节";
  imageStage.scrollTo(0, 0);
}

zoomToggle.addEventListener("click", () => {
  setImageZoom(zoomToggle.getAttribute("aria-pressed") !== "true");
});

function closeMenu(restoreFocus = false) {
  if (menuButton.getAttribute("aria-expanded") !== "true") return;
  menuButton.setAttribute("aria-expanded", "false");
  mainNavigation.classList.remove("is-open");
  if (restoreFocus) menuButton.focus({ preventScroll: true });
}

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  mainNavigation.classList.toggle("is-open", open);
});

mainNavigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("pointerdown", (event) => {
  if (!header.contains(event.target)) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu(true);
});

window.matchMedia("(min-width: 681px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

function syncScrollLock() {
  document.documentElement.classList.toggle("has-open-dialog", Boolean(document.querySelector("dialog[open]")));
}

function openDialog(dialog, trigger) {
  if (!dialog || dialog.open) return;
  closeMenu();
  dialogTriggers.set(dialog, trigger);
  dialog.showModal();
  dialog.scrollTop = 0;
  syncScrollLock();
}

document.querySelectorAll("[data-case]").forEach((trigger) => {
  trigger.addEventListener("click", () => openDialog(document.getElementById(trigger.dataset.case), trigger));
});

document.querySelectorAll("[data-zoom]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    zoomImage.src = trigger.dataset.zoom;
    zoomImage.alt = trigger.querySelector("img")?.alt || trigger.dataset.caption || "作品界面原图";
    zoomCaption.textContent = trigger.dataset.caption || zoomImage.alt;
    setImageZoom(false);
    openDialog(imageDialog, trigger);
  });
});

function isOutsideDialog(dialog, event) {
  const bounds = dialog.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
}

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());

  dialog.addEventListener("pointerdown", (event) => {
    backdropStarts.set(dialog, event.target === dialog && isOutsideDialog(dialog, event));
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && backdropStarts.get(dialog) && isOutsideDialog(dialog, event)) dialog.close();
    backdropStarts.set(dialog, false);
  });

  dialog.addEventListener("close", () => {
    syncScrollLock();
    const trigger = dialogTriggers.get(dialog);
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  });
});

const sampleAnswers = {
  location: {
    title: "字幕源文件在“字幕”目录。",
    detail: "原文明确写明了目录位置，可以据此回答。"
  },
  font: {
    title: "资料未说明字幕字体，信息不足。",
    detail: "这份原文只说明文件存放位置，没有字体要求。需要补充资料后再判断。"
  }
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

document.querySelector(".source-reference").addEventListener("click", () => {
  const source = document.getElementById("sample-source");
  source.classList.remove("is-referenced");
  source.focus({ preventScroll: true });
  source.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  requestAnimationFrame(() => source.classList.add("is-referenced"));
});
