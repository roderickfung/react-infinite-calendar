/* eslint-disable sort-keys */
import React from 'react';
import { addDecorator, storiesOf } from '@storybook/react';
import InfiniteCalendar, {
  Calendar,
  defaultMultipleDateInterpolation,
  withDateSelection,
  withKeyboardSupport,
  withMultipleDates,
  withRange,
  withMonthRange,
} from '..';
import styles from './stories.scss';

// Date manipulation utils
import {
  addDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  addMonths,
  endOfMonth,
  format,
  isBefore,
  subMonths,
} from 'date-fns';


const today = new Date();

storiesOf('Display Options', module)
.add('Landscape Layout', () => (
  <InfiniteCalendar
    displayOptions={{
      layout: 'landscape',
    }}
    width={600}
    height={350}
  />
))
.add('Disable Header', () => (
  <InfiniteCalendar
    displayOptions={{
      showHeader: false,
    }}
  />
))
.add('Disable Header Animation', () => (
  <InfiniteCalendar
    displayOptions={{
      shouldHeaderAnimate: false,
    }}
  />
))
.add('Disable Month Overlay', () => (
  <InfiniteCalendar
    displayOptions={{
      showOverlay: false,
    }}
  />
))
.add('Disable Floating Today Helper', () => (
  <InfiniteCalendar
    displayOptions={{
      showTodayHelper: false,
    }}
  />
))
.add('Show Current Month', () => (
  <InfiniteCalendar
    displayOptions={{
      showTodayHelper: false,
      showCurrentMonth: true,
      showOverlay: false,
    }}
  />
))
.add('Hide Months in Year Selection', () => (
  <InfiniteCalendar
    display={'years'}
    displayOptions={{
      showMonthsForYears: false,
    }}
  />
))
.add('Hide Weekdays Helper', () => (
  <InfiniteCalendar
    displayOptions={{
      showWeekdays: false,
    }}
  />
));