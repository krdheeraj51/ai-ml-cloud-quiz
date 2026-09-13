export function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getScoreMessage(ratio) {
  if (ratio === 1) return "Perfect score — excellent work.";
  if (ratio >= 0.67) return "Good job — review the explanation you missed.";
  if (ratio >= 0.34) return "Nice attempt — the explanations will help.";
  return "Keep practicing — review all the explanations.";
}
