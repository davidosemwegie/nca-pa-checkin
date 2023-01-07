import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Event } from "../../types";
import { useGetUser } from "./use-get-user";

export interface UseGetInterfaceData extends Event {}

const useGetEvents = () => {
  const supabase = useSupabaseClient();
  const [data, setData] = useState<UseGetInterfaceData[]>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  const { isAdmin } = useGetUser();

  const session = useSession();

  async function getData() {
    setLoading(true);
    let { data, error } = await supabase
      .from("events")
      .select("*, checkin (id, checkin_time, checkout_time)")
      .eq("checkin.user_id", session?.user.id)
      .eq("active", true)
      .order("active_date_time", { ascending: false });

    if (data) setData(data);
    if (error) setError(error);
    setLoading(false);
  }

  async function getAllEvents() {
    setLoading(true);

    // Sort by active start date
    let { data, error } = await supabase
      .from("events")
      .select("*, checkin (id, checkin_time, checkout_time)")
      .eq("checkin.user_id", session?.user.id)
      .order("active_date_time", { ascending: false });

    if (data) setData(data);
    if (error) setError(error);
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) {
      getAllEvents();
    } else {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  return {
    data,
    error,
    loading,
    refetch: getData,
  };
};

export { useGetEvents };
