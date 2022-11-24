import React, { useEffect } from "react";
import { useGetEvents } from "../../lib/events/use-get-events";
import { EventType } from "../../types";
import { EventCard } from "../event-card";
import { Nav } from "./nav";

const Dashboard = () => {
  const { data, loading, error, refetch } = useGetEvents();

  if (loading) return <div>Loading...</div>;

  if (error)
    return (
      <div>
        Something went wrong, please reach out to Pastor Idy to check in
      </div>
    );

  return (
    <div>
      <Nav />
      <div>
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
    </div>
  );
};

export { Dashboard };
