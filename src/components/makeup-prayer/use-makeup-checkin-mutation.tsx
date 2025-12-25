import { useMutation, useQueryClient } from "react-query";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import moment from "moment";
import { getWeekStart } from "../../lib/prayer-session-utils";

interface MakeupCheckinResult {
  checkinId: string;
  startTime: string;
}

export const useMakeupCheckinMutation = () => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const session = useSession();

  const makeupCheckin = async (eventId: string): Promise<MakeupCheckinResult> => {
    if (!session?.user?.id) {
      throw new Error("You must be logged in to check in");
    }

    const now = moment();
    const checkinTime = now.toISOString();
    const weekStart = getWeekStart(now).toISOString();

    const { data, error } = await supabase
      .from("checkin")
      .insert([
        {
          event_id: eventId,
          user_id: session.user.id,
          checkin_time: checkinTime,
          effective_checkin_time: checkinTime,
          session_type: null, // Makeup sessions don't have a specific session type
          is_makeup: true,
          week_start: weekStart,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Makeup checkin error:", error);
      throw new Error(error.message);
    }

    return {
      checkinId: data.id,
      startTime: checkinTime,
    };
  };

  return useMutation(makeupCheckin, {
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries("weekly-prayer-stats");
      queryClient.invalidateQueries("user-events");
      queryClient.invalidateQueries("admin-user-events");
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to start makeup session");
    },
  });
};
