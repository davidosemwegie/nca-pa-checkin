import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export interface UseGetUserData {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

const useGetUser = () => {
  const supabase = useSupabaseClient();
  const [data, setData] = useState<UseGetUserData>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const session = useSession();

  async function getData() {
    setLoading(true);
    let { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", session?.user.id);

    if (data) setData(data[0]);
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
    isAdmin: data?.role === "ADMIN",
  };
};

export { useGetUser };
