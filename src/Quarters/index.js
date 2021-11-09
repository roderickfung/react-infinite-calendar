import React, { useCallback, useMemo } from 'react';
import VirtualList from 'react-tiny-virtual-list';
import classNames from 'classnames';
import { emptyFn, getMonthsForYear, isRange, chunk } from '../utils';
import {
  startOfMonth,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isWithinRange,
  parse,
  getMonth,
  addYears,
} from 'date-fns';
import styles from './Quarters.scss';

const SPACING = 0;

// const getQuarter = (date, fiscalYearStart) => {
//   const fiscalDate = new Date(getYear(date), fiscalYearStart, 1);

// };

const isSameQuarter = (months, today) => {
  return isAfter(today, months[0]) && isBefore(today, months[2]);
};

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

const getSelected = (selected) => {
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

const Quarters = (props) => {
  const {
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
    showQuarters = true,
    selected,
    years,
    fiscalYearStart = 1,
  } = props;

  // console.log('MIN', min, minDate);
  // console.log('MAX', max, maxDate);

  const selectedYearIndex = useMemo(() => {
    const yearsSliced = years.slice(0, years.length);
    return yearsSliced.indexOf(getSelected(selected).start.getFullYear());
  }, [selected, years]);

  const handleClick = useCallback(
    (date, e) => {
      // console.log('HANDLE CLICK', date);
      onSelect(date, e, (date) => scrollToDate(date));
      if (hideOnSelect) {
        window.requestAnimationFrame(() => setDisplay('days'));
      }
    },
    [hideOnSelect, onSelect, scrollToDate, setDisplay]
  );

  const renderMonths = useCallback(
    (chunked) => {
      return (
        <>
          <label>Q1</label>
          <article className="quarterly-view">
            {chunked.map((months) => {
              const isDisabled = months.some((month) => {
                const disabled = isDateDisabled({
                  date: month,
                  min,
                  minDate,
                  max,
                  maxDate,
                });

                return disabled;
              });

              const isCurrentQuarter = isSameQuarter(months, today);

              const isSelected = months.some((month) => {
                return isWithinRange(
                  month,
                  getSelected(selected[0]),
                  getSelected(selected[2])
                );
              });

              if (isSelected) {
                console.log('IS SELECTED', isSelected);
              }

              const isStart = isSameQuarter(months, selected.start);
              const isEnd = isSameQuarter(months, selected.end);

              const style = Object.assign(
                {},
                isSelected && {
                  backgroundColor:
                    typeof theme.selectionColor === 'function'
                      ? theme.selectionColor(months[0])
                      : theme.selectionColor,
                },
                isCurrentQuarter && {
                  borderColor: theme.todayColor,
                }
              );

              return (
                <div key={`${getMonth(months[0])} - $P`}>
                  <ol
                    className={classNames(styles.month, {
                      [styles.selected]: isSelected,
                      [styles.currentQuarter]: isCurrentQuarter,
                      [styles.disabled]: isDisabled,
                      [styles.range]: !(isStart && isEnd),
                      [styles.start]: isStart,
                      [styles.betweenRange]:
                        isWithinRange(
                          months[0],
                          selected.start,
                          selected.end
                        ) &&
                        !isStart &&
                        !isEnd,
                      [styles.end]: isEnd,
                    })}
                    style={style}
                    onClick={(e) => {
                      e.stopPropagation();

                      if (!isDisabled) {
                        handleClick(months[0], e);
                      }
                    }}
                    {...handlers}
                  >
                    {months.map((date, index) => {
                      return (
                        <li
                          key={index}
                          data-month={`${format(date, 'YYYY-MM')}`}
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
                </div>
              );
            })}
            {}
          </article>
        </>
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
  const rowHeight = 210;
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
        itemSize={(index) => heights[index]}
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

          const months = getMonthsForYear(
            year,
            getSelected(selected).start.getDate()
          );

          const appendages = months
            .slice(0, fiscalYearStart - 1)
            .map((date) => addYears(date, 1));

          const fiscalYear = [
            ...months.slice(fiscalYearStart - 1, months.length),
            ...appendages,
          ];
          const chunked = chunk(fiscalYear, 4);

          return (
            <div
              key={index}
              className={classNames(styles.year, {
                [styles.active]: showQuarters && isActive,
                [styles.withMonths]: showQuarters,
                [styles.first]: index === 0,
                [styles.last]: index === yearsSliced.length - 1,
              })}
              onClick={(e) =>
                shouldAllowToSwitchYear &&
                handleClick(new Date(year, fiscalYearStart - 1, 1), e)
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
              <label
                class={classNames({
                  [styles.currentYear]: currentYear === year,
                })}
              >
                <span>{year}</span>
              </label>
              {showQuarters && renderMonths(chunked)}
            </div>
          );
        }}
      />
    </div>
  );
};

export default Quarters;
