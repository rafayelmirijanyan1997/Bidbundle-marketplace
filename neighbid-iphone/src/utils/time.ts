export const APP_TIME_ZONE = 'America/Los_Angeles';

function losAngelesHour(date = new Date()) {
  const hourText = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: APP_TIME_ZONE,
  }).format(date);
  return Number(hourText);
}

export function getLosAngelesGreeting(date = new Date()) {
  const hour = losAngelesHour(date);
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}
