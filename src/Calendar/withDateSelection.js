import { compose, withProps, withPropsOnChange, withState } from 'recompose';
import classNames from 'classnames';
import { withDefaultProps } from './';
import { sanitizeDate, withImmutableProps } from '../utils';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/start_of_week';
import endOfWeek from 'date-fns/end_of_week';
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
        (isEnd && { borderColor: theme.accentColor }));

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
  withImmutableProps(
    ({ DayComponent, onSelect, setScrollDate, YearsComponent }) => ({
      DayComponent: enhanceDay(DayComponent),
      YearsComponent: enhanceYear(YearsComponent),
    })
  ),
  withState(
    'scrollDate',
    'setScrollDate',
    props => props.selected || new Date()
  ),
  withProps(({ onSelect, setScrollDate, ...props }) => {
    const selected = sanitizeDate(props.selected, props);

    return {
      passThrough: {
        Day: {
          isWeeklySelection: Boolean(props.isWeeklySelection),
          onClick: onSelect,
        },
        Years: {
          onSelect: year =>
            handleYearSelect(year, { onSelect, selected, setScrollDate }),
        },
      },
      selected: selected && format(selected, 'YYYY-MM-DD'),
    };
  })
);

function handleYearSelect(date, { setScrollDate, selected, onSelect }) {
  const newDate = parse(date);

  onSelect(newDate);
  setScrollDate(newDate);
}
