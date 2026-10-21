const form = document.querySelector("#post-form");
const formatButtons = [...document.querySelectorAll("[data-format]")];
const retweetFields = document.querySelector("#retweet-fields");
const preview = document.querySelector("#preview");
const generatedCode = document.querySelector("#generated-code");
const copyButton = document.querySelector("#copy-button");
const copyStatus = document.querySelector("#copy-status");

let format = "tweet";
let accounts = [];

function get(name) {
  const field = form.elements.namedItem(name);
  return field ? field.value.trim() : "";
}

const escapeHTML = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

function formatPostText(value = "") {
  return String(value)
    .split(/(<\/?(?:b|i|s)>)/gi)
    .map((part) => {
      if (/^<\/?(?:b|i|s)>$/i.test(part)) {
        return part.toLowerCase();
      }

      return escapeHTML(part);
    })
    .join("")
    .replace(/\r?\n/g, "<br>");
}

const safeURL = (value) => {
  if (!value) return "";

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};

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
  verified: "fa-solid fa-circle-check",
};

const icon = (name) => {
  const iconClass = icons[name];

  if (!iconClass) return "";

  return `<i class="${iconClass}" aria-hidden="true"></i>`;
};

function identityHTML(name, handle, date = "", verified = false) {
  const verifiedIcon = verified
    ? `<i class="fa-solid fa-circle-check x-post__verified"
       aria-label="Compte certifié"
       role="img"></i>`
    : "";

  return `
    <div class="x-post__identity">
      <span class="x-post__name">${escapeHTML(name || "Nom du compte")}</span>
      ${verifiedIcon}
      <span class="x-post__handle">${escapeHTML(handle || "@pseudo")}</span>
      ${date ? `<span class="x-post__date">· ${escapeHTML(date)}</span>` : ""}
    </div>
  `;
}

function statHTML(type, value, label) {
  return `
    <span class="x-post__stat">
      ${icon(type)}
      <span>${escapeHTML(value || "0")}</span>
      <span class="sr-only">${label}</span>
    </span>
  `;
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
    </div>
  `;
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
  const repostLabel = data.format === "retweet" ? `<div class="x-post__reposted">${icon("repost")}<span>${escapeHTML(data.authorName || "Ce compte")} a reposté</span></div>` : "";

  return `<article class="x-post" data-format="${data.format}">
  ${repostLabel}
  <div class="x-post__main">
    ${avatarHTML(data.authorAvatar, data.authorName)}
    <div class="x-post__body">
${identityHTML(data.authorName, data.authorHandle, data.date, data.authorVerified)}      <p class="x-post__text">${formatPostText(data.text)}</p>
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

  root.querySelectorAll(".sr-only").forEach((el) => el.remove());

  root.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("aria-") || attr.name === "role") {
        el.removeAttribute(attr.name);
      }
    });

    if (el.getAttribute("alt") === "") {
      el.removeAttribute("alt");
    }
  });

  return root.outerHTML.replace(/>\s+</g, "><").trim();
}

function update() {
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

  update();
}

/* Menus déroulants des comptes */

function accountOptionHTML(account, selected) {
  const name = escapeHTML(account.name || "Compte sans nom");
  const handle = escapeHTML(account.handle || "@pseudo");
  const avatar = safeURL(account.avatar);
  const avatarHTML = avatar ? `<img class="account-select__avatar" src="${escapeHTML(avatar)}" alt="">` : `<span class="account-select__avatar account-select__avatar--placeholder">?</span>`;

  return `
    <button
      class="account-select__option"
      type="button"
      role="option"
      data-account-id="${escapeHTML(account.id)}"
      aria-selected="${selected}"
    >
      ${avatarHTML}
      <span class="account-select__identity">
        <strong>${name}</strong>
        <small>${handle}</small>
      </span>
    </button>
  `;
}

