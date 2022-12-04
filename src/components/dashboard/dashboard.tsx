import { useSession } from "@supabase/auth-helpers-react";
import React, { useEffect } from "react";
import { useGetEvents } from "../../lib/events/use-get-events";
import { EventType } from "../../types";
import { EventCard } from "../event-card";
import { Nav } from "./nav";

const Dashboard = () => {
  const { data, loading, error, refetch } = useGetEvents();
  const session = useSession();

  if (loading) return <div>Loading...</div>;

  if (error && !session) return <div>Please login</div>;

  if (error)
    return (
      <div>
        Something went wrong, please reach out to Pastor Idy to check in
      </div>
    );

  return (
    <div className="dashboard-container my-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Prayer Alerts</h1>
        {data
          ?.filter((value) => value.type === EventType.PRAYER_ALERT)
          .map((item) => (
            <EventCard key={item.id} refetch={refetch} {...item} />
          ))}
      </div>

      <div>
        <h1 className="text-2xl font-bold">Daily Prayers</h1>
        {data
          ?.filter((value) => value.type === EventType.DAILY)
          .map((item) => (
            <EventCard key={item.id} refetch={refetch} {...item} />
          ))}
      </div>
    </div>
  );
};

export { Dashboard };
