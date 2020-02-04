import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import format from 'date-fns/format';
import defaultLocale from '../utils/defaultLocale';
import styles from './CurrentMonth.scss';

export default class CurrentMonth extends PureComponent {
  static propTypes = {
    currentMonth: PropTypes.instanceOf(Date),
    theme: PropTypes.object,
  };

  render() {
    const { currentMonth, theme } = this.props;

    return currentMonth ? (
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
  }
}
