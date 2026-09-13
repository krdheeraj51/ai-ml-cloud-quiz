import { formatWeekRange } from "../utils/date-utils.js";
import { setDisabled, setText } from "../utils/dom-utils.js";

export function createWeekSelector(elements) {
  function render({ current, previous, next, hasPrevious, hasNext }) {
    setText(elements.range, current ? formatWeekRange(current.start, new Date(current.start.getTime() + 6 * 86400000)) : "—");
    setText(
      elements.availability,
      current ? `${current.dates.length} quiz date${current.dates.length === 1 ? "" : "s"} available` : "No week selected"
    );

    setDisabled(elements.previous, !hasPrevious);
    setDisabled(elements.next, !hasNext);

    elements.previous.setAttribute("aria-label", previous ? `Previous Week: ${formatWeekRange(previous.start, new Date(previous.start.getTime() + 6 * 86400000))}` : "Previous Week unavailable");
    elements.next.setAttribute("aria-label", next ? `Next Week: ${formatWeekRange(next.start, new Date(next.start.getTime() + 6 * 86400000))}` : "Next Week unavailable");
  }

  return { render };
}
