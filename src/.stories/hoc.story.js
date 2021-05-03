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

storiesOf('Higher Order Components', module)
.add('Range selection', () => (
  <InfiniteCalendar
    selected={{
      start: addDays(new Date(), 2),
      end: addDays(new Date(), 17),
    }}
    locale={{
      headerFormat: 'MMM Do',
    }}
    Component={withRange(withKeyboardSupport(Calendar))}
  />
))
.add('Weekly selection', () => (
  <InfiniteCalendar
    isWeeklySelection
    selected={startOfWeek(new Date())}
    locale={{
      headerFormat: 'MMM Do',
    }}
    Component={withDateSelection(Calendar)}
    min={subMonths(new Date(), 10)}
    max={addMonths(new Date(), 10)}
    minDate={subMonths(new Date(), 3)}
    maxDate={addMonths(new Date(), 3)}
  />
))
.add('Week Range selection', () => (
  <InfiniteCalendar
    isWeeklySelection
    selected={{
      start: startOfWeek(new Date()),
      end: addWeeks(endOfWeek(new Date()), 2),
    }}
    locale={{
      headerFormat: 'MMM Do',
    }}
    Component={withRange(Calendar)}
  />
))
.add('Monthly selection', () => (
  <InfiniteCalendar
    selected={new Date()}
    display={'years'}
    displayOptions={{
      showHeader: false,
      hideYearsOnSelect: false,
    }}
    minDate={subMonths(new Date(), 10)}
    maxDate={addMonths(new Date(), 10)}
  />
))
.add('Month Range selection', () => (
  <InfiniteCalendar
    selected={{
      start: subMonths(new Date(), 1),
      end: addMonths(new Date(), 1),
    }}
    display={'years'}
    displayOptions={{
      showHeader: false,
      hideYearsOnSelect: false,
    }}
    minDate={subMonths(new Date(), 10)}
    maxDate={addMonths(new Date(), 10)}
    Component={withMonthRange(Calendar)}
  />
))
.add('Month Range selection with 5 selectable months', () => (
  <InfiniteCalendar
    selected={{
      start: subMonths(new Date(), 1),
      end: addMonths(new Date(), 1),
    }}
    display={'years'}
    displayOptions={{
      showHeader: false,
      hideYearsOnSelect: false,
    }}
    min={subMonths(new Date(), 2)}
    max={addMonths(new Date(), 2)}
    minDate={subMonths(new Date(), 2)}
    maxDate={addMonths(new Date(), 2)}
    Component={withMonthRange(Calendar)}
  />
))
.add('Multiple date selection', () => {
  return (
    <InfiniteCalendar
      selected={[
        addDays(today, -600),
        addDays(today, -200),
        today,
        addDays(today, 50),
        addDays(today, 400),
      ]}
      interpolateSelection={defaultMultipleDateInterpolation}
      Component={withMultipleDates(withKeyboardSupport(Calendar))}
    />
  );
})
.add('Keyboard Support', () => {
  return (
    <InfiniteCalendar
      Component={withDateSelection(withKeyboardSupport(Calendar))}
    />
  );
});
