import { useMutation } from "react-query";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useShowEventListQuery } from "./use-show-event-list-query";

export const useCheckinMutation = () => {

    const { refetch } = useShowEventListQuery()

    const supabase = useSupabaseClient()
    const session = useSession()
    const checkIn = async (id: string) => await supabase
        .from("checkin")
        .insert([
            {
                event_id: id,
                user_id: session?.user.id,
                checkin_time: new Date().toISOString(),
            },
        ])

    return useMutation(checkIn, {
        onError: () => {
            alert('something went wrong, please try again')
        },
        onSettled: (data, error, variables, context) => {
            console.log({ variables, context, data, error });
            if (error || data?.error?.details) {
                alert("Something went wrong, please try again");
            } else if (data?.error?.details) {
                alert(data?.error?.details);
            } else {
                alert("You have checked in successfully")
                refetch();
            }
        },
    })
}
