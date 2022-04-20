import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  debounce,
  emptyFn,
  range,
  ScrollSpeed,
  getValidSelection,
} from '../utils';
import { defaultProps } from 'recompose';
import defaultDisplayOptions from '../utils/defaultDisplayOptions';
import defaultLocale from '../utils/defaultLocale';
import defaultTheme from '../utils/defaultTheme';
import Today, { DIRECTION_UP, DIRECTION_DOWN } from '../Today';
import CurrentMonth from '../CurrentMonth';
import Header from '../Header';
import MonthList from '../MonthList';
import Weekdays from '../Weekdays';
import Quarters from '../Quarters';
import Years from '../Years';
import Day from '../Day';
import { parse, format, startOfDay } from 'date-fns';
import containerStyles from './Container.scss';

export const withDefaultProps = defaultProps({
  autoFocus: true,
  DayComponent: Day,
  display: 'days',
  displayOptions: {},
  HeaderComponent: Header,
  height: 500,
  isWeeklySelection: false,
  isQuarterlySelection: false,
  keyboardSupport: true,
  max: new Date(2050, 11, 31),
  maxDate: new Date(2050, 11, 31),
  min: new Date(1980, 0, 1),
  minDate: new Date(1980, 0, 1),
  onHighlightedDateChange: emptyFn,
  onScroll: emptyFn,
  onScrollEnd: emptyFn,
  onSelect: emptyFn,
  passThrough: {},
  rowHeight: 40,
  tabIndex: 1,
  width: 400,
  YearsComponent: Years,
  QuartersComponent: Quarters,
  fiscalYearStart: 1,
});

