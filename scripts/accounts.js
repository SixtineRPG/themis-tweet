import { escapeHTML, safeURL } from "./utils.js";

let accounts = [];

function accountOptionHTML(account, selected) {
  const name = escapeHTML(account.name || "Compte sans nom");
  const handle = escapeHTML(account.handle || "@pseudo");
  const avatar = safeURL(account.avatar);
  const avatarMarkup = avatar ? `<img class="account-select__avatar" src="${escapeHTML(avatar)}" alt="">` : `<span class="account-select__avatar account-select__avatar--placeholder">?</span>`;

  return `
    <button class="account-select__option" type="button" role="option"
      data-account-id="${escapeHTML(account.id)}" aria-selected="${selected}">
      ${avatarMarkup}
      <span class="account-select__identity">
        <strong>
  ${name}
  ${account.verified === true ? '<i class="fa-solid fa-circle-check account-select__verified" aria-label="Compte certifié" title="Compte certifié"></i>' : ""}
</strong>
        <small>${handle}</small>
      </span>
    </button>`;
}

function setAccount(selector, account, onChange) {
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
<strong>
  ${escapeHTML(account.name || "Compte sans nom")}
  ${account.verified === true ? '<i class="fa-solid fa-circle-check account-select__verified" aria-label="Compte certifié" title="Compte certifié"></i>' : ""}
</strong>      <small>${escapeHTML(account.handle || "@pseudo")}</small>
    </span>`;

  selector.querySelectorAll(".account-select__option").forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.accountId === account.id));
  });

  selector.querySelector(".account-select__dropdown").hidden = true;
  selector.querySelector(".account-select__trigger").setAttribute("aria-expanded", "false");
  onChange();
}

function setupAccountSelect(selector, defaultId, onChange) {
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
      ? filtered.map((account) => accountOptionHTML(account, account.name === selectedName && account.handle === selectedHandle)).join("")
      : '<p class="account-select__empty">Aucun compte trouvé.</p>';
  }

  trigger.addEventListener("click", () => {
    const isOpen = !dropdown.hidden;
    document.querySelectorAll(".account-select__dropdown").forEach((menu) => {
      menu.hidden = true;
      menu.closest(".account-select")?.querySelector(".account-select__trigger")?.setAttribute("aria-expanded", "false");
    });

    dropdown.hidden = isOpen;
    trigger.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) {
      renderOptions(search.value);
      search.focus();
    }
  });

  search.addEventListener("input", () => renderOptions(search.value));

  options.addEventListener("click", (event) => {
    const option = event.target.closest("[data-account-id]");
    if (!option) return;
    const account = accounts.find((item) => item.id === option.dataset.accountId);
    setAccount(selector, account, onChange);
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
  if (initial) setAccount(selector, initial, onChange);
  else renderOptions();
}

export async function initAccounts(onChange) {
  const response = await fetch("./accounts.json");
  if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

  const data = await response.json();
  if (!Array.isArray(data.accounts)) {
    throw new Error('Le fichier doit contenir un tableau "accounts".');
  }

  accounts = data.accounts.filter((account) => account.id && account.name && account.handle);
  document.querySelectorAll("[data-account-select]").forEach((selector) => {
    const defaultId = selector.dataset.accountSelect === "author" ? "lise" : "official";
    setupAccountSelect(selector, defaultId, onChange);
  });
}
