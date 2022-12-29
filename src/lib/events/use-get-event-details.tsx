import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Checkin, Event, EventType } from "../../types";

export interface UseGetInterfaceData {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  checkin: Omit<Checkin, "id">[];
}

const useGetEventDetails = (id: string) => {
  const supabase = useSupabaseClient();
  const [data, setData] = useState<UseGetInterfaceData[]>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [dailyEvents, setDailyEvents] = useState<string[]>();
  const [eventName, setEventName] = useState<string>();
  const [activeEvents, setActiveEvents] = useState<string[]>();

  const session = useSession();

  async function getData(id: string) {
    setLoading(true);
    let { data, error } = await supabase
      .from("users")
      .select("*, checkin(checkin_time, checkout_time, event_id, events(type))")
      .eq("checkin.event_id", id)
      .eq("role", "REGULAR");

    if (data) setData(data);
    if (error) setError(error);
    setLoading(false);
  }
  useEffect(() => {
    getData(id);
  }, []);

  async function getDailyEvents() {
    setLoading(true);

    let { data, error } = await supabase.from("events").select("*");
    // .eq("type", EventType.DAILY);

    if (data) {
      setDailyEvents(() =>
        data
          ?.filter((event) => event.type === EventType.DAILY)
          .map((event) => event.id)
      );
      setActiveEvents(() =>
        data?.filter((event) => event.active === true).map((event) => event.id)
      );
      setEventName(() => data?.find((event) => event.id === id)?.title);
    }
    if (error) setError(error);
    setLoading(false);
  }

  useEffect(() => {
    getDailyEvents();
  }, []);

  return {
    data,
    error,
    loading,
    refetch: getData,
    dailyEvents,
    eventName,
    activeEvents,
  };
};

export { useGetEventDetails };
