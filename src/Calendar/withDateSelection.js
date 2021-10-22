import { compose, withProps, withPropsOnChange, withState } from 'recompose';
import classNames from 'classnames';
import { withDefaultProps } from './';
import { sanitizeDate, withImmutableProps } from '../utils';
import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  startOfQuarter,
  endOfQuarter,
  setQuarter,
} from 'date-fns';
import styles from '../Day/Day.scss';

export const enhanceDay = withPropsOnChange(
  ['selected'],
  ({
    isWeeklySelection,
    isQuarterlySelection,
    selected,
    fiscalYearStart,
    date,
    theme,
  }) => {
    if (isQuarterlySelection) {
      const fiscalYear = new Date(
        new Date().getFullYear(),
        fiscalYearStart - 1,
        1
      );
      setQuarter(fiscalYear, 1);
      const start = format(startOfQuarter(selected), 'YYYY-MM-DD');
      const end = format(endOfQuarter(selected), 'YYYY-MM-DD');

      let isSelected = date >= start && date <= end;
      let isStart = date === start;
      let isEnd = date === end;
      const isRange = !(isStart && isEnd);
      const style =
        isRange &&
        ((isStart && { backgroundColor: theme.accentColor }) ||
          (isEnd && { backgroundColor: theme.accentColor }));

      return {
        className:
          isSelected &&
          isRange &&
          classNames(styles.range, {
            [styles.start]: isStart,
            [styles.betweenRange]: !isStart && !isEnd,
            [styles.end]: isEnd,
          }),
        isSelected,
        selectionStyle: style,
      };
    }

    if (isWeeklySelection) {
      const start = format(startOfWeek(selected), 'YYYY-MM-DD');
      const end = format(endOfWeek(selected), 'YYYY-MM-DD');
      let isSelected = date >= start && date <= end;
      let isStart = date === start;
      const isEnd = date === end;
      const isRange = !(isStart && isEnd);
      const style =
        isRange &&
        ((isStart && { backgroundColor: theme.accentColor }) ||
          (isEnd && { backgroundColor: theme.accentColor }));

      return {
        className:
          isSelected &&
          isRange &&
          classNames(styles.range, {
            [styles.start]: isStart,
            [styles.betweenRange]: !isStart && !isEnd,
            [styles.end]: isEnd,
          }),
        isSelected,
        selectionStyle: style,
      };
    }

    return {
      isSelected: selected === date,
    };
  }
);

const enhanceYear = withPropsOnChange(['selected'], ({ selected }) => ({
  selected: parse(selected),
}));

// Enhancer to handle selecting and displaying a single date
export const withDateSelection = compose(
  withDefaultProps,
  withImmutableProps(({ DayComponent, QuartersComponent, YearsComponent }) => ({
    DayComponent: enhanceDay(DayComponent),
    QuartersComponent: enhanceYear(QuartersComponent),
    YearsComponent: enhanceYear(YearsComponent),
  })),
  withState('hoveredDate', 'setHoveredDate'),
  withState(
    'scrollDate',
    'setScrollDate',
    (props) => props.selected || new Date()
  ),
  withProps(
    ({
      onSelect,
      setScrollDate,
      hoveredDate,
      setHoveredDate,
      fiscalYearStart,
      ...props
    }) => {
      const selected = sanitizeDate(props.selected, props);

      return {
        passThrough: {
          Day: {
            hoveredDate: hoveredDate,
            isWeeklySelection: Boolean(props.isWeeklySelection),
            isQuarterlySelection: Boolean(props.isQuarterlySelection),
            fiscalYearStart,
            onClick: onSelect,
            onMouseEnter: setHoveredDate,
            onMouseLeave: () => setHoveredDate(undefined),
          },
          Quarters: {
            fiscalYearStart,
            isQuarterlySelection: Boolean(props.isQuarterlySelection),
            onSelect: (month) => {
              return handleYearSelect(month, {
                onSelect,
                selected,
                setScrollDate,
              });
            },
          },
          Years: {
            onSelect: (year) =>
              handleYearSelect(year, { onSelect, selected, setScrollDate }),
          },
        },
        selected: selected && format(selected, 'YYYY-MM-DD'),
      };
    }
  )
);

function handleYearSelect(date, { setScrollDate, onSelect }) {
  const newDate = parse(date);

  onSelect(newDate);
  setScrollDate(newDate);
}
