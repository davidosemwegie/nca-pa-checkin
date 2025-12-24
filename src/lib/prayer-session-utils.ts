import moment from "moment";

// Prayer session configurations
export const PRAYER_SESSIONS = {
  AM: {
    name: "Morning Prayer",
    startHour: 5, // 5:00 AM
    endHour: 6, // 6:00 AM
    earlyCheckinMinutes: 15, // Can check in 15 minutes early (4:45 AM)
  },
  PM: {
    name: "Evening Prayer",
    startHour: 19, // 7:00 PM
    endHour: 20, // 8:00 PM
    earlyCheckinMinutes: 15, // Can check in 15 minutes early (6:45 PM)
  },
} as const;

// Maximum weekly deficit allowed in minutes
export const MAX_WEEKLY_DEFICIT_MINUTES = 60;

// Full session duration in minutes
export const SESSION_DURATION_MINUTES = 60;

export type PrayerSessionType = "AM" | "PM";

export interface PrayerSessionWindow {
  sessionType: PrayerSessionType;
  sessionStart: moment.Moment;
  sessionEnd: moment.Moment;
  earlyCheckinStart: moment.Moment;
  isWithinEarlyCheckin: boolean;
  isWithinSession: boolean;
  isSessionActive: boolean;
  canCheckin: boolean;
}

/**
 * Get the current prayer session window based on the current time
 */
export function getCurrentPrayerSession(
  now: moment.Moment = moment()
): PrayerSessionWindow | null {
  const currentHour = now.hour();
  const currentMinute = now.minute();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  for (const [sessionType, config] of Object.entries(PRAYER_SESSIONS)) {
    const sessionStartMinutes = config.startHour * 60;
    const sessionEndMinutes = config.endHour * 60;
    const earlyCheckinStartMinutes =
      sessionStartMinutes - config.earlyCheckinMinutes;

    // Check if current time is within the early check-in window or session
    if (
      currentTimeInMinutes >= earlyCheckinStartMinutes &&
      currentTimeInMinutes < sessionEndMinutes
    ) {
      const sessionStart = moment(now).startOf("day").hour(config.startHour);
      const sessionEnd = moment(now).startOf("day").hour(config.endHour);
      const earlyCheckinStart = moment(sessionStart).subtract(
        config.earlyCheckinMinutes,
        "minutes"
      );

      const isWithinEarlyCheckin =
        currentTimeInMinutes >= earlyCheckinStartMinutes &&
        currentTimeInMinutes < sessionStartMinutes;
      const isWithinSession =
        currentTimeInMinutes >= sessionStartMinutes &&
        currentTimeInMinutes < sessionEndMinutes;

      return {
        sessionType: sessionType as PrayerSessionType,
        sessionStart,
        sessionEnd,
        earlyCheckinStart,
        isWithinEarlyCheckin,
        isWithinSession,
        isSessionActive: isWithinEarlyCheckin || isWithinSession,
        canCheckin: isWithinEarlyCheckin || isWithinSession,
      };
    }
  }

  return null;
}

/**
 * Get the next upcoming prayer session
 */
