export function initClipboard() {
  const generatedCode = document.querySelector("#generated-code");
  const copyButton = document.querySelector("#copy-button");
  const copyStatus = document.querySelector("#copy-status");

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(generatedCode.value);
      copyStatus.textContent = "Code HTML copié !";
    } catch {
      generatedCode.focus();
      generatedCode.select();
      const copied = document.execCommand("copy");
      copyStatus.textContent = copied
        ? "Code HTML copié !"
        : "Sélectionne le code puis copie-le manuellement.";
    }
  });
}
