const MAX_BOOKING_DAYS_AHEAD = 30;

export function getTodayKey() {
  return formatDateKey(new Date());
}

export function buildRollingAvailableSlots(expert, bookedSet, limit = 3) {
  const groups = [];
  const todayKey = getTodayKey();

  for (let dayOffset = 0; dayOffset <= MAX_BOOKING_DAYS_AHEAD && groups.length < limit; dayOffset += 1) {
    const date = addDays(parseDateKey(todayKey), dayOffset);
    const dateKey = formatDateKey(date);
    const times = getTimesForDate(expert, dateKey);

    if (times.length === 0) continue;

    const slots = times.map((time) => ({
      time,
      booked: bookedSet.has(`${dateKey}|${time}`)
    }));

    if (slots.some((slot) => !slot.booked)) {
      groups.push({ date: dateKey, slots });
    }
  }

  return groups;
}

export function isBookableSlot(expert, dateKey, timeSlot) {
  const todayKey = getTodayKey();
  const daysAhead = getDaysBetween(todayKey, dateKey);

  if (daysAhead < 0 || daysAhead > MAX_BOOKING_DAYS_AHEAD) {
    return false;
  }

  return getTimesForDate(expert, dateKey).includes(timeSlot);
}

function getTimesForDate(expert, dateKey) {
  const templates = getSlotTemplates(expert);

  if (templates.length === 0) {
    return [];
  }

  const firstTemplateDate = templates[0].date;
  const daysFromTemplateStart = Math.max(0, getDaysBetween(firstTemplateDate, dateKey));
  const templateIndex = daysFromTemplateStart % templates.length;

  return templates[templateIndex].times;
}

function getSlotTemplates(expert) {
  return (expert.availableSlots || [])
    .filter((group) => Array.isArray(group.times) && group.times.length > 0)
    .slice()
    .sort((firstGroup, secondGroup) => firstGroup.date.localeCompare(secondGroup.date));
}

function getDaysBetween(startDateKey, endDateKey) {
  const startDate = parseDateKey(startDateKey);
  const endDate = parseDateKey(endDateKey);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round((endDate - startDate) / millisecondsPerDay);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}