import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Event } from "../../types";

export interface UseGetInterfaceData extends Event {}

const useGetEventDetails = (id: string) => {
  const supabase = useSupabaseClient();
  const [data, setData] = useState<UseGetInterfaceData[]>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  const session = useSession();

  async function getData(id: string) {
    setLoading(true);
    let { data, error } = await supabase
      .from("users")
      .select("*, checkin(checkin_time, checkout_time)")
      .eq("checkin.event_id", id);

    if (data) setData(data);
    if (error) setError(error);
    setLoading(false);
  }
  useEffect(() => {
    getData(id);
  }, []);

  return {
    data,
    error,
    loading,
    refetch: getData,
  };
};

export { useGetEventDetails };
