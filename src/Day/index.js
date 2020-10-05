import React, { PureComponent } from 'react';
import classNames from 'classnames';
import {
  parse,
  startOfWeek,
  endOfWeek,
  isSameWeek,
  isSameDay,
  startOfMonth,
  endOfMonth,
  getMonth,
} from 'date-fns';
import styles from './Day.scss';

const padZero = n => (n < 10 ? `0${n}` : String(n));

export default class Day extends PureComponent {
  handleClick = () => {
    let { date, isDisabled, onClick, isWeeklySelection } = this.props;

    if (!isDisabled && typeof onClick === 'function') {
      if (isWeeklySelection) {
        onClick(parse(startOfWeek(date)));
      } else {
        onClick(parse(date));
      }
    }
  };

  handleMouseEnter = () => {
    let { date, isDisabled, isWeeklySelection, onMouseEnter } = this.props;

    if (!isDisabled && isWeeklySelection) {
      onMouseEnter(date);
    }
  };

  handleMouseLeave = () => {
    let { date, isDisabled, isWeeklySelection, onMouseLeave } = this.props;

    if (!isDisabled && isWeeklySelection) {
      onMouseLeave(date);
    }
  };

  renderSelection() {
    const {
      day,
      date,
      isToday,
      locale: { todayLabel },
      monthShort,
      theme: { textColor },
      selectionStyle,
    } = this.props;

    return (
      <div
        className={styles.selection}
        data-date={date}
        style={{
          backgroundColor: this.selectionColor,
          color: textColor.active,
          ...selectionStyle,
        }}
      >
        <span className={styles.month}>
          {isToday ? todayLabel.short || todayLabel.long : monthShort}
        </span>
        <span className={styles.day}>{padZero(day)}</span>
      </div>
    );
  }

  render() {
    const {
      className,
      currentYear,
      date,
      day,
      handlers,
      hoveredDate,
      isDisabled,
      isHighlighted,
      isToday,
      isSelected,
      isWeeklySelection,
      monthShort,
      theme: { selectionColor, todayColor },
      year,
    } = this.props;

    const isStartOfWeek = isSameDay(date, startOfWeek(date));
    const isEndOfWeek = isSameDay(date, endOfWeek(date));
    const isStartOfMonth = isSameDay(date, startOfMonth(date));
    const isEndOfMonth = isSameDay(date, endOfMonth(date));
    const isHovered = isWeeklySelection && isSameWeek(date, hoveredDate);
    const month = getMonth(date);
    let color;

    if (isSelected) {
      color = this.selectionColor =
        typeof selectionColor === 'function'
          ? selectionColor(date)
          : selectionColor;
    } else if (isToday) {
      color = todayColor;
    }

    return (
      <li
        style={color ? { color } : null}
        className={classNames(
          styles.root,
          {
            [styles.today]: isToday,
            [styles.highlighted]: isHighlighted,
            [styles.selected]: isSelected,
            [styles.disabled]: isDisabled,
            [styles.enabled]: !isDisabled,
            [styles.hovered]: isHovered && !isSelected,
            [styles.startOfWeek]: isStartOfWeek,
            [styles.endOfWeek]: isEndOfWeek,

            [styles.endOfMonth]: isEndOfMonth,
            [styles.endOfOddMonth]:
              month % 2 === 0 && isEndOfMonth && !isEndOfWeek,
            [styles.endOfEvenMonth]:
              month % 2 === 1 && isEndOfMonth && !isEndOfWeek,

            [styles.startOfMonth]: isStartOfMonth,
            [styles.startOfOddMonth]:
              month % 2 === 1 && isStartOfMonth && !isStartOfWeek,
            [styles.startOfEvenMonth]:
              month % 2 === 0 && isStartOfMonth && !isStartOfWeek,
          },
          className
        )}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        data-date={date}
        data-value={padZero(day)}
        {...handlers}
      >
        {day === 1 && <span className={styles.month}>{monthShort}</span>}
        {isToday ? <span>{padZero(day)}</span> : padZero(day)}
        {day === 1 && currentYear !== year && monthShort === 'Jan' && (
          <span className={styles.year}>{year}</span>
        )}
        {isSelected && this.renderSelection()}
      </li>
    );
  }
}