export function getNextPrayerSession(
  now: moment.Moment = moment()
): PrayerSessionWindow | null {
  const currentHour = now.hour();
  const currentMinute = now.minute();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Check AM session
  const amEarlyStart =
    PRAYER_SESSIONS.AM.startHour * 60 - PRAYER_SESSIONS.AM.earlyCheckinMinutes;
  if (currentTimeInMinutes < amEarlyStart) {
    const sessionStart = moment(now)
      .startOf("day")
      .hour(PRAYER_SESSIONS.AM.startHour);
    const sessionEnd = moment(now)
      .startOf("day")
      .hour(PRAYER_SESSIONS.AM.endHour);
    const earlyCheckinStart = moment(sessionStart).subtract(
      PRAYER_SESSIONS.AM.earlyCheckinMinutes,
      "minutes"
    );

    return {
      sessionType: "AM",
      sessionStart,
      sessionEnd,
      earlyCheckinStart,
      isWithinEarlyCheckin: false,
      isWithinSession: false,
      isSessionActive: false,
      canCheckin: false,
    };
  }

  // Check PM session
  const pmEarlyStart =
    PRAYER_SESSIONS.PM.startHour * 60 - PRAYER_SESSIONS.PM.earlyCheckinMinutes;
  if (currentTimeInMinutes < pmEarlyStart) {
    const sessionStart = moment(now)
      .startOf("day")
      .hour(PRAYER_SESSIONS.PM.startHour);
    const sessionEnd = moment(now)
      .startOf("day")
      .hour(PRAYER_SESSIONS.PM.endHour);
    const earlyCheckinStart = moment(sessionStart).subtract(
      PRAYER_SESSIONS.PM.earlyCheckinMinutes,
      "minutes"
    );

    return {
      sessionType: "PM",
      sessionStart,
      sessionEnd,
      earlyCheckinStart,
      isWithinEarlyCheckin: false,
      isWithinSession: false,
      isSessionActive: false,
      canCheckin: false,
    };
  }

  // Next session is tomorrow's AM
  const tomorrowAMStart = moment(now)
    .add(1, "day")
    .startOf("day")
    .hour(PRAYER_SESSIONS.AM.startHour);
  const tomorrowAMEnd = moment(now)
    .add(1, "day")
    .startOf("day")
    .hour(PRAYER_SESSIONS.AM.endHour);
  const tomorrowAMEarlyStart = moment(tomorrowAMStart).subtract(
    PRAYER_SESSIONS.AM.earlyCheckinMinutes,
    "minutes"
  );

  return {
    sessionType: "AM",
    sessionStart: tomorrowAMStart,
    sessionEnd: tomorrowAMEnd,
    earlyCheckinStart: tomorrowAMEarlyStart,
    isWithinEarlyCheckin: false,
    isWithinSession: false,
    isSessionActive: false,
    canCheckin: false,
  };
}

/**
 * Calculate the effective check-in time (session start if checked in early)
 */
export function getEffectiveCheckinTime(
  checkinTime: moment.Moment,
  sessionType: PrayerSessionType
): moment.Moment {
  const session = PRAYER_SESSIONS[sessionType];
  const sessionStart = moment(checkinTime)
    .startOf("day")
    .hour(session.startHour);

  // If checked in before session start, use session start time
  if (checkinTime.isBefore(sessionStart)) {
    return sessionStart;
  }

  return checkinTime;
}

/**
 * Calculate the effective checkout time (session end if auto-checkout)
 */
export function getEffectiveCheckoutTime(
  checkoutTime: moment.Moment | null,
  sessionType: PrayerSessionType,
  checkinTime: moment.Moment
): moment.Moment {
  const session = PRAYER_SESSIONS[sessionType];
  const sessionEnd = moment(checkinTime).startOf("day").hour(session.endHour);

  // If no checkout time or after session end, use session end time
  if (!checkoutTime || checkoutTime.isAfter(sessionEnd)) {
    return sessionEnd;
  }

  return checkoutTime;
}

/**
 * Calculate prayer time for a single check-in record
 * Returns time in minutes
 */
export function calculatePrayerTime(
  checkinTime: string,
  checkoutTime: string | null,
  sessionType: PrayerSessionType
): number {
  const checkin = moment(checkinTime);
  const checkout = checkoutTime ? moment(checkoutTime) : null;

  const effectiveCheckin = getEffectiveCheckinTime(checkin, sessionType);
  const effectiveCheckout = getEffectiveCheckoutTime(
    checkout,
    sessionType,
    checkin
  );

  const durationMinutes = effectiveCheckout.diff(effectiveCheckin, "minutes");

  // Cap at session duration
  return Math.min(Math.max(0, durationMinutes), SESSION_DURATION_MINUTES);
}

/**
 * Determine which session type a check-in belongs to based on time
 */
export function getSessionTypeFromTime(
  checkinTime: string
): PrayerSessionType | null {
  const time = moment(checkinTime);
  const hour = time.hour();

  // AM session: 4:45 AM - 6:00 AM
  if (hour >= 4 && hour < 6) {
    return "AM";
  }

  // Exact 6 AM could be end of AM session
  if (hour === 6 && time.minute() === 0) {
    return "AM";
  }

  // PM session: 6:45 PM - 8:00 PM (18:45 - 20:00)
  if (hour >= 18 && hour < 20) {
    return "PM";
  }

  // Exact 8 PM could be end of PM session
  if (hour === 20 && time.minute() === 0) {
    return "PM";
  }

  return null;
}

/**
 * Get the start of the current week (Sunday)
 */
export function getWeekStart(date: moment.Moment = moment()): moment.Moment {
  return moment(date).startOf("week");
}

