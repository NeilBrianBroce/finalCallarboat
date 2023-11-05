import { vesselFunctions } from './vessel.js';
import { routeFunctions } from './route.js';
import { scheduleFunctions } from './schedule.js';
import { bookingFunctions } from './booking.js';

const moduleSelected = document.getElementById('moduleSelected');
const moduleSelectedValue = moduleSelected.value;

console.log("moduleSelectedValue", moduleSelectedValue);

if (moduleSelectedValue == "vessel") {
  vesselFunctions();
}

if (moduleSelectedValue == "route") {
  routeFunctions();
}

if (moduleSelectedValue == "schedule") {
  scheduleFunctions();
}

if (moduleSelectedValue == "booking") {
  bookingFunctions();
}
