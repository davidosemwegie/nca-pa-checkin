import { useMutation, useQueryClient } from "react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import moment from "moment";
import { MAX_WEEKLY_DEFICIT_MINUTES } from "../../lib/prayer-session-utils";

interface MakeupCheckoutParams {
  checkinId: string;
  startTime: string;
  maxMinutesAllowed: number;
}

export const useMakeupCheckoutMutation = () => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();

  const makeupCheckout = async (params: MakeupCheckoutParams) => {
    const { checkinId, startTime, maxMinutesAllowed } = params;

    const now = moment();
    const start = moment(startTime);
    let checkoutTime = now;

    // Calculate actual duration
    let durationMinutes = now.diff(start, "minutes");

    // Cap the duration at the maximum allowed makeup time
    if (durationMinutes > maxMinutesAllowed) {
      durationMinutes = maxMinutesAllowed;
      checkoutTime = moment(start).add(maxMinutesAllowed, "minutes");
    }

    // Also cap at the weekly deficit limit
    if (durationMinutes > MAX_WEEKLY_DEFICIT_MINUTES) {
      durationMinutes = MAX_WEEKLY_DEFICIT_MINUTES;
      checkoutTime = moment(start).add(MAX_WEEKLY_DEFICIT_MINUTES, "minutes");
    }

    const checkoutTimeStr = checkoutTime.toISOString();

    const { error } = await supabase
      .from("checkin")
      .update({
        checkout_time: checkoutTimeStr,
        effective_checkout_time: checkoutTimeStr,
        minutes_made_up: durationMinutes,
      })
      .eq("id", checkinId);

    if (error) {
      console.error("Makeup checkout error:", error);
      throw new Error(error.message);
    }

    return {
      minutesMadeUp: durationMinutes,
    };
  };

  return useMutation(makeupCheckout, {
    onSuccess: (data) => {
      alert(`Makeup session completed! You made up ${data.minutesMadeUp} minutes.`);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries("weekly-prayer-stats");
      queryClient.invalidateQueries("user-events");
      queryClient.invalidateQueries("admin-user-events");
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to complete makeup session");
    },
  });
};
