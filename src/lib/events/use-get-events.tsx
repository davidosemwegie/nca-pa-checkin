import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Event } from "../../types";

export interface UseGetInterfaceData extends Event {}

const useGetEvents = () => {
  const supabase = useSupabaseClient();
  const [data, setData] = useState<UseGetInterfaceData[]>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  const session = useSession();

  async function getData() {
    setLoading(true);
    let { data, error } = await supabase
      .from("events")
      .select("*, checkin (id, checkin_time, checkout_time)")
      .eq("checkin.user_id", session?.user.id)
      .eq("active", true);

    if (data) setData(data);
    if (error) setError(error);
    setLoading(false);
  }
  useEffect(() => {
    getData();
  }, []);

  return {
    data,
    error,
    loading,
    refetch: getData,
  };
};

export { useGetEvents };
