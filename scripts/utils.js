export const escapeHTML = (value = "") =>
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

export function formatPostText(value = "") {
  return String(value)
    .split(/(<\/?(?:b|i|s|tagTweet)>)/gi)
    .map((part) => (/^<\/?(?:b|i|s|tagTweet)>$/i.test(part) ? part.toLowerCase() : escapeHTML(part)))
    .join("")
    .replace(/\r?\n/g, "<br>");
}

export const safeURL = (value) => {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};
