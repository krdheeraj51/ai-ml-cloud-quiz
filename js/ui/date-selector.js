import { formatDate } from "../utils/date-utils.js";
import { setDisabled } from "../utils/dom-utils.js";

export function createDateSelector(element) {
  function render(dates, selectedDate = null) {
    element.innerHTML = "";

    if (!dates.length) {
      const option = new Option("No quiz dates available", "");
      element.add(option);
      setDisabled(element, true);
      return;
    }

    dates.forEach((date) => {
      element.add(new Option(formatDate(date), date));
    });

    element.value = selectedDate && dates.includes(selectedDate) ? selectedDate : dates[dates.length - 1];
    setDisabled(element, false);
  }

  return { render };
}