export default class Calendar extends Component {
  constructor(props) {
    super(...arguments);
    this.updateYears(props);
    this.state = {
      display: props.display,
    };

    this._MonthList = React.createRef();
  }
  static propTypes = {
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    disabledDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
    disabledDays: PropTypes.arrayOf(PropTypes.number),
    display: PropTypes.oneOf(['years', 'quarters', 'days']),
    displayOptions: PropTypes.shape({
      hideYearsOnSelect: PropTypes.bool,
      layout: PropTypes.oneOf(['portrait', 'landscape']),
      overscanMonthCount: PropTypes.number,
      shouldHeaderAnimate: PropTypes.bool,
      showCurrentMonth: PropTypes.bool,
      showHeader: PropTypes.bool,
      showMonthsForYears: PropTypes.bool,
      showOverlay: PropTypes.bool,
      showTodayHelper: PropTypes.bool,
      showWeekdays: PropTypes.bool,
      todayHelperRowOffset: PropTypes.number,
    }),
    height: PropTypes.number,
    isWeeklySelection: PropTypes.bool,
    isQuarterlySelection: PropTypes.bool,
    keyboardSupport: PropTypes.bool,
    locale: PropTypes.shape({
      blank: PropTypes.string,
      headerFormat: PropTypes.string,
      todayLabel: PropTypes.shape({
        long: PropTypes.string,
        short: PropTypes.string,
      }),
      weekdays: PropTypes.arrayOf(PropTypes.string),
      weekStartsOn: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),
    }),
    max: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),
    min: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    onScroll: PropTypes.func,
    onScrollEnd: PropTypes.func,
    onSelect: PropTypes.func,
    rowHeight: PropTypes.number,
    tabIndex: PropTypes.number,
    theme: PropTypes.shape({
      floatingNav: PropTypes.shape({
        background: PropTypes.string,
        chevron: PropTypes.string,
        color: PropTypes.string,
      }),
      headerColor: PropTypes.string,
      selectionColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      textColor: PropTypes.shape({
        active: PropTypes.string,
        default: PropTypes.string,
      }),
      todayColor: PropTypes.string,
      weekdayColor: PropTypes.string,
    }),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    DayComponent: PropTypes.func,
    YearsComponent: PropTypes.func,
    QuartersComponent: PropTypes.func,
    fiscalYearStart: PropTypes.number,
  };

  componentDidMount() {
    const { autoFocus } = this.props;
    const { showCurrentMonth } = this.getDisplayOptions();

    if (autoFocus) {
      this.node.focus();
    }

    if (showCurrentMonth) {
      this.updateCurrentMonth();
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    let { min, minDate, max, maxDate } = this.props;

    if (
      nextProps.min !== min ||
      nextProps.minDate !== minDate ||
      nextProps.max !== max ||
      nextProps.maxDate !== maxDate
    ) {
      this.updateYears(nextProps);
    }

    if (nextProps.display !== this.props.display) {
      this.setState({ display: nextProps.display });
    }
  }

  updateYears(props = this.props) {
    this._min = parse(props.min);
    this._max = parse(props.max);
    this._minDate = parse(props.minDate);
    this._maxDate = parse(props.maxDate);

    const min = this._min.getFullYear();
    const minMonth = this._min.getMonth();
    const max = this._max.getFullYear();
    const maxMonth = this._max.getMonth();

    const months = [];
    let year, month;
    for (year = min; year <= max; year++) {
      for (month = 0; month < 12; month++) {
        if (
          (year === min && month < minMonth) ||
          (year === max && month > maxMonth)
        ) {
          continue;
        }

        months.push({ month, year });
      }
    }

    this.months = months;
  }

  getDisabledDates(disabledDates) {
    return (
      disabledDates &&
      disabledDates.map((date) => format(parse(date), 'YYYY-MM-DD'))
    );
  }
  _displayOptions = {};

  getDisplayOptions(displayOptions = this.props.displayOptions) {
    return Object.assign(
      this._displayOptions,
      defaultDisplayOptions,
      displayOptions
    );
  }
  _locale = {};
  getLocale() {
    return Object.assign(this._locale, defaultLocale, this.props.locale);
  }
  _theme = {};
  getTheme() {
    return Object.assign(this._theme, defaultTheme, this.props.theme);
  }
  getCurrentOffset = () => {
    return this.scrollTop;
  };
  getDateOffset = (date) => {
    return this._MonthList && this._MonthList.current.getDateOffset(date);
  };
  scrollTo = (offset) => {
    return this._MonthList && this._MonthList.current.scrollTo(offset);
  };
  scrollToDate = (date = new Date(), offset, shouldAnimate) => {
    const { display } = this.props;

    return (
      this._MonthList &&
      this._MonthList.current.scrollToDate(
        date,
        offset,
        shouldAnimate && display === 'days',
        () => this.setState({ isScrolling: false })
      )
    );
  };
  getScrollSpeed = new ScrollSpeed().getScrollSpeed;
  handleScroll = (scrollTop, e) => {
    const { onScroll, rowHeight } = this.props;
    const { isScrolling } = this.state;
    const {
      showCurrentMonth,
      showTodayHelper,
      showOverlay,
    } = this.getDisplayOptions();
    const scrollSpeed = Math.abs(this.getScrollSpeed(scrollTop));
    this.scrollTop = scrollTop;

    // We only want to display the months overlay if the user is rapidly scrolling
    if (showOverlay && scrollSpeed > rowHeight && !isScrolling) {
      this.setState({
        isScrolling: true,
      });
    }

    if (showCurrentMonth) {
      this.updateCurrentMonth();
    }

    if (showTodayHelper) {
      this.updateTodayHelperPosition(scrollSpeed);
    }

    onScroll(scrollTop, e);
    this.handleScrollEnd();
  };
  handleScrollEnd = debounce(() => {
    const { onScrollEnd } = this.props;
    const { isScrolling } = this.state;
    const { showTodayHelper } = this.getDisplayOptions();

    if (isScrolling) {
      this.setState({ isScrolling: false });
    }

    if (showTodayHelper) {
      this.updateTodayHelperPosition(0);
    }

    onScrollEnd(this.scrollTop);
  }, 150);
  updateCurrentMonth = () => {
    this._MonthList &&
      this.setState({
        currentMonth: this._MonthList.current.currentMonth,
      });
  };

  updateTodayHelperPosition = (scrollSpeed) => {
    const today = this.today;
    const scrollTop = this.scrollTop;
    const { showToday } = this.state;
    const { height, rowHeight } = this.props;
    const { todayHelperRowOffset } = this.getDisplayOptions();
    let newState;

    if (!this._todayOffset) {
      this._todayOffset = this.getDateOffset(today);
    }

    // Today is above the fold
    if (
      scrollTop >=
      this._todayOffset +
        (height - rowHeight) / 2 +
        rowHeight * todayHelperRowOffset
    ) {
      if (showToday !== DIRECTION_UP) newState = DIRECTION_UP;
    }
    // Today is below the fold
    else if (
      scrollTop <=
      this._todayOffset - height / 2 - rowHeight * (todayHelperRowOffset + 1)
    ) {
      if (showToday !== DIRECTION_DOWN) newState = DIRECTION_DOWN;
    } else if (showToday && scrollSpeed <= 1) {
      newState = false;
    }

    if (scrollTop === 0) {
      newState = false;
    }

    if (newState != null) {
      this.setState({ showToday: newState });
    }
  };

  setDisplay = (display) => {
    this.setState({ display });
  };

  render() {
    let {
      className,
      passThrough,
      DayComponent,
      disabledDays,
      displayDate,
      height,
      HeaderComponent,
      rowHeight,
      scrollDate,
      initialScrollDate,
      selected,
      tabIndex,
      width,
      YearsComponent,
      QuartersComponent,
      minDate,
      maxDate,
      min,
      max,
      fiscalYearStart,
    } = this.props;

    const {
      hideYearsOnSelect,
      layout,
      overscanMonthCount,
      shouldHeaderAnimate,
      showCurrentMonth,
      showHeader,
      showMonthsForYears,
      showOverlay,
      showTodayHelper,
      showWeekdays,
    } = this.getDisplayOptions();
    const { display, isScrolling, showToday, currentMonth } = this.state;
    const disabledDates = this.getDisabledDates(this.props.disabledDates);
    const locale = this.getLocale();
    const theme = this.getTheme();
    const today = (this.today = startOfDay(new Date()));
    const validSelection = getValidSelection(
      selected,
      minDate || min,
      maxDate || max
    );

    return (
      <div
        tabIndex={tabIndex}
        className={classNames(className, containerStyles.root, {
          [containerStyles.landscape]: layout === 'landscape',
        })}
        style={{ color: theme.textColor.default, width }}
        aria-label="Calendar"
        ref={(node) => {
          this.node = node;
        }}
        {...passThrough.rootNode}
      >
        {showHeader && (
          <HeaderComponent
            selected={validSelection}
            shouldAnimate={Boolean(shouldHeaderAnimate && display !== 'years')}
            layout={layout}
            theme={theme}
            locale={locale}
            scrollToDate={this.scrollToDate}
            setDisplay={this.setDisplay}
            dateFormat={locale.headerFormat}
            display={display}
            displayDate={displayDate}
            {...passThrough.Header}
          />
        )}
        <div className={containerStyles.wrapper}>
          {showWeekdays && (
            <Weekdays
              weekdays={locale.weekdays}
              weekStartsOn={locale.weekStartsOn}
              theme={theme}
            />
          )}
          <div className={containerStyles.listWrapper}>
            {showCurrentMonth && (
              <CurrentMonth currentMonth={currentMonth} theme={theme} />
            )}
            {showTodayHelper && (
              <Today
                scrollToDate={this.scrollToDate}
                show={showToday}
                today={today}
                theme={theme}
                todayLabel={locale.todayLabel.long}
              />
            )}
            <MonthList
              ref={this._MonthList}
              DayComponent={DayComponent}
              disabledDates={disabledDates}
              disabledDays={disabledDays}
              height={height}
              isScrolling={isScrolling}
              locale={locale}
              maxDate={this._maxDate}
              min={this._min}
              minDate={this._minDate}
              months={this.months}
              onScroll={this.handleScroll}
              overscanMonthCount={overscanMonthCount}
              passThrough={passThrough}
              theme={theme}
              today={today}
              rowHeight={rowHeight}
              selected={validSelection}
              scrollDate={scrollDate}
              showOverlay={showOverlay}
              width={width}
              initialScrollDate={initialScrollDate}
            />
          </div>
          {display === 'quarters' && (
            <QuartersComponent
              height={height}
              hideOnSelect={false}
              locale={locale}
              max={this._max}
              maxDate={this._maxDate}
              min={this._min}
              minDate={this._minDate}
              scrollToDate={this.scrollToDate}
              selected={validSelection}
              setDisplay={this.setDisplay}
              showMonths={showMonthsForYears}
              theme={theme}
              today={today}
              width={width}
              years={range(
                this._min.getFullYear(),
                this._max.getFullYear() + 1
              )}
              fiscalYearStart={fiscalYearStart}
              {...passThrough.Quarters}
            />
          )}
          {display === 'years' && (
            <YearsComponent
              height={height}
              hideOnSelect={hideYearsOnSelect}
              locale={locale}
              max={this._max}
              maxDate={this._maxDate}
              min={this._min}
              minDate={this._minDate}
              scrollToDate={this.scrollToDate}
              selected={validSelection}
              setDisplay={this.setDisplay}
              showMonths={showMonthsForYears}
              theme={theme}
              today={today}
              width={width}
              years={range(
                this._min.getFullYear(),
                this._max.getFullYear() + 1
              )}
              {...passThrough.Years}
            />
          )}
        </div>
      </div>
    );
  }
}
