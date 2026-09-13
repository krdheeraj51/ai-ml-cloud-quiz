import { APP_CONFIG } from "../config/config.js";
import { getWeekKey, getWeekStart, parseISODate, compareISODate } from "../utils/date-utils.js";

export async function loadManifest() {
  try {
    const response = await fetch(`${APP_CONFIG.manifestPath}?t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`Manifest request failed with status ${response.status}`);
    }

    const manifest = await response.json();
    return normalizeManifest(manifest);
  } catch (error) {
    const fallbackManifest = readInlineFallbackManifest();

    if (fallbackManifest) {
      console.warn("Using inline manifest fallback because manifest.json could not be fetched.", error);
      return normalizeManifest(fallbackManifest);
    }

    throw error;
  }
}

function normalizeManifest(manifest) {
  if (!manifest || !Array.isArray(manifest.dates)) {
    throw new Error("Manifest does not contain a dates array");
  }

  const dates = [...new Set(manifest.dates)]
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort(compareISODate);

  return {
    dates,
    weeks: buildWeeks(dates)
  };
}

function readInlineFallbackManifest() {
  const element = document.getElementById("manifest-fallback");
  if (!element?.textContent?.trim()) return null;

  try {
    return JSON.parse(element.textContent);
  } catch (error) {
    console.error("Inline manifest fallback is invalid JSON.", error);
    return null;
  }
}

function buildWeeks(dates) {
  const weekMap = new Map();

  dates.forEach((dateValue) => {
    const date = parseISODate(dateValue);
    const weekStart = getWeekStart(date, APP_CONFIG.week.weekStartsOn);
    const weekKey = getWeekKey(date, APP_CONFIG.week.weekStartsOn);

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        key: weekKey,
        start: weekStart,
        dates: []
      });
    }

    weekMap.get(weekKey).dates.push(dateValue);
  });

  return [...weekMap.values()].sort((a, b) => a.start - b.start);
}

export function findWeekForDate(weeks, dateValue) {
  const weekKey = getWeekKey(parseISODate(dateValue), APP_CONFIG.week.weekStartsOn);
  return weeks.find((week) => week.key === weekKey) ?? null;
}
