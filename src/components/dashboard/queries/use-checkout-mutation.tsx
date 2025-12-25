import { useMutation } from "react-query";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useShowEventListQuery } from "./use-show-event-list-query";
import moment from "moment";
import {
    getEffectiveCheckoutTime,
    getSessionTypeFromTime,
    SESSION_DURATION_MINUTES,
} from "../../../lib/prayer-session-utils";
import { PrayerSessionType } from "../../../types";

interface CheckoutParams {
    id: string;
    sessionType?: PrayerSessionType;
    checkinTime?: string;
}

export const useCheckoutMutation = () => {

    const { refetch } = useShowEventListQuery()

    const supabase = useSupabaseClient()

    const checkout = async (params: CheckoutParams | string) => {
        // Support both old format (just id) and new format (object with params)
        const id = typeof params === 'string' ? params : params.id;
        const sessionType = typeof params === 'string' ? undefined : params.sessionType;
        const checkinTime = typeof params === 'string' ? undefined : params.checkinTime;

        const now = moment();
        const checkoutTime = now.toISOString();

        // Calculate effective checkout time based on session type
        let effectiveCheckoutTime = checkoutTime;
        let actualSessionType = sessionType;

        // Try to determine session type from check-in time if not provided
        if (!actualSessionType && checkinTime) {
            actualSessionType = getSessionTypeFromTime(checkinTime) || undefined;
        }

        if (actualSessionType && checkinTime) {
            const effectiveCheckout = getEffectiveCheckoutTime(
                now,
                actualSessionType,
                moment(checkinTime)
            );
            effectiveCheckoutTime = effectiveCheckout.toISOString();
        }

        return await supabase
            .from("checkin")
            .update({
                checkout_time: checkoutTime,
                effective_checkout_time: effectiveCheckoutTime,
            })
            .eq('id', id);
    };

    return useMutation(checkout, {
        onError: () => {
            alert('Something went wrong, please try again');
        },
        onSettled: (data, error, variables, context) => {
            console.log({ variables, context, data, error });
            if (error || data?.error?.details) {
                alert("Something went wrong, please try again");
            } else if (data?.error?.details) {
                alert(data?.error?.details);
            } else {
                alert("You have checked out successfully");
                refetch();
            }
        },
    });
}

