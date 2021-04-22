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
        background: 'rgba(105, 74, 228, 0.91)',
        chevron: '#FFA726',
        color: '#FFF',
      },
      headerColor: 'rgb(127, 95, 251)',
      selectionColor: 'rgb(146, 118, 255)',
      textColor: {
        active: '#FFF',
        default: '#333',
      },
      weekdayColor: 'rgb(146, 118, 255)',
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