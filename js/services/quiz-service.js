import { APP_CONFIG } from "../config/config.js";

export async function loadQuiz(date) {
  const [year, month, day] = date.split("-");
  const url = `${APP_CONFIG.dataRoot}/${year}/${month}/${day}.json?t=${Date.now()}`;
  const response = await fetch(url);

  if (!response.ok) return null;
  return response.json();
}