/**
 * Get the end of the current week (Saturday end of day)
 */
export function getWeekEnd(date: moment.Moment = moment()): moment.Moment {
  return moment(date).endOf("week");
}

/**
 * Calculate total prayer time for a week from check-in records
 */
export function calculateWeeklyPrayerTime(
  checkins: Array<{ checkin_time: string; checkout_time: string | null }>,
  weekStart: moment.Moment
): number {
  const weekEnd = moment(weekStart).endOf("week");

  let totalMinutes = 0;

  for (const checkin of checkins) {
    const checkinTime = moment(checkin.checkin_time);

    // Only count check-ins within the week
    if (checkinTime.isBetween(weekStart, weekEnd, null, "[]")) {
      const sessionType = getSessionTypeFromTime(checkin.checkin_time);
      if (sessionType) {
        totalMinutes += calculatePrayerTime(
          checkin.checkin_time,
          checkin.checkout_time,
          sessionType
        );
      }
    }
  }

  return totalMinutes;
}

/**
 * Calculate expected prayer time for the week up to now
 * Each day has 2 sessions (AM & PM) = 120 minutes per day
 */
export function calculateExpectedWeeklyTime(
  weekStart: moment.Moment,
  now: moment.Moment = moment()
): number {
  const daysPassed = now.diff(weekStart, "days");
  const fullDays = Math.min(daysPassed, 7);

  // 2 sessions per day, 60 minutes each = 120 minutes per day
  let expectedMinutes = fullDays * 2 * SESSION_DURATION_MINUTES;

  // Add today's sessions that have already ended
  if (daysPassed < 7) {
    const currentHour = now.hour();

    // If AM session has ended (after 6 AM)
    if (currentHour >= PRAYER_SESSIONS.AM.endHour) {
      expectedMinutes += SESSION_DURATION_MINUTES;
    }

    // If PM session has ended (after 8 PM)
    if (currentHour >= PRAYER_SESSIONS.PM.endHour) {
      expectedMinutes += SESSION_DURATION_MINUTES;
    }
  }

  return expectedMinutes;
}

/**
 * Calculate weekly deficit (how many minutes were missed)
 */
export function calculateWeeklyDeficit(
  checkins: Array<{ checkin_time: string; checkout_time: string | null }>,
  weekStart: moment.Moment,
  now: moment.Moment = moment()
): number {
  const actualTime = calculateWeeklyPrayerTime(checkins, weekStart);
  const expectedTime = calculateExpectedWeeklyTime(weekStart, now);

  return Math.max(0, expectedTime - actualTime);
}

/**
 * Check if a student can do a makeup session
 * They can only make up if they have a deficit and haven't exceeded the max
 */
export function canDoMakeupSession(weeklyDeficit: number): boolean {
  return weeklyDeficit > 0 && weeklyDeficit <= MAX_WEEKLY_DEFICIT_MINUTES;
}

/**
 * Get makeup time available (capped at MAX_WEEKLY_DEFICIT_MINUTES)
 */
export function getMakeupTimeAvailable(weeklyDeficit: number): number {
  return Math.min(weeklyDeficit, MAX_WEEKLY_DEFICIT_MINUTES);
}

/**
 * Format time for display
 */
export function formatMinutesToDisplay(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Get prayer session status message
 */
export function getPrayerSessionStatus(now: moment.Moment = moment()): string {
  const currentSession = getCurrentPrayerSession(now);

  if (currentSession) {
    if (currentSession.isWithinEarlyCheckin) {
      return `${PRAYER_SESSIONS[currentSession.sessionType].name} starts at ${currentSession.sessionStart.format("h:mm A")}. You can check in now!`;
    }
    if (currentSession.isWithinSession) {
      return `${PRAYER_SESSIONS[currentSession.sessionType].name} is in progress. Ends at ${currentSession.sessionEnd.format("h:mm A")}.`;
    }
  }

  const nextSession = getNextPrayerSession(now);
  if (nextSession) {
    const timeUntil = nextSession.earlyCheckinStart.diff(now, "minutes");
    if (timeUntil > 60) {
      return `Next prayer session: ${PRAYER_SESSIONS[nextSession.sessionType].name} at ${nextSession.sessionStart.format("h:mm A")}`;
    }
    return `${PRAYER_SESSIONS[nextSession.sessionType].name} check-in opens in ${timeUntil} minutes`;
  }

  return "No upcoming prayer sessions";
}
