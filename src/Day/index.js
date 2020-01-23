import React, { PureComponent } from 'react';
import classNames from 'classnames';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/start_of_week';
import endOfWeek from 'date-fns/end_of_week';
import isSameWeek from 'date-fns/is_same_week';
import isSameDay from 'date-fns/is_same_day';
import startOfMonth from 'date-fns/start_of_month';
import endOfMonth from 'date-fns/end_of_month';
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

  renderSelection(selectionColor) {
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
            [styles.startOfMonth]: isStartOfMonth,
            [styles.endOfMonth]: isEndOfMonth,
          },
          className
        )}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        data-date={date}
        {...handlers}
      >
        {day === 1 && <span className={styles.month}>{monthShort}</span>}
        {isToday ? <span>{padZero(day)}</span> : padZero(day)}
        {day === 1 && currentYear !== year && (
          <span className={styles.year}>{year}</span>
        )}
        {isSelected && this.renderSelection()}
      </li>
    );
  }
}
