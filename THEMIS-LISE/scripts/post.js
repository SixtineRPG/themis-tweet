import { escapeHTML, formatPostText, safeURL } from "./utils.js";

const form = document.querySelector("#post-form");
const formatButtons = [...document.querySelectorAll("[data-format]")];
const retweetFields = document.querySelector("#retweet-fields");
const preview = document.querySelector("#preview");
const generatedCode = document.querySelector("#generated-code");
const copyStatus = document.querySelector("#copy-status");

let format = "tweet";

function get(name) {
  const field = form.elements.namedItem(name);
  return field ? field.value.trim() : "";
}

const imageHTML = (url, alt = "") => {
  const safe = safeURL(url);
  return safe ? `<img class="x-post__image" src="${escapeHTML(safe)}" alt="${escapeHTML(alt)}">` : "";
};

const avatarHTML = (url, name) => {
  const safe = safeURL(url);
  return safe
    ? `<img class="x-post__avatar" src="${escapeHTML(safe)}" alt="">`
    : `<div class="x-post__avatar x-post__avatar--placeholder" aria-hidden="true">${escapeHTML((name || "?").charAt(0).toUpperCase())}</div>`;
};

const icons = {
  reply: "fa-regular fa-comment",
  repost: "fa-solid fa-retweet",
  like: "fa-regular fa-heart",
  views: "fa-regular fa-eye",
};

const icon = (name) => icons[name] ? `<i class="${icons[name]}" aria-hidden="true"></i>` : "";

function identityHTML(name, handle, date = "", verified = false) {
  const verifiedIcon = verified
    ? `<i class="fa-solid fa-circle-check x-post__verified" aria-label="Compte certifié" role="img"></i>`
    : "";
  return `
    <div class="x-post__identity">
      <span class="x-post__name">${escapeHTML(name || "Nom du compte")}</span>
      ${verifiedIcon}
      <span class="x-post__handle">${escapeHTML(handle || "@pseudo")}</span>
      ${date ? `<span class="x-post__date">· ${escapeHTML(date)}</span>` : ""}
    </div>`;
}

function statHTML(type, value, label) {
  return `
    <span class="x-post__stat">
      ${icon(type)}
      <span>${escapeHTML(value || "0")}</span>
      <span class="sr-only">${label}</span>
    </span>`;
}

function originalPostHTML(data) {
  return `
    <div class="x-post__quoted">
      <div class="x-post__main">
        ${avatarHTML(data.originalAvatar, data.originalName)}
        <div class="x-post__body">
          ${identityHTML(data.originalName, data.originalHandle, "", data.originalVerified)}
          <p class="x-post__text">${formatPostText(data.originalText)}</p>
          ${imageHTML(data.originalImage, "Image du post original")}
        </div>
      </div>
    </div>`;
}

function getData() {
  return {
    format,
    authorName: get("authorName"),
    authorHandle: get("authorHandle"),
    authorAvatar: get("authorAvatar"),
    date: get("date"),
    text: get("text"),
    image: get("image"),
    originalName: get("originalName"),
    originalText: get("originalText"),
    originalHandle: get("originalHandle"),
    originalAvatar: get("originalAvatar"),
    originalImage: get("originalImage"),
    replies: get("replies"),
    reposts: get("reposts"),
    likes: get("likes"),
    views: get("views"),
    authorVerified: document.querySelector('[data-account-select="author"]')?.dataset.verified === "true",
    originalVerified: document.querySelector('[data-account-select="original"]')?.dataset.verified === "true",
  };
}

function buildPostHTML(data) {
  const repostLabel = data.format === "retweet"
    ? `<div class="x-post__reposted">${icon("repost")}<span>${escapeHTML(data.authorName || "Ce compte")} a reposté</span></div>`
    : "";

  return `<article class="x-post" data-format="${data.format}">
    ${repostLabel}
    <div class="x-post__main">
      ${avatarHTML(data.authorAvatar, data.authorName)}
      <div class="x-post__body">
        ${identityHTML(data.authorName, data.authorHandle, data.date, data.authorVerified)}
        <p class="x-post__text">${formatPostText(data.text)}</p>
        ${imageHTML(data.image, "Image du post")}
        ${data.format === "retweet" ? originalPostHTML(data) : ""}
        <div class="x-post__stats">
          ${statHTML("reply", data.replies, "")}
          ${statHTML("repost", data.reposts, "")}
          ${statHTML("like", data.likes, "")}
          ${statHTML("views", data.views, "")}
        </div>
      </div>
    </div>
  </article>`;
}

function compactHTML(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";

  root.querySelectorAll(".sr-only").forEach((el) => el.remove());
  root.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("aria-") || attr.name === "role") el.removeAttribute(attr.name);
    });
    if (el.getAttribute("alt") === "") el.removeAttribute("alt");
  });

  return root.outerHTML.replace(/>\s+</g, "><").trim();
}

export function updatePost() {
  const html = buildPostHTML(getData());
  preview.innerHTML = html;
  generatedCode.value = compactHTML(html) + '<link rel="stylesheet" href="URL_DE_TON_TEMPLATE_CSS">';
  copyStatus.textContent = "Le code se met à jour automatiquement.";
}

function setFormat(nextFormat) {
  format = nextFormat;
  retweetFields.hidden = format !== "retweet";

  formatButtons.forEach((button) => {
    const active = button.dataset.format === format;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  updatePost();
}

export function initPost() {
  formatButtons.forEach((button) => {
    button.addEventListener("click", () => setFormat(button.dataset.format));
  });
  form.addEventListener("input", updatePost);
  updatePost();
}