function setAccount(selector, account) {
  if (!account) return;

  const nameInput = selector.querySelector('input[type="hidden"][name$="Name"]');
  const handleInput = selector.querySelector('input[type="hidden"][name$="Handle"]');
  const avatarInput = selector.querySelector('input[type="hidden"][name$="Avatar"]');

  selector.dataset.verified = String(account.verified === true);

  nameInput.value = account.name || "";
  handleInput.value = account.handle || "";
  avatarInput.value = safeURL(account.avatar);

  const current = selector.querySelector(".account-select__current");

  const safeAvatar = safeURL(account.avatar);

  current.innerHTML = `
    ${safeAvatar ? `<img class="account-select__avatar" src="${escapeHTML(safeAvatar)}" alt="">` : `<span class="account-select__avatar account-select__avatar--placeholder">?</span>`}
    <span class="account-select__identity">
      <strong>${escapeHTML(account.name || "Compte sans nom")}</strong>
      <small>${escapeHTML(account.handle || "@pseudo")}</small>
    </span>
  `;

  selector.querySelectorAll(".account-select__option").forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.accountId === account.id));
  });

  selector.querySelector(".account-select__dropdown").hidden = true;
  selector.querySelector(".account-select__trigger").setAttribute("aria-expanded", "false");

  update();
}

function setupAccountSelect(selector, defaultId) {
  const trigger = selector.querySelector(".account-select__trigger");
  const dropdown = selector.querySelector(".account-select__dropdown");
  const search = selector.querySelector(".account-select__search");
  const options = selector.querySelector(".account-select__options");

  function renderOptions(query = "") {
    const normalized = query.trim().toLocaleLowerCase("fr");

    const filtered = accounts.filter((account) =>
      [account.name, account.handle, account.id].some((value) =>
        String(value || "")
          .toLocaleLowerCase("fr")
          .includes(normalized),
      ),
    );

    const selectedName = selector.querySelector('input[type="hidden"][name$="Name"]').value;
    const selectedHandle = selector.querySelector('input[type="hidden"][name$="Handle"]').value;

    options.innerHTML = filtered.length
      ? filtered
          .map((account) => {
            const selected = account.name === selectedName && account.handle === selectedHandle;

            return accountOptionHTML(account, selected);
          })
          .join("")
      : '<p class="account-select__empty">Aucun compte trouvé.</p>';
  }

  trigger.addEventListener("click", () => {
    const isOpen = !dropdown.hidden;

    document.querySelectorAll(".account-select__dropdown").forEach((menu) => {
      menu.hidden = true;
      menu.closest(".account-select").querySelector(".account-select__trigger").setAttribute("aria-expanded", "false");
    });

    dropdown.hidden = isOpen;
    trigger.setAttribute("aria-expanded", String(!isOpen));

    if (!isOpen) {
      renderOptions(search.value);
      search.focus();
    }
  });

  search.addEventListener("input", () => {
    renderOptions(search.value);
  });

  options.addEventListener("click", (event) => {
    const option = event.target.closest("[data-account-id]");
    if (!option) return;

    const account = accounts.find((item) => item.id === option.dataset.accountId);

    setAccount(selector, account);
    search.value = "";
    renderOptions();
  });

  document.addEventListener("click", (event) => {
    if (!selector.contains(event.target)) {
      dropdown.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
  });

  const initial = accounts.find((account) => account.id === defaultId);

  if (initial) {
    setAccount(selector, initial);
  } else {
    renderOptions();
  }
}

async function loadAccounts() {
  const response = await fetch("./accounts.json");

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.accounts)) {
    throw new Error('Le fichier doit contenir un tableau "accounts".');
  }

  accounts = data.accounts.filter((account) => account.id && account.name && account.handle);

  document.querySelectorAll("[data-account-select]").forEach((selector) => {
    const defaultId = selector.dataset.accountSelect === "author" ? "lise" : "official";

    setupAccountSelect(selector, defaultId);
  });
}

/* Formats et génération */

formatButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setFormat(button.dataset.format);
  });
});

form.addEventListener("input", update);

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
    copyStatus.textContent = "Code HTML copié !";
  } catch {
    generatedCode.focus();
    generatedCode.select();

    const copied = document.execCommand("copy");

    copyStatus.textContent = copied ? "Code HTML copié !" : "Sélectionne le code puis copie-le manuellement.";
  }
});

async function init() {
  update();

  try {
    await loadAccounts();
  } catch (error) {
    console.error("Impossible de charger accounts.json :", error);
    copyStatus.textContent = "Impossible de charger accounts.json. Vérifie le serveur local et le fichier JSON.";
  }

  update();
}

init();

const themeToggle = document.querySelector("#theme-toggle");

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("night-mode");

  themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun" aria-hidden="true"></i> Mode clair' : '<i class="fa-solid fa-moon" aria-hidden="true"></i> Mode sombre';
});
