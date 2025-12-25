import { useMutation } from "react-query";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useShowEventListQuery } from "./use-show-event-list-query";
import moment from "moment";
import {
    getCurrentPrayerSession,
    getEffectiveCheckinTime,
    PRAYER_SESSIONS,
} from "../../../lib/prayer-session-utils";
import { PrayerSessionType } from "../../../types";

interface CheckinParams {
    eventId: string;
    isMakeup?: boolean;
}

export const useCheckinMutation = () => {

    const { refetch } = useShowEventListQuery()

    const supabase = useSupabaseClient()
    const session = useSession()

    const checkIn = async (params: CheckinParams | string) => {
        // Support both old format (just id) and new format (object with params)
        const eventId = typeof params === 'string' ? params : params.eventId;
        const isMakeup = typeof params === 'string' ? false : params.isMakeup || false;

        const now = moment();
        const currentSession = getCurrentPrayerSession(now);

        // For regular check-ins (not makeup), validate prayer session time
        if (!isMakeup) {
            if (!currentSession || !currentSession.canCheckin) {
                const amSession = PRAYER_SESSIONS.AM;
                const pmSession = PRAYER_SESSIONS.PM;
                throw new Error(
                    `Check-in is only available during prayer sessions: ` +
                    `${amSession.startHour - 1}:${60 - amSession.earlyCheckinMinutes} AM - ${amSession.endHour}:00 AM or ` +
                    `${pmSession.startHour - 12 - 1}:${60 - pmSession.earlyCheckinMinutes} PM - ${pmSession.endHour - 12}:00 PM`
                );
            }
        }

        const checkinTime = now.toISOString();
        const sessionType: PrayerSessionType | null = currentSession?.sessionType || null;

        // Calculate effective check-in time (session start if early)
        let effectiveCheckinTime = checkinTime;
        if (sessionType && currentSession?.isWithinEarlyCheckin) {
            effectiveCheckinTime = getEffectiveCheckinTime(now, sessionType).toISOString();
        }

        return await supabase
            .from("checkin")
            .insert([
                {
                    event_id: eventId,
                    user_id: session?.user.id,
                    checkin_time: checkinTime,
                    session_type: sessionType,
                    is_makeup: isMakeup,
                    effective_checkin_time: effectiveCheckinTime,
                },
            ]);
    };

    return useMutation(checkIn, {
        onError: (error: Error) => {
            alert(error.message || 'Something went wrong, please try again');
        },
        onSettled: (data, error, variables, context) => {
            console.log({ variables, context, data, error });
            if (error) {
                // Error already handled in onError
                return;
            }
            if (data?.error?.details) {
                alert(data?.error?.details);
            } else if (data?.error) {
                alert("Something went wrong, please try again");
            } else {
                alert("You have checked in successfully");
                refetch();
            }
        },
    });
}
