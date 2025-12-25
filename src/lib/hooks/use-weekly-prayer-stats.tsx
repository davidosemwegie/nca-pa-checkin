import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "react-query";
import moment from "moment";
import {
  getWeekStart,
  getWeekEnd,
  calculateWeeklyPrayerTime,
  calculateExpectedWeeklyTime,
  calculateWeeklyDeficit,
  canDoMakeupSession,
  getMakeupTimeAvailable,
  MAX_WEEKLY_DEFICIT_MINUTES,
} from "../prayer-session-utils";
import { WeeklyPrayerStats } from "../../types";

export const useWeeklyPrayerStats = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const fetchWeeklyStats = async (): Promise<WeeklyPrayerStats | null> => {
    if (!session?.user?.id) {
      return null;
    }

    const now = moment();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);

    // Fetch all check-ins for the current week
    const { data: checkins, error } = await supabase
      .from("checkin")
      .select("id, checkin_time, checkout_time, is_makeup, effective_checkin_time, effective_checkout_time")
      .eq("user_id", session.user.id)
      .gte("checkin_time", weekStart.toISOString())
      .lte("checkin_time", weekEnd.toISOString());

    if (error) {
      console.error("Error fetching weekly check-ins:", error);
      throw error;
    }

    // Separate regular check-ins and makeup sessions
    const regularCheckins = (checkins || []).filter((c) => !c.is_makeup);
    const makeupCheckins = (checkins || []).filter((c) => c.is_makeup);

    // Calculate actual prayer time from regular sessions
    const actualMinutes = calculateWeeklyPrayerTime(
      regularCheckins.map((c) => ({
        checkin_time: c.effective_checkin_time || c.checkin_time,
        checkout_time: c.effective_checkout_time || c.checkout_time,
      })),
      weekStart
    );

    // Calculate makeup time used
    const makeupMinutesUsed = makeupCheckins.reduce((total, c) => {
      if (c.effective_checkin_time && c.effective_checkout_time) {
        const duration = moment(c.effective_checkout_time).diff(
          moment(c.effective_checkin_time),
          "minutes"
        );
        return total + Math.max(0, duration);
      }
      return total;
    }, 0);

    // Calculate expected time up to now
    const expectedMinutes = calculateExpectedWeeklyTime(weekStart, now);

    // Calculate deficit (not counting makeup time)
    const deficitMinutes = Math.max(0, expectedMinutes - actualMinutes);

    // Determine if they can do makeup (deficit exists and within weekly limit)
    const canMakeup =
      deficitMinutes > 0 &&
      deficitMinutes <= MAX_WEEKLY_DEFICIT_MINUTES &&
      makeupMinutesUsed < MAX_WEEKLY_DEFICIT_MINUTES;

    // Calculate remaining makeup time available
    const makeupTimeAvailable = Math.min(
      getMakeupTimeAvailable(deficitMinutes),
      MAX_WEEKLY_DEFICIT_MINUTES - makeupMinutesUsed
    );

    return {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      expectedMinutes,
      actualMinutes,
      deficitMinutes,
      makeupMinutesUsed,
      canMakeup,
      makeupTimeAvailable: Math.max(0, makeupTimeAvailable),
    };
  };

  return useQuery("weekly-prayer-stats", fetchWeeklyStats, {
    enabled: !!session?.user?.id,
    refetchInterval: 60000, // Refetch every minute
  });
};
