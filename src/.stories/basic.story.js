import React from 'react';
import { storiesOf } from '@storybook/react';
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
import { addDays, addMonths, endOfMonth, subMonths } from 'date-fns';

const today = new Date();

export default {
  title: 'Basic settings',
  component: InfiniteCalendar,
};

const Template = (args) => <InfiniteCalendar {...args} />;

export const DefaultConfiguration = Template.bind({});
DefaultConfiguration.args = {};

export const InitiallySelectedDate = Template.bind({});
InitiallySelectedDate.args = {
  selected: addDays(today, 5),
};
export const BlankInitialState = Template.bind({});
BlankInitialState.args = {
  selected: null,
};

export const MinDate = Template.bind({});
MinDate.args = {
  min: subMonths(today, 1), // Minimum month to render
  minDate: addDays(today, 1), // Minimum selectable date
  selected: addDays(today, 5),
};

export const MaxDate = Template.bind({});
MaxDate.args = {
  max: endOfMonth(addMonths(today, 1)), // Maximum rendered month
  maxDate: today, // Maximum selectable date
};

export const DisableSpecificDates = Template.bind({});
DisableSpecificDates.args = {
  disabledDates: [-10, -5, -6, 5, 6, 7, 2].map((amount) =>
    addDays(today, amount)
  ),
};

export const DisableSpecificWeekdays = Template.bind({});
DisableSpecificWeekdays.args = {
  disabledDates: [-10, -5, -6, 5, 6, 7, 2].map((amount) =>
    addDays(today, amount)
  ),
};
