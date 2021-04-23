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
storiesOf('Customization', module)
.add('Theming', () => (
  <InfiniteCalendar
    theme={{
      floatingNav: {
        background: 'red',
        chevron: '#FFA726',
        color: '#FFF',
      },
      headerColor: '#222222',
      selectionColor: 'orange',
      textColor: {
        active: '#FFF',
        default: '#FFF',
      },
      todayColor: 'orange',
      floatingWeekdayColor: '#333333',
    }}
  />
))
.add('Flexible Size', () => (
  <InfiniteCalendar
    width={'94%'}
    height={window.innerHeight - 147}
    rowHeight={70}
  />
))
.add('Select Year First', () => (
  <InfiniteCalendar display={'years'} selected={null} />
))
.add('Dynamic Selection Color', () => (
  <InfiniteCalendar
    selected={addDays(today, -1)}
    theme={{
      selectionColor: date => {
        return isBefore(date, today) ? '#EC6150' : '#559FFF';
      },
    }}
  />
));