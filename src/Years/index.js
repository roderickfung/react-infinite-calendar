import React, { useCallback, useMemo } from 'react';
import VirtualList from 'react-tiny-virtual-list';
import classNames from 'classnames';
import { emptyFn, getMonthsForYear, isRange } from '../utils';
import {
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  isWithinRange,
  parse,
  startOfMonth,
} from 'date-fns';
import styles from './Years.scss';

const SPACING = 0;

const isDateDisabled = ({ date, min, minDate, max, maxDate }) =>
  isBefore(date, startOfMonth(min)) ||
  isBefore(date, startOfMonth(minDate)) ||
  isAfter(date, max) ||
  isAfter(date, maxDate);

const allowToSwitchYear = ({ selected, year, min, minDate, max, maxDate }) => {
  if (isRange(selected)) {
    return false;
  }

  return !isDateDisabled({
    date: new Date(selected).setYear(year),
    min,
    minDate,
    max,
    maxDate,
  });
};

const getSelected = selected => {
  if (isRange(selected)) {
    return {
      start: startOfMonth(selected.start),
      end: endOfMonth(selected.end),
    };
  }
  // remove time
  return {
    start: parse(format(selected, 'YYYY-MM-DD')),
    end: parse(format(selected, 'YYYY-MM-DD')),
  };
};

const Years = ({
  height,
  hideOnSelect,
  locale,
  max,
  maxDate,
  min,
  minDate,
  scrollToDate,
  today,
  setDisplay,
  theme,
  handlers,
  width,
  onSelect = emptyFn,
  showMonths = true,
  selected,
  years,
}) => {
  const selectedYearIndex = useMemo(() => {
    const yearsSliced = years.slice(0, years.length);
    return yearsSliced.indexOf(getSelected(selected).start.getFullYear());
  }, [selected, years]);

  const handleClick = useCallback(
    (date, e) => {
      onSelect(date, e, date => scrollToDate(date));
      if (hideOnSelect) {
        window.requestAnimationFrame(() => setDisplay('days'));
      }
    },
    [hideOnSelect, onSelect, scrollToDate, setDisplay]
  );

  const renderMonths = useCallback(
    year => {
      const months = getMonthsForYear(
        year,
        getSelected(selected).start.getDate()
      );
      return (
        <ol>
          {months.map((date, index) => {
            const isSelected = isWithinRange(
              date,
              getSelected(selected).start,
              getSelected(selected).end
            );
            const isCurrentMonth = isSameMonth(date, today);
            const isDisabled = isDateDisabled({
              date,
              min,
              minDate,
              max,
              maxDate,
            });
            const style = Object.assign(
              {},
              isSelected && {
                backgroundColor:
                  typeof theme.selectionColor === 'function'
                    ? theme.selectionColor(date)
                    : theme.selectionColor,
              },
              isCurrentMonth && {
                borderColor: theme.todayColor,
              }
            );
            const isStart = isSameMonth(date, selected.start);
            const isEnd = isSameMonth(date, selected.end);
            return (
              <li
                key={index}
                onClick={e => {
                  e.stopPropagation();

                  if (!isDisabled) {
                    handleClick(date, e);
                  }
                }}
                className={classNames(styles.month, {
                  [styles.selected]: isSelected,
                  [styles.currentMonth]: isCurrentMonth,
                  [styles.disabled]: isDisabled,
                  [styles.range]: !(isStart && isEnd),
                  [styles.start]: isStart,
                  [styles.betweenRange]:
                    isWithinRange(date, selected.start, selected.end) &&
                    !isStart &&
                    !isEnd,
                  [styles.end]: isEnd,
                })}
                style={style}
                title={
                  isRange(selected)
                    ? ''
                    : `Set date to ${format(date, 'MMMM Do, YYYY')}`
                }
                data-month={`${format(date, 'YYYY-MM')}`}
                {...handlers}
              >
                <div
                  className={styles.selection}
                  data-month={`${format(date, 'YYYY-MM')}`}
                >
                  {format(date, 'MMM', { locale })}
                </div>
              </li>
            );
          })}
        </ol>
      );
    },
    [
      handleClick,
      handlers,
      locale,
      max,
      maxDate,
      min,
      minDate,
      selected,
      theme,
      today,
    ]
  );

  const currentYear = today.getFullYear();
  const yearsSliced = years.slice(0, years.length);
  const rowHeight = showMonths ? 80 : 40;
  const heights = yearsSliced.map((val, index) =>
    index === 0 || index === yearsSliced.length - 1
      ? rowHeight + SPACING
      : rowHeight
  );
  const isYearLess = yearsSliced.length * rowHeight < height + 40;
  const containerHeight = isYearLess
    ? yearsSliced.length * rowHeight + 2 * SPACING
    : height + 40;

  let scrollOffset = 0;
  if (!isYearLess && selectedYearIndex !== -1) {
    const top = heights
      .slice(0, selectedYearIndex)
      .reduce((acc, val) => acc + val, 0);
    scrollOffset = top - containerHeight / 2 + 40;
  }

  return (
    <div
      className={styles.root}
      style={{ color: theme.selectionColor, height: height + 40 }}
    >
      <VirtualList
        className={styles.list}
        width={width}
        height={containerHeight}
        itemCount={yearsSliced.length}
        estimatedItemSize={rowHeight}
        itemSize={index => heights[index]}
        scrollOffset={scrollOffset}
        renderItem={({ index, style }) => {
          const year = yearsSliced[index];
          const isActive = index === selectedYearIndex;
          const shouldAllowToSwitchYear = allowToSwitchYear({
            selected,
            year,
            min,
            minDate,
            max,
            maxDate,
          });

          return (
            <div
              key={index}
              className={classNames(styles.year, {
                [styles.active]: !showMonths && isActive,
                [styles.currentYear]: !showMonths && year === currentYear,
                [styles.withMonths]: showMonths,
                [styles.first]: index === 0,
                [styles.last]: index === yearsSliced.length - 1,
              })}
              onClick={e =>
                shouldAllowToSwitchYear && handleClick(new Date(year, 0, 1), e)
              }
              title={shouldAllowToSwitchYear ? `Set year to ${year}` : ''}
              data-year={year}
              style={{
                ...style,
                ...{
                  color:
                    typeof theme.selectionColor === 'function'
                      ? theme.selectionColor(new Date(year, 0, 1))
                      : theme.selectionColor,
                },
              }}
            >
              <label>
                <span
                  style={
                    !showMonths && year === currentYear
                      ? { borderColor: theme.todayColor }
                      : null
                  }
                >
                  {year}
                </span>
              </label>
              {showMonths && renderMonths(year)}
            </div>
          );
        }}
      />
    </div>
  );
};

export default Years;
