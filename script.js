"use strict";

const script = document.currentScript;
const stylesheet = document.getElementById("external-css");
const image = document.getElementById("test-image");
const checks = { html: true, css: false, js: false, svg: false };
const events = { cssLoad: false, jsLoad: false, imageLoad: false };
window.__probeResult = { checks, events, protocol: location.protocol.replace(":", "") };
document.getElementById("protocol").textContent = window.__probeResult.protocol;

function status(id, passed, text) {
  const element = document.getElementById(id);
  element.dataset.status = passed ? "passed" : "failed";
  element.textContent = text;
}

function summarize() {
  const passed = Object.values(checks).every(Boolean);
  document.getElementById("summary").textContent = passed
    ? "本页四项资源检查通过。"
    : "资源尚未全部确认，请查看上方各项状态。";
}

function checkCSS() {
  events.cssLoad = stylesheet.dataset.loadState === "loaded";
  checks.css = events.cssLoad && getComputedStyle(document.documentElement).getPropertyValue("--probe-css").trim() === "loaded";
  status("css-status", checks.css, checks.css ? "已载入并生效" : "未确认载入");
  summarize();
}

function checkImage() {
  events.imageLoad = image.dataset.loadState === "loaded";
  checks.svg = events.imageLoad && image.complete && image.naturalWidth > 0;
  status("image-status", checks.svg, checks.svg ? "已载入" : "未确认载入");
  summarize();
}

stylesheet.addEventListener("load", checkCSS);
stylesheet.addEventListener("error", checkCSS);
image.addEventListener("load", checkImage);
image.addEventListener("error", checkImage);
script.addEventListener("load", () => {
  events.jsLoad = true;
  checks.js = true;
  status("js-status", true, "已载入并执行");
  summarize();
});

document.getElementById("js-status").textContent = "已执行，等待载入确认";
if (stylesheet.dataset.loadState) checkCSS();
if (image.dataset.loadState) checkImage();
