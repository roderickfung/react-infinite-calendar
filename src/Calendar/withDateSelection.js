import { compose, withProps, withPropsOnChange, withState } from 'recompose';
import classNames from 'classnames';
import { withDefaultProps } from './';
import { sanitizeDate, withImmutableProps } from '../utils';
import { format, parse, startOfWeek, endOfWeek } from 'date-fns';
import styles from '../Day/Day.scss';

export const enhanceDay = withPropsOnChange(
  ['selected'],
  ({ isWeeklySelection, selected, date, theme }) => {
    if (!isWeeklySelection) {
      return {
        isSelected: selected === date,
      };
    }
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
);

const enhanceYear = withPropsOnChange(['selected'], ({ selected }) => ({
  selected: parse(selected),
}));

// Enhancer to handle selecting and displaying a single date
export const withDateSelection = compose(
  withDefaultProps,
  withImmutableProps(({ DayComponent, YearsComponent }) => ({
    DayComponent: enhanceDay(DayComponent),
    YearsComponent: enhanceYear(YearsComponent),
  })),
  withState('hoveredDate', 'setHoveredDate'),
  withState(
    'scrollDate',
    'setScrollDate',
    (props) => props.selected || new Date()
  ),
  withProps(
    ({ onSelect, setScrollDate, hoveredDate, setHoveredDate, ...props }) => {
      const selected = sanitizeDate(props.selected, props);

      return {
        passThrough: {
          Day: {
            hoveredDate: hoveredDate,
            isWeeklySelection: Boolean(props.isWeeklySelection),
            onClick: onSelect,
            onMouseEnter: setHoveredDate,
            onMouseLeave: () => setHoveredDate(undefined),
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
