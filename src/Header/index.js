import React from 'react';
import PropTypes from 'prop-types';
import { emptyFn } from '../utils';
import defaultSelectionRenderer from './defaultSelectionRenderer';
import classNames from 'classnames';
import styles from './Header.scss';

const Header = props => {
  const {
    layout,
    locale: { blank },
    selected,
    renderSelection,
    theme,
  } = props;

  return (
    <div
      className={classNames(styles.root, {
        [styles.landscape]: layout === 'landscape',
      })}
      style={{
        backgroundColor: theme.headerColor,
        color: theme.textColor.active,
      }}
    >
      {(selected && renderSelection(selected, props)) || (
        <div className={classNames(styles.wrapper, styles.blank)}>{blank}</div>
      )}
    </div>
  );
};

export default Header;

Header.propTypes = {
  dateFormat: PropTypes.string,
  display: PropTypes.string,
  layout: PropTypes.string,
  locale: PropTypes.object,
  onYearClick: PropTypes.func,
  selected: PropTypes.any,
  shouldAnimate: PropTypes.bool,
  theme: PropTypes.object,
};

Header.defaultProps = {
  onYearClick: emptyFn,
  renderSelection: defaultSelectionRenderer,
};
