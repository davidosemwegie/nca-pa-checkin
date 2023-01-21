import { useMutation } from "react-query";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useShowEventListQuery } from "./use-show-event-list-query";

export const useCheckoutMutation = () => {

    const { refetch } = useShowEventListQuery()

    const supabase = useSupabaseClient()
    const checkout = async (id: string) => await supabase
        .from("checkin")
        .update(
            {
                checkout_time: new Date().toISOString(),
            },
        )
        .eq('id', id)


    return useMutation(checkout, {
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
                alert("You have checked out successfully")
                refetch();
            }
        },
    })
}

