import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "react-query";
import { useGetUserQuery } from "./use-get-user-query";


export const useShowEventListQuery = () => {
    const { isAdmin } = useGetUserQuery()
    const supabase = useSupabaseClient()
    const session = useSession()



    const fetchNonAdminEventsList = async () => await supabase
        .from("events")
        .select("*, checkin (id, checkin_time, checkout_time)")
        .eq("checkin.user_id", session?.user.id)
        .eq("active", true)
        .order("active_date_time", { ascending: false });

    const fetchAdminEventList = async () => await supabase
        .from("events")
        .select("*, checkin (id, checkin_time, checkout_time)")
        .eq("checkin.user_id", session?.user.id)
        .order("active_date_time", { ascending: false });

    const queryKey = isAdmin ? 'admin-user-events' : 'user-events'
    const fetcher = isAdmin ? fetchAdminEventList : fetchNonAdminEventsList

    return useQuery(queryKey, fetcher)
}