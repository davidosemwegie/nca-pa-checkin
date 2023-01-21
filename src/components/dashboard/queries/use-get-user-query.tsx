import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "react-query";

export const useGetUserQuery = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    const fetcher = async () => await supabase
        .from("users")
        .select("*")
        .eq("id", session?.user.id).single()

    const { data, isLoading, error } = useQuery("user", fetcher);



    return {
        loading: isLoading,
        data,
        error,
        isAdmin: data?.data?.role === "ADMIN",
        firstName: data?.data?.first_name,
    }
}