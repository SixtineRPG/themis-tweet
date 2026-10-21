export function initTextEditor() {
  const EDITOR_TAGS = {
    bold: ["<b>", "</b>"],
    italic: ["<i>", "</i>"],
    strike: ["<s>", "</s>"],
    tagTweet: ["<tagTweet>", "</tagTweet>"],
  };

  // Catégories et émojis : modifiables librement ici
  const EMOJI_CATEGORIES = {
    Visages: ["😀", "😂", "🥹", "😍", "🥰", "😘", "😭", "😡", "🙄", "😏", "🤡", "💀", "😎", "🤔", "🥺", "😱", "😴", "🤯"],
    Cœurs: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💖", "💗", "💘", "💔", "💕", "💞", "💓", "💝", "❣️", "💌"],
    Réactions: ["👍", "👎", "👏", "🙌", "🤝", "🙏", "💅", "👀", "🫶", "🤌", "🫡", "🫠", "✍️", "🤞", "🤟", "🫰", "👋", "💪"],
    Émotions: ["🔥", "✨", "💥", "💯", "💢", "💤", "⚡", "🌈", "⭐", "🌟", "❗", "❓", "💫", "☠️", "💣", "🎯", "🌀", "🫧"],
    Fête: ["🎉", "🎊", "🥳", "🎂", "🎁", "🎈", "🍾", "🥂", "🎶", "🎤", "💃", "🕺", "🎵", "🎧", "🎸", "🏆", "🥇", "🎮"],
    Animaux: ["🐶", "🐱", "🦊", "🐸", "🐼", "🐻", "🐰", "🐹", "🐭", "🐷", "🐮", "🐵", "🐺", "🦁", "🐯", "🐉", "🐍", "🦋"],
    Nature: ["🌸", "🌹", "🌻", "🌷", "🌼", "🍀", "🌿", "🌱", "🌳", "🍁", "🍄", "🌙", "☀️", "🌧️", "❄️", "🌊", "🔥", "🌍"],
    Nourriture: ["🍕", "🍔", "🍟", "🌭", "🍿", "🍩", "🍪", "🍰", "🧁", "🍫", "🍓", "🍒", "🍑", "🍉", "🍇", "🍎", "☕", "🥤"],
    Pokémon: ["⚡", "🔥", "💧", "🌿", "🌙", "☀️", "🐾", "🐉", "🦊", "🐸", "🐱", "🥚", "✨", "💎", "🔮", "⭐", "💥", "❤️"],
  };

  // Gérer le hover via JavaScript
  function handleHover(element) {
    element.addEventListener("mouseenter", () => {
      element.classList.add("is-hovered");
    });

    element.addEventListener("mouseleave", () => {
      element.classList.remove("is-hovered");
    });
  }

  function autoResize(textarea) {
    if (!textarea.isConnected || textarea.getClientRects().length === 0) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function createEditor(container) {
    const name = container.dataset.editorText;
    const rows = Number(container.dataset.rows) || 4;
    const initialText = container.textContent.trim();

    const editor = document.createElement("div");
    editor.className = "editor";

    const toolbar = document.createElement("div");
    toolbar.className = "editor__toolbar";

    const textarea = document.createElement("textarea");
    textarea.className = "editor__input";
    textarea.name = name;
    textarea.rows = rows;
    textarea.value = initialText;

    textarea.addEventListener("input", () => autoResize(textarea));

    // Boutons de mise en forme
    Object.entries(EDITOR_TAGS).forEach(([tag, tags]) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = `editor__button editor__button--${tag}`;
      button.title = {
        bold: "Gras",
        italic: "Italique",
        strike: "Barré",
        tagTweet: "Identifier un post",
      }[tag];

      button.setAttribute("aria-label", button.title);

      if (tag === "tagTweet") {
        button.innerHTML = '<i class="fa-solid fa-at" aria-hidden="true"></i>';
      } else {
        button.textContent = {
          bold: "B",
          italic: "I",
          strike: "S",
        }[tag];
      }

      handleHover(button);

      // Empêcher le bouton de déplacer la sélection du texte
      button.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });

      // Appliquer le format uniquement lors d'un clic sur le bouton
      button.addEventListener("click", (event) => {
        event.stopPropagation();

        if (event.currentTarget !== button) return;

        const [open, close] = tags;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.slice(start, end);

        textarea.setRangeText(`${open}${selected}${close}`, start, end, "select");

        textarea.focus();
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      });

      toolbar.append(button);
    });

    // Bouton d'ouverture des émojis
    const emojiButton = document.createElement("button");

    emojiButton.type = "button";
    emojiButton.className = "editor__button editor__emoji-toggle";
    emojiButton.textContent = "😀";
    emojiButton.title = "Insérer un émoji";
    emojiButton.setAttribute("aria-label", "Ouvrir les émojis");
    emojiButton.setAttribute("aria-expanded", "false");

    handleHover(emojiButton);

    // Infobulle des émojis
    const popover = document.createElement("div");
    popover.className = "editor__emoji-popover";
    popover.hidden = true;

    const emojiList = document.createElement("div");
    emojiList.className = "editor__emoji-list";

    // Afficher toutes les catégories à la suite
    Object.entries(EMOJI_CATEGORIES).forEach(([category, emojis]) => {
      const section = document.createElement("section");
      section.className = "editor__emoji-section";

      const title = document.createElement("div");
      title.className = "editor__emoji-title";
      title.textContent = category;

      const grid = document.createElement("div");
      grid.className = "editor__emoji-grid";

      emojis.forEach((emoji) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "editor__emoji";
        button.textContent = emoji;
        button.title = `Insérer ${emoji}`;
        button.setAttribute("aria-label", `Insérer ${emoji}`);

        button.addEventListener("mousedown", (event) => {
          event.preventDefault();
        });

        button.addEventListener("click", (event) => {
          event.stopPropagation();

          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;

          textarea.setRangeText(emoji, start, end, "end");

          textarea.focus();
          textarea.dispatchEvent(new Event("input", { bubbles: true }));

          popover.hidden = true;
          emojiButton.setAttribute("aria-expanded", "false");
        });

        grid.append(button);
      });

      section.append(title, grid);
      emojiList.append(section);
    });

    popover.append(emojiList);
    emojiButton.append(popover);

    // Ouvrir ou fermer l'infobulle
    emojiButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const isOpening = popover.hidden;

      popover.hidden = !isOpening;
      emojiButton.setAttribute("aria-expanded", String(isOpening));
    });

    // Empêcher les clics dans la barre d'outils de déclencher d'autres actions
    toolbar.addEventListener("click", (event) => {
      if (event.target === toolbar) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    // Fermer l'infobulle en cliquant hors de l'éditeur
    document.addEventListener("click", (event) => {
      if (!editor.contains(event.target)) {
        popover.hidden = true;
        emojiButton.setAttribute("aria-expanded", "false");
      }
    });

    // Assemblage final
    toolbar.append(emojiButton);
    editor.append(toolbar, textarea);

    container.replaceChildren(editor);
    autoResize(textarea);
  }

  // Initialiser tous les éditeurs
  document.querySelectorAll("[data-editor-text]").forEach(createEditor);
}
