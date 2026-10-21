import { initPost, updatePost } from "./scripts/post.js";
import { initAccounts } from "./scripts/accounts.js";
import { initClipboard } from "./scripts/clipboard.js";
import { initTheme } from "./scripts/theme.js";
import { initTextEditor } from "./scripts/textEditor.js";

async function init() {
  initPost();
  initClipboard();
  initTheme();
  initTextEditor();

  try {
    await initAccounts(updatePost);
  } catch (error) {
    console.error("Impossible de charger accounts.json :", error);
    const copyStatus = document.querySelector("#copy-status");
    if (copyStatus) {
      copyStatus.textContent = "Impossible de charger accounts.json. Vérifie le serveur local et le fichier JSON.";
    }
  }

  updatePost();
}

init();
