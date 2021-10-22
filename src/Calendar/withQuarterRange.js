import { min, max, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { compose, withProps, withState } from 'recompose';
import { withDefaultProps } from './';
import { withImmutableProps } from '../utils';
import { EVENT_TYPE, getInitialDate, getSortedSelection } from './Range';

let isTouchDevice = false;

export const withQuarterRange = compose(
  withDefaultProps,
  withState('scrollDate', 'setScrollDate', getInitialDate),
  withState('selectionStart', 'setSelectionStart', null),
  withImmutableProps(({ QuartersComponent }) => ({
    QuartersComponent: QuartersComponent,
  })),
  withState('hoveredDate', 'setHoveredDate', getInitialDate),
  withProps(({ passThrough, selected, hoveredDate, ...props }) => ({
    /* eslint-disable sort-keys */
    passThrough: {
      ...passThrough,
      Quarters: {
        hoveredDate: hoveredDate,
        onSelect: (date) => {
          if (props.selectionStart) {
            return handleSelect(endOfMonth(addMonths(date, 2)), {
              selected,
              ...props,
            });
          }

          return handleSelect(date, { selected, ...props });
        },
        handlers: {
          onMouseOver:
            !isTouchDevice && props.selectionStart
              ? (e) => handleMouseOver(e, { selected, ...props })
              : null,
        },
      },
      Years: {
        onSelect: (date) => handleSelect(date, { selected, ...props }),
        handlers: {
          onMouseOver:
            !isTouchDevice && props.selectionStart
              ? (e) => handleMouseOver(e, { selected, ...props })
              : null,
        },
      },
    },
    selected: {
      start: selected && selected.start,
      end: selected && selected.end,
    },
  }))
);

function handleSelect(
  date,
  { onSelect, selectionStart, setSelectionStart, min, max, minDate, maxDate }
) {
  if (selectionStart) {
    onSelect({
      eventType: EVENT_TYPE.END,
      ...getMonthRangeDate({
        start: selectionStart,
        end: date,
        minSelected: minDate,
        maxSelected: maxDate,
        minScrolled: min,
        maxScrolled: max,
      }),
    });
    setSelectionStart(null);
  } else {
    onSelect({
      eventType: EVENT_TYPE.START,
      ...getMonthRangeDate({
        start: date,
        end: date,
        minSelected: minDate,
        maxSelected: maxDate,
        minScrolled: min,
        maxScrolled: max,
      }),
    });
    setSelectionStart(date);
  }
}

function handleMouseOver(e, { onSelect, selectionStart }) {
  e.stopPropagation();
  const month = e.target.getAttribute('data-month');
  if (!month) {
    return;
  }
  onSelect({
    eventType: EVENT_TYPE.HOVER,
    ...getMonthRangeDate({
      start: selectionStart,
      end: month,
    }),
  });
}

function getMonthRangeDate({
  start,
  end,
  minSelected,
  maxSelected,
  minScrolled,
  maxScrolled,
}) {
  const sortedDate = getSortedSelection({ start, end });
  const compareStartDate = [];
  const compareEndDate = [];
  if (sortedDate.start) {
    compareStartDate.push(sortedDate.start, startOfMonth(sortedDate.start));
    minScrolled && compareStartDate.push(minScrolled);
    minSelected && compareStartDate.push(minSelected);
  }
  if (sortedDate.end) {
    compareEndDate.push(endOfMonth(sortedDate.end));
    maxScrolled && compareEndDate.push(maxScrolled);
    maxSelected && compareEndDate.push(maxSelected);
  }
  return {
    start:
      compareStartDate.length > 0 ? max(...compareStartDate) : sortedDate.start,
    end: compareEndDate.length > 0 ? min(...compareEndDate) : sortedDate.end,
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('touchstart', function onTouch() {
    isTouchDevice = true;

    window.removeEventListener('touchstart', onTouch, false);
  });
}
