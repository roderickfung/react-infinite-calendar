import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import defaultLocale from '../utils/defaultLocale';
import styles from './CurrentMonth.scss';

const CurrentMonth = ({ currentMonth, theme }) =>
  currentMonth ? (
    <div
      className={styles.root}
      style={{
        backgroundColor: theme.floatingNav.background,
        color: theme.floatingNav.color,
      }}
    >
      {format(currentMonth, defaultLocale.monthLabelFormat).toUpperCase()}
    </div>
  ) : null;

export default CurrentMonth;

CurrentMonth.propTypes = {
  currentMonth: PropTypes.instanceOf(Date),
  theme: PropTypes.object,
};
