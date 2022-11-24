import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

const useGetActiveEvents = () => {
  const supabase = useSupabaseClient();
  const [data, setData] = useState<Event[]>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  async function getData() {
    setLoading(true);
    let { data, error } = await supabase.from("events").select("*");
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
  };
};

export { useGetActiveEvents };
