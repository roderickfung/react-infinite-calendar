import React from 'react';
import PropTypes from 'prop-types';
import { scrollbarSize } from '../utils';
import styles from './Weekdays.scss';

const Weekdays = ({ weekdays, weekStartsOn, theme }) => {
  const orderedWeekdays = [
    ...weekdays.slice(weekStartsOn, 7),
    ...weekdays.slice(0, weekStartsOn),
  ];

  return (
    <ul
      className={styles.root}
      style={{
        backgroundColor: theme.weekdayColor,
        color: theme.textColor.active,
        paddingRight: scrollbarSize,
      }}
      aria-hidden={true}
    >
      {orderedWeekdays.map(val => (
        <li key={`Weekday-${val}`} className={styles.day}>
          {val}
        </li>
      ))}
    </ul>
  );
};

export default Weekdays;

Weekdays.propTypes = {
  locale: PropTypes.object,
  theme: PropTypes.object,
};
