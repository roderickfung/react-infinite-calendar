import getScrollbarSize from 'dom-helpers/scrollbarSize';
import {
  endOfDay,
  format,
  getDay,
  getDaysInMonth,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from 'date-fns';
import { withPropsOnChange } from 'recompose';

export const keyCodes = {
  command: 91,
  control: 17,
  down: 40,
  enter: 13,
  escape: 27,
  left: 37,
  right: 39,
  shift: 16,
  up: 38,
};

/**
 * Given a year and a month, returns the rows for that month to be iterated over
 * @param {Number} year - the year number
 * @param {Number} month - the index of the month
 * @param {Number} weekStartsOn - the index of the first day of the week (from 0 to 6)
 * @return {Object} - Returns the first day of the month and the rows of that month
 */
export function getMonth(year, month, weekStartsOn) {
  const rows = [];
  const monthDate = new Date(year, month, 1);
  const daysInMonth = getDaysInMonth(monthDate);
  const weekEndsOn = getEndOfWeekIndex(weekStartsOn);

  let dow = getDay(new Date(year, month, 1));
  let week = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    if (!rows[week]) {
      rows[week] = [];
    }

    rows[week].push(day);

    if (dow === weekEndsOn) {
      week++;
    }

    dow = dow < 6 ? dow + 1 : 0;
  }

  return {
    date: monthDate,
    rows,
  };
}

export function getWeek(yearStart, date, weekStartsOn) {
  const yearStartDate =
    typeof yearStart === 'number'
      ? new Date(yearStart, 0, 1) // 1st Jan of the Year
      : yearStart;

  return Math.ceil(
    (Math.round((date - yearStartDate) / (60 * 60 * 24 * 1000)) +
      yearStartDate.getDay() +
      1 -
      weekStartsOn) /
      7
  );
}

/**
 * Get the number of weeks in a given month to be able to calculate the height of that month
 * @param {Number} year - the year number
 * @param {Number} month - the index of the month
 * @param {Number} weekStartsOn - the index of the first day of the week (from 0 to 6)
 * @param isLastDisplayedMonth
 * @return {Number} - Returns the number of weeks for the given month
 */
export function getWeeksInMonth(
  month,
  year = new Date().getFullYear(),
  weekStartsOn,
  isLastDisplayedMonth
) {
  const weekEndsOn = getEndOfWeekIndex(weekStartsOn);

  const firstOfMonth = new Date(year, month, 1);
  const firstWeekNumber = getWeek(year, firstOfMonth, weekStartsOn);

  const lastOfMonth = new Date(year, month + 1, 0); // Last date of the Month
  const lastWeekNumber = getWeek(year, lastOfMonth, weekStartsOn);

  let rowCount = lastWeekNumber - firstWeekNumber;

  // If the last week contains 7 days, we need to add an extra row
  if (lastOfMonth.getDay() === weekEndsOn || isLastDisplayedMonth) {
    rowCount++;
  }

  return rowCount;
}

/**
 * Helper to find out what day the week ends on given the localized start of the week
 * @param {Number} weekStartsOn - the index of the first day of the week (from 0 to 6)
 * @return {Number} - Returns the index of the day the week ends on
 */
function getEndOfWeekIndex(weekStartsOn) {
  return weekStartsOn === 0 ? 6 : weekStartsOn - 1;
}

export class ScrollSpeed {
  clear = () => {
    this.lastPosition = null;
    this.delta = 0;
  };
  getScrollSpeed(scrollOffset) {
    if (this.lastPosition != null) {
      this.delta = scrollOffset - this.lastPosition;
    }
    this.lastPosition = scrollOffset;

    clearTimeout(this._timeout);
    this._timeout = setTimeout(this.clear, 50);

    return this.delta;
  }
}

export const scrollbarSize = getScrollbarSize();

export function emptyFn() {
  /* no-op */
}

export function sanitizeDate(
  date,
  { disabledDates = [], disabledDays = [], minDate, maxDate }
) {
  // Selected date should not be disabled or outside the selectable range
  if (
    !date ||
    disabledDates.some((disabledDate) => isSameDay(disabledDate, date)) ||
    (disabledDays && disabledDays.indexOf(getDay(date)) !== -1) ||
    (minDate && isBefore(date, startOfDay(minDate))) ||
    (maxDate && isAfter(date, endOfDay(maxDate)))
  ) {
    return null;
  }

  return date;
}

export function getDateString(year, month, date) {
  return `${year}-${('0' + (month + 1)).slice(-2)}-${('0' + date).slice(-2)}`;
}

export function getMonthsForYear(year, day = 1) {
  return Array.apply(null, Array(12)).map((val, index) => {
    const constrainedDay = Math.min(
      getDaysInMonth(new Date(year, index, 1)),
      isNaN(day) ? 1 : day
    );
    return new Date(year, index, constrainedDay);
  });
}

export const withImmutableProps = (props) =>
  withPropsOnChange(() => false, props);

export function debounce(callback, wait) {
  let timeout = null;
  let callbackArgs = null;

  const later = () => callback.apply(this, callbackArgs);

  return function () {
    callbackArgs = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function range(start, stop, step = 1) {
  const length = Math.max(Math.ceil((stop - start) / step), 0);
  const range = Array(length);

  for (let i = 0; i < length; i++, start += step) {
    range[i] = start;
  }

  return range;
}

export function isRange(date) {
  if (!date) {
    return false;
  }
  const { start, end } = date;
  return start !== undefined && end !== undefined;
}

export function getValidSelection(selected, minDate, maxDate) {
  if (!isRange(selected)) {
    if (minDate && isBefore(selected, minDate)) {
      return format(minDate, 'YYYY-MM-DD');
    }
    if (maxDate && isAfter(selected, maxDate)) {
      return format(maxDate, 'YYYY-MM-DD');
    }
    return selected;
  }

  let { start, end } = selected;
  if (minDate && isBefore(start, minDate)) {
    start = format(minDate, 'YYYY-MM-DD');
  }
  if (maxDate && isAfter(end, maxDate)) {
    end = format(maxDate, 'YYYY-MM-DD');
  }
  return { start, end };
}

export function getSortedDate(start, end) {
  return isBefore(start, end) ? { start, end } : { start: end, end: start };
}

// Chunk function splits the array into %target number of equal sized chunks.
export const chunk = (target, size) => {
  return target.reduce(
    (memo, value, index) => {
      if (index % (target.length / size) === 0 && index !== 0) memo.push([]);
      memo[memo.length - 1].push(value);
      return memo;
    },
    [[]]
  );
};

export { default as animate } from './animate';
